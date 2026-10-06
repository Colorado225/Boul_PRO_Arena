import assert from 'node:assert/strict';
import {describe,it} from 'node:test';
import {validateEnvironment} from './environment.js';

describe('environment validation',()=>{
  it('allows development without a database for UI work',()=>{
    assert.equal(validateEnvironment({NODE_ENV:'development'}).API_PORT,3001);
  });
  it('rejects production without Neon secrets',()=>{
    assert.throws(()=>validateEnvironment({NODE_ENV:'production'}),/DATABASE_URL est obligatoire/);
  });
  it('requires Neon TLS outside development',()=>{
    assert.throws(()=>validateEnvironment({NODE_ENV:'staging',DATABASE_URL:'postgresql://user:pass@example.com/db',DIRECT_URL:'postgresql://user:pass@example.com/db'}),/sslmode=require/);
  });
  it('accepts a complete production configuration',()=>{
    const value=validateEnvironment({NODE_ENV:'production',DATABASE_URL:'postgresql://user:pass@example.com/db?sslmode=require',DIRECT_URL:'postgresql://user:pass@example.com/db?sslmode=require',API_PORT:'8080'});
    assert.equal(value.API_PORT,8080);
  });
});
