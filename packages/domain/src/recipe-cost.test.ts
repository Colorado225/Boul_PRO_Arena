import assert from 'node:assert/strict';
import {describe,it} from 'node:test';
import {calculateRecipeCost} from './recipe-cost.js';

describe('recipe cost engine',()=>{
  const baguette={yieldQuantity:'300',ingredients:[
    {id:'farine',name:'Farine',quantityInBaseUnit:'25',averageCostPerBaseUnit:'500'},
    {id:'eau',name:'Eau',quantityInBaseUnit:'15',averageCostPerBaseUnit:'1'},
    {id:'levure',name:'Levure',quantityInBaseUnit:'0.25',averageCostPerBaseUnit:'4000'},
    {id:'sel',name:'Sel',quantityInBaseUnit:'0.4',averageCostPerBaseUnit:'300'},
  ],overheadCost:'3000',sellingPrice:'75',targetMarginPercent:'35',priceRoundingIncrement:'5'};
  it('explains material, production and unit costs',()=>{
    const result=calculateRecipeCost(baguette);
    assert.equal(result.materialCost,'13635');
    assert.equal(result.productionCost,'16635');
    assert.equal(result.unitCost,'55.45');
  });
  it('computes the current margin and a rounded advised price',()=>{
    const result=calculateRecipeCost(baguette);
    assert.equal(result.currentMarginPercent,'26.07');
    assert.equal(result.recommendedPrice,'90');
  });
  it('rejects impossible yields and margins',()=>{
    assert.throws(()=>calculateRecipeCost({...baguette,yieldQuantity:'0'}),/strictement positive/);
    assert.throws(()=>calculateRecipeCost({...baguette,targetMarginPercent:'100'}),/comprise entre/);
  });
});
