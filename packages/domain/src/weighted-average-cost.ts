import Decimal from 'decimal.js';

export class WeightedAverageCostError extends Error{}

export type WeightedAverageCostInput={
  currentQuantity:string;
  currentAverageCost:string;
  receivedQuantity:string;
  receivedLandedCost:string;
};

export function calculateWeightedAverageCost(input:WeightedAverageCostInput){
  const currentQuantity=new Decimal(input.currentQuantity);
  const currentAverageCost=new Decimal(input.currentAverageCost);
  const receivedQuantity=new Decimal(input.receivedQuantity);
  const receivedLandedCost=new Decimal(input.receivedLandedCost);
  if(currentQuantity.isNegative()||currentAverageCost.isNegative()||receivedQuantity.lte(0)||receivedLandedCost.isNegative())throw new WeightedAverageCostError('Quantités et coûts invalides');
  const receivedUnitCost=receivedLandedCost.div(receivedQuantity);
  const newQuantity=currentQuantity.plus(receivedQuantity);
  const inventoryValue=currentQuantity.mul(currentAverageCost).plus(receivedLandedCost);
  return {
    receivedUnitCost:receivedUnitCost.toDecimalPlaces(6).toString(),
    newQuantity:newQuantity.toDecimalPlaces(6).toString(),
    newAverageCost:inventoryValue.div(newQuantity).toDecimalPlaces(6).toString(),
    inventoryValue:inventoryValue.toDecimalPlaces(6).toString(),
  };
}

export function allocateLandedCosts(lineSubtotal:string,orderSubtotal:string,orderCharges:string){
  const line=new Decimal(lineSubtotal),subtotal=new Decimal(orderSubtotal),charges=new Decimal(orderCharges);
  if(line.isNegative()||subtotal.lte(0)||charges.isNegative())throw new WeightedAverageCostError('Base de répartition invalide');
  return line.plus(charges.mul(line.div(subtotal))).toDecimalPlaces(6).toString();
}
