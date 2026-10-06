import 'dotenv/config';
import {hash} from 'argon2';
import {PrismaClient,Role} from '@prisma/client';

const prisma=new PrismaClient();

async function main(){
  const organization=await prisma.organization.upsert({
    where:{id:'00000000-0000-4000-8000-000000000001'},
    update:{slug:'boulangerie-excellence'},
    create:{id:'00000000-0000-4000-8000-000000000001',name:'Boulangerie Excellence — Démo',slug:'boulangerie-excellence',currency:'XOF'},
  });
  const site=await prisma.site.upsert({
    where:{id:'00000000-0000-4000-8000-000000000101'},update:{},
    create:{id:'00000000-0000-4000-8000-000000000101',organizationId:organization.id,name:'Cocody Riviera',type:'BAKERY'},
  });
  const demoPassword=process.env.DEMO_OWNER_PASSWORD ?? 'BoulDemo!2026';
  await prisma.user.upsert({
    where:{organizationId_email:{organizationId:organization.id,email:'proprietaire@demo.boul.ci'}},
    update:{passwordHash:await hash(demoPassword)},
    create:{organizationId:organization.id,name:'Koffi Amani',email:'proprietaire@demo.boul.ci',passwordHash:await hash(demoPassword),role:Role.OWNER},
  });
  console.info(`Seed prêt : ${organization.name} / ${site.name}`);
  if(process.env.NODE_ENV!=='production')console.info('Compte démo : proprietaire@demo.boul.ci');
}

main().finally(()=>prisma.$disconnect());
