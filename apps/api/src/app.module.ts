import {Module} from '@nestjs/common';
import {APP_GUARD} from '@nestjs/core';
import {ThrottlerGuard,ThrottlerModule} from '@nestjs/throttler';
import {DatabaseModule} from './infrastructure/database/database.module.js';
import {AuthModule} from './modules/auth/auth.module.js';
import {HealthModule} from './modules/health/health.module.js';

@Module({
  imports:[ThrottlerModule.forRoot([{ttl:60_000,limit:120}]),DatabaseModule,HealthModule,AuthModule],
  providers:[{provide:APP_GUARD,useClass:ThrottlerGuard}],
})
export class AppModule{}
