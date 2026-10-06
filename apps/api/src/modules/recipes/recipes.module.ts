import {Module} from '@nestjs/common';
import {AuthModule} from '../auth/auth.module.js';
import {AuthorizationModule} from '../authorization/authorization.module.js';
import {RecipesController} from './recipes.controller.js';
import {RecipesService} from './recipes.service.js';

@Module({imports:[AuthModule,AuthorizationModule],controllers:[RecipesController],providers:[RecipesService]})
export class RecipesModule{}
