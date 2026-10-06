import {Module} from '@nestjs/common';
import {AuthModule} from '../auth/auth.module.js';
import {AuthorizationModule} from '../authorization/authorization.module.js';
import {SuppliersController} from './suppliers.controller.js';
@Module({imports:[AuthModule,AuthorizationModule],controllers:[SuppliersController]})
export class SuppliersModule{}
