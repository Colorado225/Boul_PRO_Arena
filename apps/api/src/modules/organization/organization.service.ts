import {BadRequestException,ConflictException,ForbiddenException,Injectable} from '@nestjs/common';
import {createHash,randomBytes} from 'node:crypto';
import {Role} from '@prisma/client';
import {PrismaService} from '../../infrastructure/database/prisma.service.js';
import type {AuthPrincipal} from '../auth/auth.types.js';
import {SiteAccessService} from '../authorization/site-access.service.js';
import type {InviteUserDto} from './dto/invite-user.dto.js';

const hashToken=(value:string)=>createHash('sha256').update(value).digest('hex');
const unrestrictedRoles:Role[]=[Role.SUPER_ADMIN,Role.OWNER,Role.DIRECTOR,Role.GENERAL_MANAGER];
const roleRank:Record<Role,number>={SUPER_ADMIN:100,OWNER:90,DIRECTOR:80,GENERAL_MANAGER:70,FINANCE_MANAGER:60,STORE_MANAGER:60,PRODUCTION_MANAGER:60,PURCHASING_MANAGER:60,STOCK_MANAGER:60,ACCOUNTANT:50,AUDITOR:40,ACCOUNTANT_EXTERNAL:40,BAKER:20,CASHIER:20,SALES_AGENT:20,READ_ONLY:10};

@Injectable()
export class OrganizationService{
  constructor(private readonly prisma:PrismaService,private readonly siteAccess:SiteAccessService){}

  async current(principal:AuthPrincipal){
    return this.prisma.organization.findFirstOrThrow({where:{id:principal.organizationId,deletedAt:null},select:{id:true,name:true,slug:true,currency:true,createdAt:true}});
  }

  async sites(principal:AuthPrincipal){
    const sites=await this.prisma.site.findMany({where:{organizationId:principal.organizationId,deletedAt:null},select:{id:true,name:true,type:true,timezone:true},orderBy:{name:'asc'}});
    const visible=new Set(this.siteAccess.filter(principal,sites.map(site=>site.id)));
    return sites.filter(site=>visible.has(site.id));
  }

  async users(principal:AuthPrincipal){
    return this.prisma.user.findMany({
      where:{organizationId:principal.organizationId,deletedAt:null},
      select:{id:true,name:true,email:true,role:true,isActive:true,lastLoginAt:true,createdAt:true,siteAccesses:{select:{siteId:true}}},
      orderBy:[{isActive:'desc'},{name:'asc'}],
    });
  }

  async invite(principal:AuthPrincipal,input:InviteUserDto){
    this.assertCanDelegate(principal.role,input.role);
    const email=input.email.trim().toLowerCase();
    const exists=await this.prisma.user.findFirst({where:{organizationId:principal.organizationId,email,deletedAt:null},select:{id:true}});
    if(exists)throw new ConflictException('Un utilisateur possède déjà cette adresse');

    const needsSites=!unrestrictedRoles.includes(input.role);
    if(needsSites&&input.siteIds.length===0)throw new BadRequestException('Sélectionnez au moins une boutique pour ce rôle');
    if(input.siteIds.length){
      const accessible=this.siteAccess.filter(principal,input.siteIds);
      if(accessible.length!==input.siteIds.length)throw new ForbiddenException('Une boutique sélectionnée est hors de votre périmètre');
      const count=await this.prisma.site.count({where:{id:{in:input.siteIds},organizationId:principal.organizationId,deletedAt:null}});
      if(count!==input.siteIds.length)throw new BadRequestException('Une boutique sélectionnée est invalide');
    }

    const token=randomBytes(32).toString('base64url');
    const invitation=await this.prisma.$transaction(async tx=>{
      await tx.userInvitation.updateMany({where:{organizationId:principal.organizationId,email,acceptedAt:null,revokedAt:null},data:{revokedAt:new Date()}});
      const created=await tx.userInvitation.create({data:{organizationId:principal.organizationId,email,name:input.name.trim(),role:input.role,siteIds:needsSites?input.siteIds:[],tokenHash:hashToken(token),invitedById:principal.userId,expiresAt:new Date(Date.now()+7*24*60*60*1000)}});
      await tx.auditLog.create({data:{organizationId:principal.organizationId,actorId:principal.userId,action:'USER_INVITED',entity:'UserInvitation',entityId:created.id,after:{email,role:input.role,siteIds:input.siteIds}}});
      return created;
    });
    return {id:invitation.id,email:invitation.email,role:invitation.role,expiresAt:invitation.expiresAt,...(process.env.NODE_ENV==='development'?{debugToken:token}:{})};
  }

  private assertCanDelegate(actor:Role,target:Role){
    if(target===Role.SUPER_ADMIN||roleRank[target]>=roleRank[actor])throw new ForbiddenException('Vous ne pouvez pas attribuer ce rôle');
  }
}
