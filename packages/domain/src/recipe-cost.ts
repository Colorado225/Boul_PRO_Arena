import Decimal from 'decimal.js';

export interface RecipeCostIngredient{id:string;name:string;quantityInBaseUnit:string;averageCostPerBaseUnit:string}
export interface RecipeCostInput{yieldQuantity:string;ingredients:readonly RecipeCostIngredient[];overheadCost?:string;sellingPrice?:string;targetMarginPercent?:string;priceRoundingIncrement?:string}
export interface RecipeIngredientCost{id:string;name:string;quantityInBaseUnit:string;unitCost:string;totalCost:string}
export interface RecipeCostResult{ingredients:RecipeIngredientCost[];materialCost:string;overheadCost:string;productionCost:string;unitCost:string;currentMarginPercent:string|null;recommendedPrice:string}

export class RecipeCostError extends Error{}

export function calculateRecipeCost(input:RecipeCostInput):RecipeCostResult{
  const yieldQuantity=positive(input.yieldQuantity,'La quantité produite');
  const overhead=new Decimal(input.overheadCost??0);
  if(overhead.isNegative())throw new RecipeCostError('Les frais de production ne peuvent pas être négatifs');
  const ingredients=input.ingredients.map(item=>{
    const quantity=positive(item.quantityInBaseUnit,`La quantité de ${item.name}`,true);
    const unitCost=new Decimal(item.averageCostPerBaseUnit);
    if(!unitCost.isFinite()||unitCost.isNegative())throw new RecipeCostError(`Le coût de ${item.name} est invalide`);
    return {id:item.id,name:item.name,quantityInBaseUnit:quantity.toFixed(),unitCost:unitCost.toFixed(),totalCost:quantity.mul(unitCost).toDecimalPlaces(6).toFixed()};
  });
  const material=ingredients.reduce((sum,item)=>sum.plus(item.totalCost),new Decimal(0));
  const production=material.plus(overhead);
  const unitCost=production.div(yieldQuantity);
  const sellingPrice=input.sellingPrice?new Decimal(input.sellingPrice):null;
  const currentMargin=sellingPrice?.gt(0)?sellingPrice.minus(unitCost).div(sellingPrice).mul(100):null;
  const margin=new Decimal(input.targetMarginPercent??35);
  if(margin.lt(0)||margin.gte(100))throw new RecipeCostError('La marge cible doit être comprise entre 0 et 100 %');
  const rawRecommended=unitCost.div(new Decimal(1).minus(margin.div(100)));
  const increment=positive(input.priceRoundingIncrement??'5','L’incrément de prix');
  const recommended=rawRecommended.div(increment).ceil().mul(increment);
  return {ingredients,materialCost:material.toDecimalPlaces(6).toFixed(),overheadCost:overhead.toDecimalPlaces(6).toFixed(),productionCost:production.toDecimalPlaces(6).toFixed(),unitCost:unitCost.toDecimalPlaces(6).toFixed(),currentMarginPercent:currentMargin?.toDecimalPlaces(2).toFixed()??null,recommendedPrice:recommended.toFixed()};
}

function positive(value:string,label:string,allowZero=false){const decimal=new Decimal(value);if(!decimal.isFinite()||(allowZero?decimal.isNegative():decimal.lte(0)))throw new RecipeCostError(`${label} doit être ${allowZero?'positive ou nulle':'strictement positive'}`);return decimal}
