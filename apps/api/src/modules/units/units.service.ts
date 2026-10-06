import {BadRequestException,ConflictException,Injectable,NotFoundException} from '@nestjs/common';
import {convertQuantity,UnitConversionError} from '@boul/domain';
import {Prisma} from '@prisma/client';
import {PrismaService} from '../../infrastructure/database/prisma.service.js';
import type {AuthPrincipal} from '../auth/auth.types.js';
import type {CreateUnitDto} from './dto/create-unit.dto.js';
import type {CreateConversionDto} from './dto/create-conversion.dto.js';
import type {ConvertQuantityDto} from './dto/convert-quantity.dto.js';

@Injectable()
export class UnitsService{
  constructor(private readonly prisma:PrismaService){}

  list(principal:AuthPrincipal){return this.prisma.unit.findMany({where:{organizationId:principal.organizationId,deletedAt:null},select:{id:true,code:true,name:true,symbol:true,dimension:true,decimalPlaces:true},orderBy:[{dimension:'asc'},{name:'asc'}]})}

  async create(principal:AuthPrincipal,input:CreateUnitDto){
    try{return await this.prisma.unit.create({data:{organizationId:principal.organizationId,code:input.code.toUpperCase(),name:input.name.trim(),symbol:input.symbol.trim(),dimension:input.dimension,decimalPlaces:input.decimalPlaces}})}
    catch(error){if(error instanceof Prisma.PrismaClientKnownRequestError&&error.code==='P2002')throw new ConflictException('Ce code unité existe déjà');throw error}
  }

  async createConversion(principal:AuthPrincipal,input:CreateConversionDto){
    if(input.fromUnitId===input.toUnitId)throw new BadRequestException('Les unités doivent être différentes');
    const units=await this.prisma.unit.findMany({where:{organizationId:principal.organizationId,id:{in:[input.fromUnitId,input.toUnitId]},deletedAt:null}});
    if(units.length!==2)throw new NotFoundException('Une unité est introuvable');
    const [from,to]=[units.find(unit=>unit.id===input.fromUnitId)!,units.find(unit=>unit.id===input.toUnitId)!];
    if(from.dimension!==to.dimension&&from.dimension!=='PACKAGE'&&to.dimension!=='PACKAGE')throw new BadRequestException('Dimensions incompatibles');
    if(new Prisma.Decimal(input.factor).lte(0))throw new BadRequestException('Le facteur doit être positif');
    if(input.materialId){const material=await this.prisma.rawMaterial.count({where:{id:input.materialId,organizationId:principal.organizationId,deletedAt:null}});if(!material)throw new NotFoundException('Matière introuvable')}
    const duplicate=await this.prisma.unitConversion.count({where:{organizationId:principal.organizationId,fromUnitId:input.fromUnitId,toUnitId:input.toUnitId,materialId:input.materialId??null}});
    if(duplicate)throw new ConflictException('Cette conversion existe déjà');
    return this.prisma.unitConversion.create({data:{organizationId:principal.organizationId,...input,factor:new Prisma.Decimal(input.factor)}});
  }

  async convert(principal:AuthPrincipal,input:ConvertQuantityDto){
    const [units,rules]=await Promise.all([
      this.prisma.unit.findMany({where:{organizationId:principal.organizationId,deletedAt:null},select:{id:true,dimension:true,decimalPlaces:true}}),
      this.prisma.unitConversion.findMany({where:{organizationId:principal.organizationId,OR:[{materialId:null},...(input.materialId?[{materialId:input.materialId}]:[])]},select:{fromUnitId:true,toUnitId:true,factor:true,materialId:true}}),
    ]);
    const target=units.find(unit=>unit.id===input.toUnitId);
    try{return {quantity:convertQuantity({quantity:input.quantity,fromUnitId:input.fromUnitId,toUnitId:input.toUnitId,materialId:input.materialId,units,rules:rules.map(rule=>({...rule,factor:rule.factor.toString()})),decimalPlaces:target?.decimalPlaces??6}),unitId:input.toUnitId}}
    catch(error){if(error instanceof UnitConversionError)throw new BadRequestException(error.message);throw error}
  }
}
