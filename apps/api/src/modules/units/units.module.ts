import {Module} from '@nestjs/common';
import {AuthModule} from '../auth/auth.module.js';
import {AuthorizationModule} from '../authorization/authorization.module.js';
import {UnitsController} from './units.controller.js';
import {UnitsService} from './units.service.js';

@Module({imports:[AuthModule,AuthorizationModule],controllers:[UnitsController],providers:[UnitsService]})
export class UnitsModule{}
