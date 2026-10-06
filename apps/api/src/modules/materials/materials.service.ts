import {BadRequestException,ConflictException,Injectable,NotFoundException} from '@nestjs/common';
import {Prisma} from '@prisma/client';
import {PrismaService} from '../../infrastructure/database/prisma.service.js';
import type {AuthPrincipal} from '../auth/auth.types.js';
import type {CreateMaterialCategoryDto} from './dto/create-material-category.dto.js';
import type {CreateMaterialDto} from './dto/create-material.dto.js';

@Injectable()
export class MaterialsService{
  constructor(private readonly prisma:PrismaService){}

  categories(principal:AuthPrincipal){return this.prisma.materialCategory.findMany({where:{organizationId:principal.organizationId,deletedAt:null},select:{id:true,name:true,_count:{select:{materials:true}}},orderBy:{name:'asc'}})}
  async createCategory(principal:AuthPrincipal,input:CreateMaterialCategoryDto){
    try{return await this.prisma.materialCategory.create({data:{organizationId:principal.organizationId,name:input.name.trim()}})}
    catch(error){if(error instanceof Prisma.PrismaClientKnownRequestError&&error.code==='P2002')throw new ConflictException('Cette catégorie existe déjà');throw error}
  }

  list(principal:AuthPrincipal){return this.prisma.rawMaterial.findMany({where:{organizationId:principal.organizationId,deletedAt:null},select:{id:true,sku:true,name:true,quantity:true,averageCost:true,minimumStock:true,category:{select:{id:true,name:true}},baseUnitRef:{select:{id:true,code:true,symbol:true,dimension:true}},purchaseUnit:{select:{id:true,code:true,symbol:true}},createdAt:true},orderBy:{name:'asc'}})}

  async create(principal:AuthPrincipal,input:CreateMaterialDto){
    const unitIds=[input.baseUnitId,...(input.purchaseUnitId?[input.purchaseUnitId]:[])];
    const units=await this.prisma.unit.findMany({where:{organizationId:principal.organizationId,id:{in:unitIds},deletedAt:null}});
    if(units.length!==new Set(unitIds).size)throw new NotFoundException('Une unité est introuvable');
    const baseUnit=units.find(unit=>unit.id===input.baseUnitId)!;
    if(baseUnit.dimension==='PACKAGE')throw new BadRequestException('L’unité de base ne peut pas être un emballage');
    if(input.categoryId){const category=await this.prisma.materialCategory.count({where:{id:input.categoryId,organizationId:principal.organizationId,deletedAt:null}});if(!category)throw new NotFoundException('Catégorie introuvable')}
    try{return await this.prisma.rawMaterial.create({data:{organizationId:principal.organizationId,sku:input.sku.toUpperCase(),name:input.name.trim(),categoryId:input.categoryId,baseUnit:baseUnit.code,baseUnitId:baseUnit.id,purchaseUnitId:input.purchaseUnitId,quantity:new Prisma.Decimal(input.initialQuantity),minimumStock:new Prisma.Decimal(input.minimumStock)}})}
    catch(error){if(error instanceof Prisma.PrismaClientKnownRequestError&&error.code==='P2002')throw new ConflictException('Cette référence matière existe déjà');throw error}
  }
}
