import {Module} from '@nestjs/common';
import {APP_GUARD} from '@nestjs/core';
import {ThrottlerGuard,ThrottlerModule} from '@nestjs/throttler';
import {DatabaseModule} from './infrastructure/database/database.module.js';
import {AuthModule} from './modules/auth/auth.module.js';
import {AuthorizationModule} from './modules/authorization/authorization.module.js';
import {HealthModule} from './modules/health/health.module.js';
import {OrganizationModule} from './modules/organization/organization.module.js';

@Module({
  imports:[ThrottlerModule.forRoot([{ttl:60_000,limit:120}]),DatabaseModule,HealthModule,AuthModule,AuthorizationModule,OrganizationModule],
  providers:[{provide:APP_GUARD,useClass:ThrottlerGuard}],
})
export class AppModule{}
