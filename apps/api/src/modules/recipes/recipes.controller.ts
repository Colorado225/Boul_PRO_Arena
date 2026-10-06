import {Body,Controller,Get,Param,ParseUUIDPipe,Post,Req,UseGuards} from '@nestjs/common';
import {ApiCookieAuth,ApiTags} from '@nestjs/swagger';
import type {Request} from 'express';
import {AuthGuard} from '../auth/auth.guard.js';
import {PermissionsGuard} from '../authorization/permissions.guard.js';
import {RequirePermissions} from '../authorization/permissions.decorator.js';
import {CreateRecipeDto,CreateRecipeVersionDto} from './dto/create-recipe.dto.js';
import {RecipesService} from './recipes.service.js';

@ApiTags('recipes') @ApiCookieAuth('boul_session')
@Controller('recipes') @UseGuards(AuthGuard,PermissionsGuard)
export class RecipesController{
  constructor(private readonly recipes:RecipesService){}
  @Get() @RequirePermissions('recipes:read') list(@Req() req:Request){return this.recipes.list(req.auth!)}
  @Get(':id') @RequirePermissions('recipes:read') detail(@Req() req:Request,@Param('id',ParseUUIDPipe) id:string){return this.recipes.detail(req.auth!,id)}
  @Post() @RequirePermissions('recipes:manage') create(@Req() req:Request,@Body() body:CreateRecipeDto){return this.recipes.create(req.auth!,body)}
  @Post(':id/versions') @RequirePermissions('recipes:manage') addVersion(@Req() req:Request,@Param('id',ParseUUIDPipe) id:string,@Body() body:CreateRecipeVersionDto){return this.recipes.addVersion(req.auth!,id,body)}
  @Post(':id/versions/:versionId/activate') @RequirePermissions('recipes:manage') activate(@Req() req:Request,@Param('id',ParseUUIDPipe) id:string,@Param('versionId',ParseUUIDPipe) versionId:string){return this.recipes.activate(req.auth!,id,versionId)}
}
