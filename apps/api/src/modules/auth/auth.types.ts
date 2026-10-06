import type {Role} from '@prisma/client';

export interface AuthPrincipal{
  userId:string;
  organizationId:string;
  organizationSlug:string;
  name:string;
  email:string;
  role:Role;
  siteIds:string[];
  unrestrictedSites:boolean;
  sessionId:string;
}
