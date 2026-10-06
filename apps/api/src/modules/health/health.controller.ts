import {Controller,Get} from '@nestjs/common';
import {PrismaService} from '../../infrastructure/database/prisma.service.js';

@Controller('health')
export class HealthController{
  constructor(private readonly prisma:PrismaService){}

  @Get()
  async check(){
    const database=await this.prisma.isReady();
    return {
      status:database||!this.prisma.configured?'ok':'degraded',
      service:'boul-api',
      version:'0.2.0',
      database:{provider:'neon-postgresql',configured:this.prisma.configured,ready:database},
      timestamp:new Date().toISOString(),
    };
  }
}
