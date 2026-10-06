import {HttpException,HttpStatus} from '@nestjs/common';
import {Prisma} from '@prisma/client';

export interface MappedProblem{status:number;code:string;title:string;detail:string;errors?:string[]}

export function mapException(exception:unknown):MappedProblem{
  if(exception instanceof Prisma.PrismaClientKnownRequestError){
    if(exception.code==='P2002')return {status:409,code:'conflict',title:'Conflit de données',detail:'Cette valeur existe déjà.'};
    if(exception.code==='P2025')return {status:404,code:'not-found',title:'Ressource introuvable',detail:'La ressource demandée n’existe pas ou plus.'};
    return {status:500,code:'database-error',title:'Erreur de données',detail:'Une opération de données a échoué.'};
  }
  if(exception instanceof HttpException){
    const status=exception.getStatus();
    const value=exception.getResponse();
    const body=typeof value==='string'?{message:value}:value as {message?:string|string[]};
    const errors=Array.isArray(body.message)?body.message:undefined;
    const detail=errors?.[0]??(typeof body.message==='string'?body.message:exception.message);
    return {status,code:codeFor(status),title:titleFor(status),detail,errors};
  }
  return {status:500,code:'internal-error',title:'Erreur interne',detail:'Une erreur inattendue est survenue. Réessayez ou contactez le support avec l’identifiant de requête.'};
}

function codeFor(status:number){return ({400:'validation',401:'unauthorized',403:'forbidden',404:'not-found',409:'conflict',429:'rate-limit',503:'service-unavailable'} as Record<number,string>)[status]??`http-${status}`}
function titleFor(status:number){return ({400:'Requête invalide',401:'Authentification requise',403:'Accès refusé',404:'Ressource introuvable',409:'Conflit',429:'Trop de requêtes',503:'Service indisponible'} as Record<number,string>)[status]??HttpStatus[status]??'Erreur'}
