import assert from 'node:assert/strict';
import {describe,it} from 'node:test';
import {convertQuantity,UnitConversionError,type UnitDefinition} from './unit-conversion.js';

const units:UnitDefinition[]=[{id:'g',dimension:'MASS'},{id:'kg',dimension:'MASS'},{id:'sac',dimension:'PACKAGE'},{id:'l',dimension:'VOLUME'}];

describe('exact unit conversion',()=>{
  it('converts physical units in both directions',()=>{
    const rules=[{fromUnitId:'kg',toUnitId:'g',factor:'1000'}];
    assert.equal(convertQuantity({quantity:'2.5',fromUnitId:'kg',toUnitId:'g',units,rules}),'2500');
    assert.equal(convertQuantity({quantity:'500',fromUnitId:'g',toUnitId:'kg',units,rules}),'0.5');
  });
  it('uses a material-specific package conversion',()=>{
    const rules=[{fromUnitId:'sac',toUnitId:'kg',factor:'50',materialId:'farine'}];
    assert.equal(convertQuantity({quantity:'10',fromUnitId:'sac',toUnitId:'kg',materialId:'farine',units,rules}),'500');
    assert.throws(()=>convertQuantity({quantity:'10',fromUnitId:'sac',toUnitId:'kg',materialId:'sucre',units,rules}),UnitConversionError);
  });
  it('chains conversions without binary floating point drift',()=>{
    const rules=[{fromUnitId:'sac',toUnitId:'kg',factor:'50',materialId:'farine'},{fromUnitId:'kg',toUnitId:'g',factor:'1000'}];
    assert.equal(convertQuantity({quantity:'0.125',fromUnitId:'sac',toUnitId:'g',materialId:'farine',units,rules}),'6250');
  });
  it('rejects incompatible dimensions and invalid factors',()=>{
    assert.throws(()=>convertQuantity({quantity:'1',fromUnitId:'kg',toUnitId:'l',units,rules:[]}),/Dimensions incompatibles/);
    assert.throws(()=>convertQuantity({quantity:'1',fromUnitId:'kg',toUnitId:'g',units,rules:[{fromUnitId:'kg',toUnitId:'g',factor:'0'}]}),/strictement positif/);
  });
});
