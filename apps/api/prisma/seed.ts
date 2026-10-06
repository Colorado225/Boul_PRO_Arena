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
  const ingredientsCategory=await prisma.materialCategory.upsert({where:{organizationId_name:{organizationId:organization.id,name:'Ingrédients de base'}},update:{},create:{organizationId:organization.id,name:'Ingrédients de base'}});
  const water=await prisma.rawMaterial.upsert({where:{organizationId_sku:{organizationId:organization.id,sku:'EAU'}},update:{baseUnitId:unitDefinitions[2].id},create:{organizationId:organization.id,sku:'EAU',name:'Eau',categoryId:ingredientsCategory.id,baseUnit:'L',baseUnitId:unitDefinitions[2].id,quantity:'1000',averageCost:'1',minimumStock:'200'}});
  const yeast=await prisma.rawMaterial.upsert({where:{organizationId_sku:{organizationId:organization.id,sku:'LEV-BOUL'}},update:{baseUnitId:unitDefinitions[0].id},create:{organizationId:organization.id,sku:'LEV-BOUL',name:'Levure boulangère',categoryId:ingredientsCategory.id,baseUnit:'KG',baseUnitId:unitDefinitions[0].id,quantity:'9',averageCost:'4000',minimumStock:'12'}});
  const salt=await prisma.rawMaterial.upsert({where:{organizationId_sku:{organizationId:organization.id,sku:'SEL'}},update:{baseUnitId:unitDefinitions[0].id},create:{organizationId:organization.id,sku:'SEL',name:'Sel fin',categoryId:ingredientsCategory.id,baseUnit:'KG',baseUnitId:unitDefinitions[0].id,quantity:'80',averageCost:'300',minimumStock:'20'}});
  const baguette=await prisma.product.upsert({where:{organizationId_sku:{organizationId:organization.id,sku:'BAG-CLASS'}},update:{salePrice:75},create:{organizationId:organization.id,sku:'BAG-CLASS',name:'Baguette classique',salePrice:75}});

  const site=await prisma.site.upsert({
    where:{id:'00000000-0000-4000-8000-000000000101'},update:{},
    create:{id:'00000000-0000-4000-8000-000000000101',organizationId:organization.id,name:'Cocody Riviera',type:'BAKERY'},
  });
  const demoPassword=process.env.DEMO_OWNER_PASSWORD ?? 'BoulDemo!2026';
  const owner=await prisma.user.upsert({
    where:{organizationId_email:{organizationId:organization.id,email:'proprietaire@demo.boul.ci'}},
    update:{passwordHash:await hash(demoPassword)},
    create:{organizationId:organization.id,name:'Koffi Amani',email:'proprietaire@demo.boul.ci',passwordHash:await hash(demoPassword),role:Role.OWNER},
  });
  const recipe=await prisma.recipe.upsert({where:{organizationId_name:{organizationId:organization.id,name:'Pain baguette'}},update:{productId:baguette.id},create:{organizationId:organization.id,productId:baguette.id,name:'Pain baguette',createdBy:owner.id}});
  if(await prisma.recipeVersion.count({where:{recipeId:recipe.id}})===0)await prisma.recipeVersion.create({data:{recipeId:recipe.id,version:1,status:'ACTIVE',yieldQuantity:'300',yieldUnitId:unitDefinitions[3].id,preparationMinutes:25,bakingMinutes:22,restingMinutes:60,bakingTemperatureC:'240',equipment:['Pétrin','Diviseuse','Four à sole'],instructions:['Pétrir les ingrédients jusqu’au développement du réseau de gluten.','Laisser reposer la pâte pendant 60 minutes.','Diviser, façonner puis cuire à 240 °C pendant 22 minutes.'],overheadCost:'3000',targetMarginPercent:'35',materialCost:'13635',productionCost:'16635',unitCost:'55.45',recommendedPrice:90,createdBy:owner.id,ingredients:{create:[{materialId:flour.id,quantity:'25',unitId:unitDefinitions[0].id,quantityInBaseUnit:'25',unitCostSnapshot:'500',totalCostSnapshot:'12500'},{materialId:water.id,quantity:'15',unitId:unitDefinitions[2].id,quantityInBaseUnit:'15',unitCostSnapshot:'1',totalCostSnapshot:'15'},{materialId:yeast.id,quantity:'250',unitId:unitDefinitions[1].id,quantityInBaseUnit:'0.25',unitCostSnapshot:'4000',totalCostSnapshot:'1000'},{materialId:salt.id,quantity:'400',unitId:unitDefinitions[1].id,quantityInBaseUnit:'0.4',unitCostSnapshot:'300',totalCostSnapshot:'120'}]}}});
  console.info(`Seed prêt : ${organization.name} / ${site.name}`);
  if(process.env.NODE_ENV!=='production')console.info('Compte démo : proprietaire@demo.boul.ci');
}

main().finally(()=>prisma.$disconnect());
