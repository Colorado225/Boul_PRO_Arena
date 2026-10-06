import {CanActivate,ExecutionContext,Injectable,UnauthorizedException} from '@nestjs/common';
import type {Request} from 'express';
import {AuthService} from './auth.service.js';
import {SESSION_COOKIE} from './auth.constants.js';

@Injectable()
export class AuthGuard implements CanActivate{
  constructor(private readonly auth:AuthService){}
  async canActivate(context:ExecutionContext){
    const request=context.switchToHttp().getRequest<Request>();
    const token=request.cookies?.[SESSION_COOKIE] as string|undefined;
    if(!token)throw new UnauthorizedException('Authentification requise');
    const principal=await this.auth.authenticate(token);
    if(!principal)throw new UnauthorizedException('Session invalide ou expirée');
    request.auth=principal;
    return true;
  }
}
