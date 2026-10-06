import {Module} from '@nestjs/common';
import {AuthorizationModule} from '../authorization/authorization.module.js';
import {AuthModule} from '../auth/auth.module.js';
import {OrganizationController} from './organization.controller.js';
import {OrganizationService} from './organization.service.js';

@Module({imports:[AuthModule,AuthorizationModule],controllers:[OrganizationController],providers:[OrganizationService]})
export class OrganizationModule{}
