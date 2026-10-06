import {Module} from '@nestjs/common';
import {AuthModule} from '../auth/auth.module.js';
import {AuthorizationModule} from '../authorization/authorization.module.js';
import {PurchasesController} from './purchases.controller.js';
import {PurchasesService} from './purchases.service.js';
@Module({imports:[AuthModule,AuthorizationModule],controllers:[PurchasesController],providers:[PurchasesService]})
export class PurchasesModule{}
