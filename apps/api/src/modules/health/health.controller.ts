import {Controller,Get,ServiceUnavailableException} from '@nestjs/common';
import {ApiOperation,ApiTags} from '@nestjs/swagger';
import {PrismaService} from '../../infrastructure/database/prisma.service.js';

@ApiTags('health')
@Controller('health')
export class HealthController{
  constructor(private readonly prisma:PrismaService){}

  @Get('live') @ApiOperation({summary:'Vérifie que le processus API est vivant'})
  live(){return {status:'ok',service:'boul-api',version:'0.3.0',timestamp:new Date().toISOString()}}

  @Get('ready') @ApiOperation({summary:'Vérifie que l’API et Neon sont prêts'})
  async ready(){
    const ready=await this.prisma.isReady();
    if(!ready)throw new ServiceUnavailableException(this.prisma.configured?'Neon est temporairement indisponible':'Neon n’est pas configuré');
    return {status:'ready',database:'neon-postgresql',timestamp:new Date().toISOString()};
  }

  @Get() @ApiOperation({summary:'Retourne l’état synthétique des dépendances'})
  async check(){
    const database=await this.prisma.isReady();
    return {status:database?'ok':'degraded',service:'boul-api',version:'0.3.0',database:{provider:'neon-postgresql',configured:this.prisma.configured,ready:database},timestamp:new Date().toISOString()};
  }
}
