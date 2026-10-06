import {BadRequestException,ConflictException,Injectable,NotFoundException} from '@nestjs/common';
import {calculateRecipeCost,convertQuantity,RecipeCostError,UnitConversionError} from '@boul/domain';
import {Prisma,RecipeVersionStatus} from '@prisma/client';
import {PrismaService} from '../../infrastructure/database/prisma.service.js';
import type {AuthPrincipal} from '../auth/auth.types.js';
import type {CreateRecipeDto,CreateRecipeVersionDto,RecipeVersionDto} from './dto/create-recipe.dto.js';

@Injectable()
export class RecipesService{
  constructor(private readonly prisma:PrismaService){}

  async list(principal:AuthPrincipal){
    const recipes=await this.prisma.recipe.findMany({where:{organizationId:principal.organizationId,deletedAt:null},include:{product:{select:{id:true,name:true,salePrice:true}},versions:{orderBy:{version:'desc'},take:1,select:{id:true,version:true,status:true,yieldQuantity:true,materialCost:true,productionCost:true,unitCost:true,recommendedPrice:true,createdAt:true}}},orderBy:{name:'asc'}});
    return recipes.map(recipe=>{const latest=recipe.versions[0];const margin=latest&&recipe.product.salePrice>0?new Prisma.Decimal(recipe.product.salePrice).minus(latest.unitCost).div(recipe.product.salePrice).mul(100).toDecimalPlaces(2).toString():null;return {...recipe,latestVersion:latest??null,currentMarginPercent:margin,versions:undefined}})
  }

  detail(principal:AuthPrincipal,id:string){return this.prisma.recipe.findFirstOrThrow({where:{id,organizationId:principal.organizationId,deletedAt:null},include:{product:true,versions:{orderBy:{version:'desc'},include:{yieldUnit:true,ingredients:{include:{material:{select:{id:true,name:true,sku:true}},unit:true}}}}}})}

  async create(principal:AuthPrincipal,input:CreateRecipeDto){
    const duplicate=await this.prisma.recipe.count({where:{organizationId:principal.organizationId,name:input.name.trim(),deletedAt:null}});if(duplicate)throw new ConflictException('Cette recette existe déjà');
    const prepared=await this.prepare(principal,input,input.productId);
    return this.prisma.$transaction(async tx=>{
      const recipe=await tx.recipe.create({data:{organizationId:principal.organizationId,productId:input.productId,name:input.name.trim(),createdBy:principal.userId}});
      const version=await this.createVersion(tx,recipe.id,1,principal.userId,input,prepared);
      await tx.auditLog.create({data:{organizationId:principal.organizationId,actorId:principal.userId,action:'RECIPE_CREATED',entity:'Recipe',entityId:recipe.id,after:{version:1,unitCost:prepared.cost.unitCost}}});
      return {...recipe,version};
    });
  }

  async addVersion(principal:AuthPrincipal,recipeId:string,input:CreateRecipeVersionDto){
    const recipe=await this.prisma.recipe.findFirst({where:{id:recipeId,organizationId:principal.organizationId,deletedAt:null},include:{_count:{select:{versions:true}}}});if(!recipe)throw new NotFoundException('Recette introuvable');
    const prepared=await this.prepare(principal,input,recipe.productId);const versionNumber=recipe._count.versions+1;
    return this.prisma.$transaction(async tx=>{const version=await this.createVersion(tx,recipe.id,versionNumber,principal.userId,input,prepared);await tx.auditLog.create({data:{organizationId:principal.organizationId,actorId:principal.userId,action:'RECIPE_VERSION_CREATED',entity:'RecipeVersion',entityId:version.id,after:{recipeId,version:versionNumber,unitCost:prepared.cost.unitCost}}});return version});
  }

  async activate(principal:AuthPrincipal,recipeId:string,versionId:string){
    const version=await this.prisma.recipeVersion.findFirst({where:{id:versionId,recipeId,recipe:{organizationId:principal.organizationId,deletedAt:null}}});if(!version)throw new NotFoundException('Version introuvable');
    return this.prisma.$transaction(async tx=>{await tx.recipeVersion.updateMany({where:{recipeId,status:RecipeVersionStatus.ACTIVE},data:{status:RecipeVersionStatus.ARCHIVED}});const active=await tx.recipeVersion.update({where:{id:versionId},data:{status:RecipeVersionStatus.ACTIVE}});await tx.auditLog.create({data:{organizationId:principal.organizationId,actorId:principal.userId,action:'RECIPE_VERSION_ACTIVATED',entity:'RecipeVersion',entityId:versionId,after:{recipeId,version:active.version}}});return active});
  }

