import assert from 'node:assert/strict';
import {describe,it} from 'node:test';
import {roleHasAllPermissions,roleHasPermission} from './access-control.js';

describe('RBAC bakery policy',()=>{
  it('allows an owner to perform all critical actions',()=>{
    assert.equal(roleHasAllPermissions('OWNER',['users:invite','stock:adjust','sales:void','finance:manage']),true);
  });
  it('prevents a cashier from changing costs or voiding sales',()=>{
    assert.equal(roleHasPermission('CASHIER','materials:manage'),false);
    assert.equal(roleHasPermission('CASHIER','sales:void'),false);
    assert.equal(roleHasPermission('CASHIER','sales:create'),true);
  });
  it('keeps external accountants read-oriented',()=>{
    assert.equal(roleHasPermission('ACCOUNTANT_EXTERNAL','finance:read'),true);
    assert.equal(roleHasPermission('ACCOUNTANT_EXTERNAL','finance:manage'),false);
    assert.equal(roleHasPermission('ACCOUNTANT_EXTERNAL','reports:export'),true);
  });
  it('prevents bakers from approving production',()=>{
    assert.equal(roleHasPermission('BAKER','production:create'),true);
    assert.equal(roleHasPermission('BAKER','production:approve'),false);
  });
});
