import {Injectable,Logger,OnModuleDestroy,OnModuleInit} from '@nestjs/common';
import {PrismaClient} from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit,OnModuleDestroy{
  private readonly logger=new Logger(PrismaService.name);
  readonly configured=Boolean(process.env.DATABASE_URL);

  async onModuleInit(){
    if(!this.configured){
      this.logger.warn('DATABASE_URL absente : connexion Neon désactivée pour cet environnement.');
      return;
    }
    await this.$connect();
    this.logger.log('Connexion Neon PostgreSQL établie.');
  }

  async onModuleDestroy(){if(this.configured)await this.$disconnect()}

  async isReady(){
    if(!this.configured)return false;
    try{await this.$queryRaw`SELECT 1`;return true}catch{return false}
  }
}
