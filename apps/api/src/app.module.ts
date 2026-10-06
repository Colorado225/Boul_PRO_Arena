import {Module} from '@nestjs/common';
import {APP_GUARD} from '@nestjs/core';
import {ThrottlerGuard,ThrottlerModule} from '@nestjs/throttler';
import {LoggerModule} from 'nestjs-pino';
import {DatabaseModule} from './infrastructure/database/database.module.js';
import {loggerConfig} from './infrastructure/observability/logger.config.js';
import {AuthModule} from './modules/auth/auth.module.js';
import {AuthorizationModule} from './modules/authorization/authorization.module.js';
import {HealthModule} from './modules/health/health.module.js';
import {OrganizationModule} from './modules/organization/organization.module.js';
import {UnitsModule} from './modules/units/units.module.js';
import {MaterialsModule} from './modules/materials/materials.module.js';
import {RecipesModule} from './modules/recipes/recipes.module.js';
import {ProductsModule} from './modules/products/products.module.js';

@Module({
  imports:[LoggerModule.forRoot(loggerConfig()),ThrottlerModule.forRoot([{ttl:60_000,limit:120}]),DatabaseModule,HealthModule,AuthModule,AuthorizationModule,OrganizationModule,UnitsModule,MaterialsModule,ProductsModule,RecipesModule],
  providers:[{provide:APP_GUARD,useClass:ThrottlerGuard}],
})
export class AppModule{}
