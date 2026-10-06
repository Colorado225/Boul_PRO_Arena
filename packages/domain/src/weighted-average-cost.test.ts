import assert from 'node:assert/strict';
import {describe,it} from 'node:test';
import {allocateLandedCosts,calculateWeightedAverageCost,WeightedAverageCostError} from './weighted-average-cost.js';

describe('weighted average inventory cost',()=>{
  it('includes allocated transport and taxes in the received unit cost',()=>{
    const landed=allocateLandedCosts('250000','300000','30000');
    assert.equal(landed,'275000');
    const result=calculateWeightedAverageCost({currentQuantity:'100',currentAverageCost:'480',receivedQuantity:'500',receivedLandedCost:landed});
    assert.equal(result.receivedUnitCost,'550');
    assert.equal(result.newQuantity,'600');
    assert.equal(result.newAverageCost,'538.333333');
  });
  it('starts inventory at the landed unit cost',()=>{
    const result=calculateWeightedAverageCost({currentQuantity:'0',currentAverageCost:'0',receivedQuantity:'500',receivedLandedCost:'260000'});
    assert.equal(result.newAverageCost,'520');
  });
  it('rejects empty receipts',()=>assert.throws(()=>calculateWeightedAverageCost({currentQuantity:'0',currentAverageCost:'0',receivedQuantity:'0',receivedLandedCost:'1'}),WeightedAverageCostError));
});
