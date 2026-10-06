import {Body,Controller,Get,Post,Req,UseGuards} from '@nestjs/common';
import {ApiCookieAuth,ApiTags} from '@nestjs/swagger';
import {Prisma} from '@prisma/client';
import type {Request} from 'express';
import {PrismaService} from '../../infrastructure/database/prisma.service.js';
import {AuthGuard} from '../auth/auth.guard.js';
import {PermissionsGuard} from '../authorization/permissions.guard.js';
import {RequirePermissions} from '../authorization/permissions.decorator.js';
import {CreateSupplierDto} from './dto/create-supplier.dto.js';

@ApiTags('suppliers') @ApiCookieAuth('boul_session')
@Controller('suppliers') @UseGuards(AuthGuard,PermissionsGuard)
export class SuppliersController{
  constructor(private readonly prisma:PrismaService){}
  @Get() @RequirePermissions('purchases:read')
  list(@Req() req:Request){return this.prisma.supplier.findMany({where:{organizationId:req.auth!.organizationId,deletedAt:null,isActive:true},include:{_count:{select:{purchases:true}}},orderBy:{name:'asc'}})}
  @Post() @RequirePermissions('purchases:create')
  create(@Req() req:Request,@Body() body:CreateSupplierDto){return this.prisma.$transaction(async tx=>{
    const supplier=await tx.supplier.create({data:{organizationId:req.auth!.organizationId,code:body.code.toUpperCase(),name:body.name.trim(),contactName:body.contactName?.trim(),phone:body.phone,email:body.email?.toLowerCase(),address:body.address?.trim(),paymentTermsDays:body.paymentTermsDays,leadTimeDays:body.leadTimeDays,notes:body.notes?.trim()}});
    await tx.auditLog.create({data:{organizationId:req.auth!.organizationId,actorId:req.auth!.userId,action:'SUPPLIER_CREATED',entity:'Supplier',entityId:supplier.id,after:{code:supplier.code,name:supplier.name} as Prisma.InputJsonValue}});
    return supplier;
  })}
}
