import 'dotenv/config';
import 'reflect-metadata';
import {ValidationPipe} from '@nestjs/common';
import {NestFactory} from '@nestjs/core';
import {DocumentBuilder,SwaggerModule} from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import {Logger} from 'nestjs-pino';
import {AppModule} from './app.module.js';
import {AllExceptionsFilter} from './infrastructure/http/all-exceptions.filter.js';

async function bootstrap(){
  const app=await NestFactory.create(AppModule,{cors:false,bufferLogs:true});
  app.useLogger(app.get(Logger));
  app.setGlobalPrefix('api/v1');
  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe({whitelist:true,forbidNonWhitelisted:true,transform:true}));
  app.useGlobalFilters(new AllExceptionsFilter());
  app.enableShutdownHooks();

  if(process.env.OPENAPI_ENABLED!=='false'){
    const config=new DocumentBuilder()
      .setTitle('Boul. Business OS API')
      .setDescription('API multi-tenant de pilotage des boulangeries ivoiriennes.')
      .setVersion('0.3.0')
      .addCookieAuth('boul_session',{type:'apiKey',in:'cookie',description:'Session opaque HttpOnly'})
      .addTag('health','Liveness et readiness')
      .addTag('auth','Authentification et récupération')
      .addTag('organization','Organisation, boutiques et équipe')
      .build();
    const document=SwaggerModule.createDocument(app,config,{operationIdFactory:(controller,method)=>`${controller.replace('Controller','')}_${method}`});
    SwaggerModule.setup('api/docs',app,document,{jsonDocumentUrl:'api/docs-json',customSiteTitle:'Boul. API'});
  }

  const port=Number(process.env.API_PORT??3001);
  await app.listen(port,'0.0.0.0');
}
void bootstrap();
