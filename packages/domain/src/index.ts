export * from './access-control.js';
export * from './money.js';
export * from './financial-engine.js';

/** Shared domain contracts. No framework or infrastructure dependency is allowed here. */
export type TenantId=string;
export type EntityId=string;
export type XofAmount=number;

export interface TenantContext{organizationId:TenantId;userId:EntityId;siteIds:EntityId[]}
export interface Money{amount:XofAmount;currency:'XOF'}

export function xof(amount:number):Money{
  if(!Number.isSafeInteger(amount))throw new Error('XOF amount must be a safe integer');
  return {amount,currency:'XOF'};
}
