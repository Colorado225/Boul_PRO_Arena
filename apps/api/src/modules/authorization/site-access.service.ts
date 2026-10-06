import {ForbiddenException,Injectable} from '@nestjs/common';
import type {AuthPrincipal} from '../auth/auth.types.js';

@Injectable()
export class SiteAccessService{
  assert(principal:AuthPrincipal,siteId:string){
    if(!principal.unrestrictedSites&&!principal.siteIds.includes(siteId))throw new ForbiddenException('Accès à cette boutique non autorisé');
  }
  filter(principal:AuthPrincipal,siteIds:string[]):string[]{return principal.unrestrictedSites?siteIds:siteIds.filter(id=>principal.siteIds.includes(id))}
}
