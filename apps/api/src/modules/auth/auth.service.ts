import {Injectable,UnauthorizedException} from '@nestjs/common';
import {hash,verify} from 'argon2';
import {createHash,randomBytes} from 'node:crypto';
import {PrismaService} from '../../infrastructure/database/prisma.service.js';
import {SESSION_DURATION_MS} from './auth.constants.js';
import type {AuthPrincipal} from './auth.types.js';
import type {LoginDto} from './dto/login.dto.js';
import type {RequestPasswordResetDto} from './dto/request-password-reset.dto.js';
import type {ResetPasswordDto} from './dto/reset-password.dto.js';
import type {AcceptInvitationDto} from './dto/accept-invitation.dto.js';

const digest=(token:string)=>createHash('sha256').update(token).digest('hex');

@Injectable()
export class AuthService{
  private readonly dummyHash=hash('invalid-password-used-only-for-timing-safety');
  constructor(private readonly prisma:PrismaService){}

  async login(input:LoginDto,meta:{ip?:string;userAgent?:string}){
    const email=input.email.trim().toLowerCase();
    const user=await this.prisma.user.findFirst({
      where:{email,deletedAt:null,organization:{slug:input.organizationSlug,deletedAt:null}},
      include:{organization:true,siteAccesses:true},
    });
    const passwordHash=user?.passwordHash ?? await this.dummyHash;
    const valid=await verify(passwordHash,input.password);
    if(!user||!valid||!user.isActive)throw new UnauthorizedException('Identifiants invalides');

    const token=randomBytes(32).toString('base64url');
    const expiresAt=new Date(Date.now()+SESSION_DURATION_MS);
    const session=await this.prisma.$transaction(async tx=>{
      const created=await tx.session.create({data:{organizationId:user.organizationId,userId:user.id,tokenHash:digest(token),expiresAt,ip:meta.ip,userAgent:meta.userAgent?.slice(0,500)}});
      await tx.user.update({where:{id:user.id},data:{lastLoginAt:new Date()}});
      await tx.auditLog.create({data:{organizationId:user.organizationId,actorId:user.id,action:'AUTH_LOGIN',entity:'Session',entityId:created.id,ip:meta.ip,device:meta.userAgent?.slice(0,500)}});
      return created;
    });
    return {token,expiresAt,principal:this.toPrincipal(user,session.id)};
  }

  async authenticate(token:string):Promise<AuthPrincipal|null>{
    const session=await this.prisma.session.findUnique({where:{tokenHash:digest(token)},include:{user:{include:{organization:true,siteAccesses:true}}}});
    if(!session||session.revokedAt||session.expiresAt<=new Date()||!session.user.isActive||session.user.deletedAt)return null;
    const now=new Date();
    if(now.getTime()-session.lastSeenAt.getTime()>5*60*1000)void this.prisma.session.update({where:{id:session.id},data:{lastSeenAt:now}}).catch(()=>undefined);
    return this.toPrincipal(session.user,session.id);
  }

  async logout(token:string|undefined){
    if(!token)return;
    await this.prisma.session.updateMany({where:{tokenHash:digest(token),revokedAt:null},data:{revokedAt:new Date()}});
  }

  async requestPasswordReset(input:RequestPasswordResetDto){
    const user=await this.prisma.user.findFirst({where:{email:input.email.trim().toLowerCase(),isActive:true,deletedAt:null,organization:{slug:input.organizationSlug,deletedAt:null}}});
    if(!user)return {accepted:true};
    const token=randomBytes(32).toString('base64url');
    await this.prisma.passwordResetToken.create({data:{userId:user.id,tokenHash:digest(token),expiresAt:new Date(Date.now()+30*60*1000)}});
    // A delivery adapter (email/WhatsApp) will consume this token. It is exposed only in development.
    return {accepted:true,...(process.env.NODE_ENV==='development'?{debugToken:token}:{})};
  }

  async acceptInvitation(input:AcceptInvitationDto){
    const invitation=await this.prisma.userInvitation.findUnique({where:{tokenHash:digest(input.token)}});
    if(!invitation||invitation.acceptedAt||invitation.revokedAt||invitation.expiresAt<=new Date())throw new UnauthorizedException('Invitation invalide ou expirée');
    const passwordHash=await hash(input.password);
    const user=await this.prisma.$transaction(async tx=>{
      const created=await tx.user.create({data:{organizationId:invitation.organizationId,name:invitation.name,email:invitation.email,passwordHash,role:invitation.role,siteAccesses:{create:invitation.siteIds.map(siteId=>({siteId}))}}});
      await tx.userInvitation.update({where:{id:invitation.id},data:{acceptedAt:new Date()}});
      await tx.auditLog.create({data:{organizationId:invitation.organizationId,actorId:created.id,action:'USER_INVITATION_ACCEPTED',entity:'User',entityId:created.id}});
      return created;
    });
    return {created:true,userId:user.id};
  }

  async resetPassword(input:ResetPasswordDto){
    const reset=await this.prisma.passwordResetToken.findUnique({where:{tokenHash:digest(input.token)}});
    if(!reset||reset.usedAt||reset.expiresAt<=new Date())throw new UnauthorizedException('Lien invalide ou expiré');
    const passwordHash=await hash(input.password);
    await this.prisma.$transaction([
      this.prisma.user.update({where:{id:reset.userId},data:{passwordHash}}),
      this.prisma.passwordResetToken.update({where:{id:reset.id},data:{usedAt:new Date()}}),
      this.prisma.session.updateMany({where:{userId:reset.userId,revokedAt:null},data:{revokedAt:new Date()}}),
    ]);
    return {updated:true};
  }

  private toPrincipal(user:{id:string;organizationId:string;name:string;email:string;role:any;organization:{slug:string};siteAccesses:{siteId:string}[]},sessionId:string):AuthPrincipal{
    const unrestrictedSites=['SUPER_ADMIN','OWNER','DIRECTOR','GENERAL_MANAGER'].includes(user.role);
    return {userId:user.id,organizationId:user.organizationId,organizationSlug:user.organization.slug,name:user.name,email:user.email,role:user.role,siteIds:user.siteAccesses.map(access=>access.siteId),unrestrictedSites,sessionId};
  }
}
