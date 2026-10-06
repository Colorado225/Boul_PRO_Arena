import {ArgumentsHost,Catch,ExceptionFilter,Logger} from '@nestjs/common';
import type {Request,Response} from 'express';
import {mapException} from './problem-details.js';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter{
  private readonly logger=new Logger(AllExceptionsFilter.name);

  catch(exception:unknown,host:ArgumentsHost){
    const context=host.switchToHttp();
    const request=context.getRequest<Request&{id?:string}>();
    const response=context.getResponse<Response>();
    const mapped=mapException(exception);
    const requestId=request.id??String(request.headers['x-request-id']??'unknown');

    if(mapped.status>=500)this.logger.error({requestId,path:request.url,method:request.method,exception},mapped.detail);
    else this.logger.warn({requestId,path:request.url,method:request.method,status:mapped.status},mapped.detail);

    response.status(mapped.status).type('application/problem+json').json({
      type:`https://boul.ci/problems/${mapped.code}`,
      title:mapped.title,
      status:mapped.status,
      detail:mapped.detail,
      instance:request.originalUrl,
      requestId,
      timestamp:new Date().toISOString(),
      ...(mapped.errors?{errors:mapped.errors}:{}),
    });
  }
}
