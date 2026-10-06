import {z} from 'zod';

const environmentSchema=z.object({
  NODE_ENV:z.enum(['development','test','staging','production']).default('development'),
  API_PORT:z.coerce.number().int().min(1).max(65535).default(3001),
  DATABASE_URL:z.string().url().optional(),
  DIRECT_URL:z.string().url().optional(),
  LOG_LEVEL:z.enum(['fatal','error','warn','info','debug','trace','silent']).optional(),
  OPENAPI_ENABLED:z.enum(['true','false']).default('true'),
}).superRefine((env,context)=>{
  if(['staging','production'].includes(env.NODE_ENV)){
    if(!env.DATABASE_URL)context.addIssue({code:'custom',path:['DATABASE_URL'],message:'DATABASE_URL est obligatoire hors développement'});
    if(!env.DIRECT_URL)context.addIssue({code:'custom',path:['DIRECT_URL'],message:'DIRECT_URL est obligatoire hors développement'});
    if(env.DATABASE_URL&&!env.DATABASE_URL.includes('sslmode=require'))context.addIssue({code:'custom',path:['DATABASE_URL'],message:'TLS Neon doit être obligatoire (sslmode=require)'});
  }
});

export type Environment=z.infer<typeof environmentSchema>;

export function validateEnvironment(source:NodeJS.ProcessEnv=process.env):Environment{
  const result=environmentSchema.safeParse(source);
  if(!result.success){
    const details=result.error.issues.map(issue=>`${issue.path.join('.')||'environment'}: ${issue.message}`).join('; ');
    throw new Error(`Configuration invalide — ${details}`);
  }
  return result.data;
}
