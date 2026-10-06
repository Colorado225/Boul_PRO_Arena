import {Body,Controller,Get,Param,ParseUUIDPipe,Post,Req,UseGuards} from '@nestjs/common';
import {ApiCookieAuth,ApiTags} from '@nestjs/swagger';
import type {Request} from 'express';
import {AuthGuard} from '../auth/auth.guard.js';
import {PermissionsGuard} from '../authorization/permissions.guard.js';
import {RequirePermissions} from '../authorization/permissions.decorator.js';
import {CreatePurchaseDto,ReceivePurchaseDto} from './dto/purchase.dto.js';
import {PurchasesService} from './purchases.service.js';
@ApiTags('purchases') @ApiCookieAuth('boul_session') @Controller('purchases') @UseGuards(AuthGuard,PermissionsGuard)
export class PurchasesController{
 constructor(private readonly purchases:PurchasesService){}
 @Get() @RequirePermissions('purchases:read') list(@Req() req:Request){return this.purchases.list(req.auth!)}
 @Get('lots') @RequirePermissions('stock:read') lots(@Req() req:Request){return this.purchases.lots(req.auth!)}
 @Post() @RequirePermissions('purchases:create') create(@Req() req:Request,@Body() body:CreatePurchaseDto){return this.purchases.create(req.auth!,body)}
 @Post(':id/receive') @RequirePermissions('purchases:approve') receive(@Req() req:Request,@Param('id',ParseUUIDPipe) id:string,@Body() body:ReceivePurchaseDto){return this.purchases.receive(req.auth!,id,body)}
}
