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
  const unitDefinitions=[
    {id:'10000000-0000-4000-8000-000000000001',code:'KG',name:'Kilogramme',symbol:'kg',dimension:'MASS' as const,decimalPlaces:3},
    {id:'10000000-0000-4000-8000-000000000002',code:'G',name:'Gramme',symbol:'g',dimension:'MASS' as const,decimalPlaces:0},
    {id:'10000000-0000-4000-8000-000000000003',code:'L',name:'Litre',symbol:'L',dimension:'VOLUME' as const,decimalPlaces:3},
    {id:'10000000-0000-4000-8000-000000000004',code:'UNIT',name:'Unité',symbol:'u',dimension:'COUNT' as const,decimalPlaces:0},
    {id:'10000000-0000-4000-8000-000000000005',code:'SAC',name:'Sac',symbol:'sac',dimension:'PACKAGE' as const,decimalPlaces:0},
  ];
  for(const unit of unitDefinitions)await prisma.unit.upsert({where:{organizationId_code:{organizationId:organization.id,code:unit.code}},update:unit,create:{...unit,organizationId:organization.id}});
  await prisma.unitConversion.upsert({where:{id:'11000000-0000-4000-8000-000000000001'},update:{factor:'1000'},create:{id:'11000000-0000-4000-8000-000000000001',organizationId:organization.id,fromUnitId:unitDefinitions[0].id,toUnitId:unitDefinitions[1].id,factor:'1000'}});
  const category=await prisma.materialCategory.upsert({where:{organizationId_name:{organizationId:organization.id,name:'Farines & céréales'}},update:{},create:{organizationId:organization.id,name:'Farines & céréales'}});
  const flour=await prisma.rawMaterial.upsert({where:{organizationId_sku:{organizationId:organization.id,sku:'FAR-T55'}},update:{baseUnitId:unitDefinitions[0].id,purchaseUnitId:unitDefinitions[4].id,categoryId:category.id},create:{organizationId:organization.id,sku:'FAR-T55',name:'Farine T55',categoryId:category.id,baseUnit:'KG',baseUnitId:unitDefinitions[0].id,purchaseUnitId:unitDefinitions[4].id,quantity:'842',averageCost:'500',minimumStock:'300'}});
  await prisma.unitConversion.upsert({where:{id:'11000000-0000-4000-8000-000000000002'},update:{factor:'50',materialId:flour.id},create:{id:'11000000-0000-4000-8000-000000000002',organizationId:organization.id,fromUnitId:unitDefinitions[4].id,toUnitId:unitDefinitions[0].id,factor:'50',materialId:flour.id}});

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
