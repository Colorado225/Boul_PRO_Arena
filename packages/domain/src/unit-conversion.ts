import Decimal from 'decimal.js';

export type UnitDimension='MASS'|'VOLUME'|'COUNT'|'PACKAGE';
export interface UnitDefinition{id:string;dimension:UnitDimension}
export interface ConversionRule{fromUnitId:string;toUnitId:string;factor:string;materialId?:string|null}
export interface ConvertQuantityInput{quantity:string;fromUnitId:string;toUnitId:string;materialId?:string;units:readonly UnitDefinition[];rules:readonly ConversionRule[];decimalPlaces?:number}

export class UnitConversionError extends Error{}

/** Converts without floating point arithmetic. Rules are traversed in both directions. */
export function convertQuantity(input:ConvertQuantityInput):string{
  const quantity=new Decimal(input.quantity);
  if(!quantity.isFinite()||quantity.isNegative())throw new UnitConversionError('La quantité doit être un nombre positif ou nul');
  if(input.fromUnitId===input.toUnitId)return quantity.toDecimalPlaces(input.decimalPlaces??6).toFixed();

  const unitById=new Map(input.units.map(unit=>[unit.id,unit]));
  const from=unitById.get(input.fromUnitId),to=unitById.get(input.toUnitId);
  if(!from||!to)throw new UnitConversionError('Unité inconnue');
  if(from.dimension!==to.dimension&&from.dimension!=='PACKAGE'&&to.dimension!=='PACKAGE')throw new UnitConversionError('Dimensions incompatibles');

  const applicable=input.rules.filter(rule=>!rule.materialId||rule.materialId===input.materialId);
  const graph=new Map<string,{unitId:string;factor:Decimal}[]>();
  const add=(source:string,target:string,factor:Decimal)=>graph.set(source,[...(graph.get(source)??[]),{unitId:target,factor}]);
  for(const rule of applicable){
    const factor=new Decimal(rule.factor);
    if(!factor.isFinite()||factor.lte(0))throw new UnitConversionError('Le facteur de conversion doit être strictement positif');
    add(rule.fromUnitId,rule.toUnitId,factor);
    add(rule.toUnitId,rule.fromUnitId,new Decimal(1).div(factor));
  }

  const queue:{unitId:string;factor:Decimal}[]=[{unitId:input.fromUnitId,factor:new Decimal(1)}];
  const visited=new Set<string>([input.fromUnitId]);
  while(queue.length){
    const current=queue.shift()!;
    for(const edge of graph.get(current.unitId)??[]){
      if(visited.has(edge.unitId))continue;
      const factor=current.factor.mul(edge.factor);
      if(edge.unitId===input.toUnitId)return quantity.mul(factor).toDecimalPlaces(input.decimalPlaces??6,Decimal.ROUND_HALF_UP).toFixed();
      visited.add(edge.unitId);queue.push({unitId:edge.unitId,factor});
    }
  }
  throw new UnitConversionError('Aucun chemin de conversion disponible');
}
