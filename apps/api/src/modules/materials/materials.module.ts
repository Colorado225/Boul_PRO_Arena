import {Module} from '@nestjs/common';
import {AuthModule} from '../auth/auth.module.js';
import {AuthorizationModule} from '../authorization/authorization.module.js';
import {MaterialsController} from './materials.controller.js';
import {MaterialsService} from './materials.service.js';

@Module({imports:[AuthModule,AuthorizationModule],controllers:[MaterialsController],providers:[MaterialsService]})
export class MaterialsModule{}
