import {Body,Controller,Get,Post,Req,UseGuards} from '@nestjs/common';
import type {Request} from 'express';
import {ApiCookieAuth,ApiTags} from '@nestjs/swagger';
import {AuthGuard} from '../auth/auth.guard.js';
import {PermissionsGuard} from '../authorization/permissions.guard.js';
import {RequirePermissions} from '../authorization/permissions.decorator.js';
import {InviteUserDto} from './dto/invite-user.dto.js';
import {OrganizationService} from './organization.service.js';

@ApiTags('organization')
@ApiCookieAuth('boul_session')
@Controller('organization')
@UseGuards(AuthGuard,PermissionsGuard)
export class OrganizationController{
  constructor(private readonly organization:OrganizationService){}

  @Get() @RequirePermissions('organization:read')
  current(@Req() req:Request){return this.organization.current(req.auth!)}

  @Get('sites') @RequirePermissions('sites:read')
  sites(@Req() req:Request){return this.organization.sites(req.auth!)}

  @Get('users') @RequirePermissions('users:read')
  users(@Req() req:Request){return this.organization.users(req.auth!)}

  @Post('invitations') @RequirePermissions('users:invite')
  invite(@Req() req:Request,@Body() body:InviteUserDto){return this.organization.invite(req.auth!,body)}
}
