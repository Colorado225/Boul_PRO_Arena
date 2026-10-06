import 'dotenv/config';
import 'reflect-metadata';
import {ValidationPipe} from '@nestjs/common';
import {NestFactory} from '@nestjs/core';
import cookieParser from 'cookie-parser';
import {AppModule} from './app.module.js';

async function bootstrap(){
  const app=await NestFactory.create(AppModule,{cors:false});
  app.setGlobalPrefix('api/v1');
  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe({whitelist:true,forbidNonWhitelisted:true,transform:true}));
  app.enableShutdownHooks();
  const port=Number(process.env.API_PORT ?? 3001);
  await app.listen(port,'0.0.0.0');
}
void bootstrap();
