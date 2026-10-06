import {Module} from '@nestjs/common';import {AuthModule} from '../auth/auth.module.js';import {AuthorizationModule} from '../authorization/authorization.module.js';import {ProductsController} from './products.controller.js';
@Module({imports:[AuthModule,AuthorizationModule],controllers:[ProductsController]}) export class ProductsModule{}
