import {PrismaClient,Role} from '@prisma/client';

const prisma=new PrismaClient();

async function main(){
  const organization=await prisma.organization.upsert({
    where:{id:'00000000-0000-4000-8000-000000000001'},
    update:{},
    create:{id:'00000000-0000-4000-8000-000000000001',name:'Boulangerie Excellence — Démo',currency:'XOF'},
  });
  const site=await prisma.site.upsert({
    where:{id:'00000000-0000-4000-8000-000000000101'},update:{},
    create:{id:'00000000-0000-4000-8000-000000000101',organizationId:organization.id,name:'Cocody Riviera',type:'BAKERY'},
  });
  await prisma.user.upsert({
    where:{organizationId_email:{organizationId:organization.id,email:'proprietaire@demo.boul.ci'}},update:{},
    create:{organizationId:organization.id,name:'Koffi Amani',email:'proprietaire@demo.boul.ci',role:Role.OWNER},
  });
  console.info(`Seed prêt : ${organization.name} / ${site.name}`);
}

main().finally(()=>prisma.$disconnect());
