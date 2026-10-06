import {BadRequestException,ConflictException,ForbiddenException,Injectable,NotFoundException} from '@nestjs/common';
import {allocateLandedCosts,calculateWeightedAverageCost,convertQuantity,UnitConversionError,WeightedAverageCostError} from '@boul/domain';
import {MovementType,Prisma,PurchaseStatus,ReceiptQualityStatus} from '@prisma/client';
import {PrismaService} from '../../infrastructure/database/prisma.service.js';
import type {AuthPrincipal} from '../auth/auth.types.js';
import type {CreatePurchaseDto,ReceivePurchaseDto} from './dto/purchase.dto.js';

@Injectable()
export class PurchasesService{
  constructor(private readonly prisma:PrismaService){}
  private assertSite(principal:AuthPrincipal,siteId:string){if(!principal.unrestrictedSites&&!principal.siteIds.includes(siteId))throw new ForbiddenException('Boutique hors de votre périmètre')}

  list(principal:AuthPrincipal){return this.prisma.purchaseOrder.findMany({where:{organizationId:principal.organizationId,...(!principal.unrestrictedSites?{siteId:{in:principal.siteIds}}:{})},include:{supplier:{select:{id:true,code:true,name:true}},site:{select:{id:true,name:true}},lines:{include:{material:{select:{id:true,name:true,sku:true,baseUnitRef:{select:{symbol:true}}}},purchaseUnit:{select:{symbol:true}}}}},orderBy:{orderedAt:'desc'},take:100})}
  lots(principal:AuthPrincipal){return this.prisma.stockLot.findMany({where:{organizationId:principal.organizationId,...(!principal.unrestrictedSites?{siteId:{in:principal.siteIds}}:{})},include:{material:{select:{name:true,sku:true,baseUnitRef:{select:{symbol:true}}}},site:{select:{name:true}},purchaseOrder:{select:{reference:true,supplier:{select:{name:true}}}}},orderBy:{createdAt:'desc'},take:100})}

  async create(principal:AuthPrincipal,input:CreatePurchaseDto){
    this.assertSite(principal,input.siteId);
    if(new Set(input.lines.map(line=>line.materialId)).size!==input.lines.length)throw new BadRequestException('Une matière ne peut apparaître qu’une fois');
    const [site,supplier,materials,units]=await Promise.all([
      this.prisma.site.findFirst({where:{id:input.siteId,organizationId:principal.organizationId,deletedAt:null}}),
      this.prisma.supplier.findFirst({where:{id:input.supplierId,organizationId:principal.organizationId,deletedAt:null,isActive:true}}),
      this.prisma.rawMaterial.findMany({where:{id:{in:input.lines.map(line=>line.materialId)},organizationId:principal.organizationId,deletedAt:null}}),
      this.prisma.unit.findMany({where:{id:{in:input.lines.map(line=>line.purchaseUnitId)},organizationId:principal.organizationId,deletedAt:null}}),
    ]);
    if(!site)throw new NotFoundException('Boutique introuvable');if(!supplier)throw new NotFoundException('Fournisseur introuvable');
    if(materials.length!==input.lines.length||units.length!==new Set(input.lines.map(line=>line.purchaseUnitId)).size)throw new NotFoundException('Matière ou unité introuvable');
    const lines=input.lines.map(line=>{const quantity=new Prisma.Decimal(line.orderedQuantity),price=new Prisma.Decimal(line.unitPrice);if(quantity.lte(0)||price.lt(0))throw new BadRequestException('Quantité ou prix invalide');return {...line,subtotal:quantity.mul(price)}});
    const subtotal=lines.reduce((sum,line)=>sum.plus(line.subtotal),new Prisma.Decimal(0));const charges=new Prisma.Decimal(input.transportCost).plus(input.taxCost).plus(input.otherCost);if(subtotal.lte(0))throw new BadRequestException('Le total des lignes doit être positif');
    try{return await this.prisma.$transaction(async tx=>{const purchase=await tx.purchaseOrder.create({data:{organizationId:principal.organizationId,siteId:input.siteId,supplierId:input.supplierId,reference:input.reference.trim().toUpperCase(),paymentType:input.paymentType,expectedAt:input.expectedAt?new Date(input.expectedAt):null,transportCost:new Prisma.Decimal(input.transportCost),taxCost:new Prisma.Decimal(input.taxCost),otherCost:new Prisma.Decimal(input.otherCost),subtotal,total:subtotal.plus(charges),notes:input.notes?.trim(),createdBy:principal.userId,lines:{create:lines.map(line=>({materialId:line.materialId,orderedQuantity:new Prisma.Decimal(line.orderedQuantity),purchaseUnitId:line.purchaseUnitId,unitPrice:new Prisma.Decimal(line.unitPrice),lineSubtotal:line.subtotal}))}},include:{lines:true,supplier:true,site:true}});await tx.auditLog.create({data:{organizationId:principal.organizationId,actorId:principal.userId,action:'PURCHASE_ORDER_CREATED',entity:'PurchaseOrder',entityId:purchase.id,after:{reference:purchase.reference,total:purchase.total.toString(),paymentType:purchase.paymentType}}});return purchase})}catch(error){if(error instanceof Prisma.PrismaClientKnownRequestError&&error.code==='P2002')throw new ConflictException('Cette référence d’achat existe déjà');throw error}
  }