  private async prepare(principal:AuthPrincipal,input:RecipeVersionDto,productId:string){
    const product=await this.prisma.product.findFirst({where:{id:productId,organizationId:principal.organizationId,deletedAt:null}});if(!product)throw new NotFoundException('Produit final introuvable');
    if(new Set(input.ingredients.map(item=>item.materialId)).size!==input.ingredients.length)throw new BadRequestException('Une matière ne peut apparaître qu’une fois par version');
    const [materials,units,rules,yieldUnit]=await Promise.all([
      this.prisma.rawMaterial.findMany({where:{id:{in:input.ingredients.map(item=>item.materialId)},organizationId:principal.organizationId,deletedAt:null},include:{baseUnitRef:true}}),
      this.prisma.unit.findMany({where:{organizationId:principal.organizationId,deletedAt:null},select:{id:true,dimension:true}}),
      this.prisma.unitConversion.findMany({where:{organizationId:principal.organizationId},select:{fromUnitId:true,toUnitId:true,factor:true,materialId:true}}),
      this.prisma.unit.findFirst({where:{id:input.yieldUnitId,organizationId:principal.organizationId,deletedAt:null}}),
    ]);
    if(materials.length!==input.ingredients.length)throw new NotFoundException('Une matière est introuvable');if(!yieldUnit)throw new NotFoundException('Unité de rendement introuvable');
    try{
      const converted=input.ingredients.map(item=>{const material=materials.find(value=>value.id===item.materialId)!;if(!material.baseUnitId)throw new UnitConversionError(`L’unité de base de ${material.name} n’est pas configurée`);const quantity=convertQuantity({quantity:item.quantity,fromUnitId:item.unitId,toUnitId:material.baseUnitId,materialId:material.id,units,rules:rules.map(rule=>({...rule,factor:rule.factor.toString()}))});return {input,material,quantity}});
      const cost=calculateRecipeCost({yieldQuantity:input.yieldQuantity,overheadCost:input.overheadCost,sellingPrice:String(product.salePrice),targetMarginPercent:input.targetMarginPercent,ingredients:converted.map(item=>({id:item.material.id,name:item.material.name,quantityInBaseUnit:item.quantity,averageCostPerBaseUnit:item.material.averageCost.toString()}))});
      return {product,converted,cost};
    }catch(error){if(error instanceof UnitConversionError||error instanceof RecipeCostError)throw new BadRequestException(error.message);throw error}
  }

  private createVersion(tx:Prisma.TransactionClient,recipeId:string,version:number,userId:string,input:RecipeVersionDto,prepared:Awaited<ReturnType<RecipesService['prepare']>>){
    return tx.recipeVersion.create({data:{recipeId,version,yieldQuantity:new Prisma.Decimal(input.yieldQuantity),yieldUnitId:input.yieldUnitId,preparationMinutes:input.preparationMinutes,bakingMinutes:input.bakingMinutes,restingMinutes:input.restingMinutes,bakingTemperatureC:input.bakingTemperatureC?new Prisma.Decimal(input.bakingTemperatureC):null,equipment:input.equipment,instructions:input.instructions,overheadCost:new Prisma.Decimal(input.overheadCost),targetMarginPercent:new Prisma.Decimal(input.targetMarginPercent),materialCost:new Prisma.Decimal(prepared.cost.materialCost),productionCost:new Prisma.Decimal(prepared.cost.productionCost),unitCost:new Prisma.Decimal(prepared.cost.unitCost),recommendedPrice:Number(prepared.cost.recommendedPrice),createdBy:userId,ingredients:{create:prepared.converted.map((item,index)=>({materialId:item.material.id,quantity:new Prisma.Decimal(input.ingredients[index].quantity),unitId:input.ingredients[index].unitId,quantityInBaseUnit:new Prisma.Decimal(item.quantity),unitCostSnapshot:item.material.averageCost,totalCostSnapshot:new Prisma.Decimal(prepared.cost.ingredients[index].totalCost)}))}},include:{ingredients:true}})
  }
}
