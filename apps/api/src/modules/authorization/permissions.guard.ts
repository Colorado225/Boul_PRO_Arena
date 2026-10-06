import {CanActivate,ExecutionContext,ForbiddenException,Injectable} from '@nestjs/common';
import {Reflector} from '@nestjs/core';
import {roleHasAllPermissions,type Permission,type RoleName} from '@boul/domain';
import type {Request} from 'express';
import {PERMISSIONS_METADATA} from './permissions.decorator.js';

@Injectable()
export class PermissionsGuard implements CanActivate{
  constructor(private readonly reflector:Reflector){}
  canActivate(context:ExecutionContext){
    const required=this.reflector.getAllAndOverride<Permission[]>(PERMISSIONS_METADATA,[context.getHandler(),context.getClass()])??[];
    if(required.length===0)return true;
    const request=context.switchToHttp().getRequest<Request>();
    if(!request.auth||!roleHasAllPermissions(request.auth.role as RoleName,required))throw new ForbiddenException('Permissions insuffisantes');
    return true;
  }
}
