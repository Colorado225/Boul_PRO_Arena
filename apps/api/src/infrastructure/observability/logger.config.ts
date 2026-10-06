import {randomUUID} from 'node:crypto';
import type {Params} from 'nestjs-pino';

export function loggerConfig():Params{
  const production=process.env.NODE_ENV==='production';
  return {pinoHttp:{
    level:process.env.LOG_LEVEL??(production?'info':'debug'),
    genReqId:(request,response)=>{
      const supplied=request.headers['x-request-id'];
      const id=typeof supplied==='string'&&supplied.length<=100?supplied:randomUUID();
      response.setHeader('x-request-id',id);
      return id;
    },
    redact:{paths:['req.headers.authorization','req.headers.cookie','res.headers["set-cookie"]','password','body.password','body.token'],censor:'[REDACTED]'},
    customProps:()=>({service:'boul-api',environment:process.env.NODE_ENV??'development'}),
    serializers:{req:req=>({id:req.id,method:req.method,url:req.url}),res:res=>({statusCode:res.statusCode})},
    transport:production?undefined:{target:'pino-pretty',options:{singleLine:true,colorize:true,translateTime:'SYS:standard',ignore:'pid,hostname'}},
  }};
}
