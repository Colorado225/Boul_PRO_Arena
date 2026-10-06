import {Body,Controller,Get,Post,Req,UseGuards} from '@nestjs/common';
import {ApiCookieAuth,ApiTags} from '@nestjs/swagger';
import type {Request} from 'express';
import {AuthGuard} from '../auth/auth.guard.js';
import {PermissionsGuard} from '../authorization/permissions.guard.js';
import {RequirePermissions} from '../authorization/permissions.decorator.js';
import {CreateMaterialCategoryDto} from './dto/create-material-category.dto.js';
import {CreateMaterialDto} from './dto/create-material.dto.js';
import {MaterialsService} from './materials.service.js';

@ApiTags('materials') @ApiCookieAuth('boul_session')
@Controller('materials') @UseGuards(AuthGuard,PermissionsGuard)
export class MaterialsController{
  constructor(private readonly materials:MaterialsService){}
  @Get() @RequirePermissions('materials:read') list(@Req() req:Request){return this.materials.list(req.auth!)}
  @Post() @RequirePermissions('materials:manage') create(@Req() req:Request,@Body() body:CreateMaterialDto){return this.materials.create(req.auth!,body)}
  @Get('categories') @RequirePermissions('materials:read') categories(@Req() req:Request){return this.materials.categories(req.auth!)}
  @Post('categories') @RequirePermissions('materials:manage') createCategory(@Req() req:Request,@Body() body:CreateMaterialCategoryDto){return this.materials.createCategory(req.auth!,body)}
}
