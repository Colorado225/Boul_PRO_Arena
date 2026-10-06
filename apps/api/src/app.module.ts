import {Module} from '@nestjs/common';
import {HealthModule} from './modules/health/health.module.js';
import {DatabaseModule} from './infrastructure/database/database.module.js';

@Module({imports:[DatabaseModule,HealthModule]})
export class AppModule{}
