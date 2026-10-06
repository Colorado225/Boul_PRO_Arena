import assert from 'node:assert/strict';
import {describe,it} from 'node:test';
import {BadRequestException,ForbiddenException} from '@nestjs/common';
import {mapException} from './problem-details.js';

describe('problem details mapping',()=>{
  it('maps validation arrays without exposing internals',()=>{
    const result=mapException(new BadRequestException(['email invalide','mot de passe requis']));
    assert.equal(result.status,400);
    assert.equal(result.code,'validation');
    assert.equal(result.title,'Requête invalide');
    assert.deepEqual(result.errors,['email invalide','mot de passe requis']);
  });
  it('maps authorization failures consistently',()=>{
    const result=mapException(new ForbiddenException('Permission insuffisante'));
    assert.deepEqual({...result,errors:undefined},{status:403,code:'forbidden',title:'Accès refusé',detail:'Permission insuffisante',errors:undefined});
  });
  it('hides unknown exception details',()=>{
    const result=mapException(new Error('secret database detail'));
    assert.equal(result.status,500);
    assert.equal(result.detail.includes('secret database detail'),false);
  });
});
