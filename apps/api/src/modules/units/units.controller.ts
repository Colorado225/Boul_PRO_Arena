import {Body,Controller,Get,Post,Req,UseGuards} from '@nestjs/common';
import {ApiCookieAuth,ApiTags} from '@nestjs/swagger';
import type {Request} from 'express';
import {AuthGuard} from '../auth/auth.guard.js';
import {PermissionsGuard} from '../authorization/permissions.guard.js';
import {RequirePermissions} from '../authorization/permissions.decorator.js';
import {CreateConversionDto} from './dto/create-conversion.dto.js';
import {CreateUnitDto} from './dto/create-unit.dto.js';
import {ConvertQuantityDto} from './dto/convert-quantity.dto.js';
import {UnitsService} from './units.service.js';

@ApiTags('units') @ApiCookieAuth('boul_session')
@Controller('units') @UseGuards(AuthGuard,PermissionsGuard)
export class UnitsController{
  constructor(private readonly units:UnitsService){}
  @Get() @RequirePermissions('materials:read') list(@Req() req:Request){return this.units.list(req.auth!)}
  @Post() @RequirePermissions('materials:manage') create(@Req() req:Request,@Body() body:CreateUnitDto){return this.units.create(req.auth!,body)}
  @Post('conversions') @RequirePermissions('materials:manage') createConversion(@Req() req:Request,@Body() body:CreateConversionDto){return this.units.createConversion(req.auth!,body)}
  @Post('convert') @RequirePermissions('materials:read') convert(@Req() req:Request,@Body() body:ConvertQuantityDto){return this.units.convert(req.auth!,body)}
}
