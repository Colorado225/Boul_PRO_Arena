import {Module} from '@nestjs/common';
import {PermissionsGuard} from './permissions.guard.js';
import {SiteAccessService} from './site-access.service.js';

@Module({providers:[PermissionsGuard,SiteAccessService],exports:[PermissionsGuard,SiteAccessService]})
export class AuthorizationModule{}