  async receive(principal:AuthPrincipal,purchaseId:string,input:ReceivePurchaseDto){
    if(new Set(input.lines.map(line=>line.purchaseLineId)).size!==input.lines.length)throw new BadRequestException('Une ligne ne peut être réceptionnée qu’une fois par opération');
    try{return await this.prisma.$transaction(async tx=>{
      const purchase=await tx.purchaseOrder.findFirst({where:{id:purchaseId,organizationId:principal.organizationId},include:{lines:{include:{material:true}}}});if(!purchase)throw new NotFoundException('Achat introuvable');this.assertSite(principal,purchase.siteId);if(purchase.status!==PurchaseStatus.ORDERED&&purchase.status!==PurchaseStatus.PARTIALLY_RECEIVED)throw new ConflictException('Cet achat ne peut plus être réceptionné');
      const units=await tx.unit.findMany({where:{organizationId:principal.organizationId,deletedAt:null},select:{id:true,dimension:true}});const rules=await tx.unitConversion.findMany({where:{organizationId:principal.organizationId},select:{fromUnitId:true,toUnitId:true,factor:true,materialId:true}});
      const accepted=[] as string[];
      for(const receipt of input.lines){
        const line=purchase.lines.find(value=>value.id===receipt.purchaseLineId);if(!line)throw new NotFoundException('Ligne d’achat introuvable');
        const quantity=new Prisma.Decimal(receipt.quantity);if(quantity.lte(0))throw new BadRequestException('La quantité reçue doit être positive');if(line.receivedQuantity.plus(quantity).gt(line.orderedQuantity))throw new BadRequestException(`Réception supérieure à la commande pour ${line.material.name}`);
        if(receipt.qualityStatus===ReceiptQualityStatus.REJECTED)continue;
        if(!line.material.baseUnitId)throw new BadRequestException(`Unité de base absente pour ${line.material.name}`);
        let baseQuantity:string;try{baseQuantity=convertQuantity({quantity:quantity.toString(),fromUnitId:line.purchaseUnitId,toUnitId:line.material.baseUnitId,materialId:line.materialId,units,rules:rules.map(rule=>({...rule,factor:rule.factor.toString()}))})}catch(error){if(error instanceof UnitConversionError)throw new BadRequestException(error.message);throw error}
        const receiptSubtotal=quantity.mul(line.unitPrice);const landedCost=allocateLandedCosts(receiptSubtotal.toString(),purchase.subtotal.toString(),purchase.transportCost.plus(purchase.taxCost).plus(purchase.otherCost).toString());
        const average=calculateWeightedAverageCost({currentQuantity:line.material.quantity.toString(),currentAverageCost:line.material.averageCost.toString(),receivedQuantity:baseQuantity,receivedLandedCost:landedCost});
        const lot=await tx.stockLot.create({data:{organizationId:principal.organizationId,siteId:purchase.siteId,materialId:line.materialId,purchaseOrderId:purchase.id,purchaseLineId:line.id,lotNumber:receipt.lotNumber.trim().toUpperCase(),receivedQuantity:new Prisma.Decimal(baseQuantity),remainingQuantity:new Prisma.Decimal(baseQuantity),unitCost:new Prisma.Decimal(average.receivedUnitCost),expiresAt:receipt.expiresAt?new Date(receipt.expiresAt):null,qualityStatus:receipt.qualityStatus}});
        await tx.stockMovement.create({data:{organizationId:principal.organizationId,siteId:purchase.siteId,materialId:line.materialId,lotId:lot.id,type:MovementType.PURCHASE,quantity:new Prisma.Decimal(baseQuantity),unitCost:new Prisma.Decimal(average.receivedUnitCost),referenceType:'PurchaseOrder',referenceId:purchase.id,createdBy:principal.userId}});
        await tx.rawMaterial.update({where:{id:line.materialId},data:{quantity:new Prisma.Decimal(average.newQuantity),averageCost:new Prisma.Decimal(average.newAverageCost)}});
        const cumulativeBase=line.quantityInBaseUnit.plus(baseQuantity),cumulativeCost=line.landedCost.plus(landedCost);await tx.purchaseLine.update({where:{id:line.id},data:{receivedQuantity:{increment:quantity},quantityInBaseUnit:cumulativeBase,landedCost:cumulativeCost,unitCostInBaseUnit:cumulativeCost.div(cumulativeBase)}});accepted.push(line.id);
      }
      if(!accepted.length)throw new BadRequestException('Aucune ligne acceptée');
      const refreshed=await tx.purchaseLine.findMany({where:{purchaseOrderId:purchase.id}});const complete=refreshed.every(line=>line.receivedQuantity.gte(line.orderedQuantity));const status=complete?PurchaseStatus.RECEIVED:PurchaseStatus.PARTIALLY_RECEIVED;
      const updated=await tx.purchaseOrder.update({where:{id:purchase.id},data:{status,receivedAt:complete?new Date():null,receivedBy:principal.userId},include:{lines:true,supplier:true,site:true}});await tx.auditLog.create({data:{organizationId:principal.organizationId,actorId:principal.userId,action:'PURCHASE_RECEIVED',entity:'PurchaseOrder',entityId:purchase.id,after:{status,acceptedLines:accepted}}});return updated;
    },{isolationLevel:Prisma.TransactionIsolationLevel.Serializable})}catch(error){if(error instanceof UnitConversionError||error instanceof WeightedAverageCostError)throw new BadRequestException(error.message);if(error instanceof Prisma.PrismaClientKnownRequestError&&error.code==='P2002')throw new ConflictException('Ce numéro de lot existe déjà pour cette matière et cette boutique');throw error}
  }
}
