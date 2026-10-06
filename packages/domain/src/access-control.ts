export const PERMISSIONS=[
  'organization:read','organization:manage',
  'users:read','users:invite','users:manage',
  'sites:read','sites:manage',
  'products:read','products:manage',
  'materials:read','materials:manage',
  'stock:read','stock:move','stock:adjust',
  'purchases:read','purchases:create','purchases:approve',
  'recipes:read','recipes:manage',
  'production:read','production:create','production:approve',
  'sales:read','sales:create','sales:void',
  'cash:read','cash:operate','cash:close','cash:approve',
  'finance:read','finance:manage',
  'reports:read','reports:export',
  'audit:read','settings:manage',
] as const;

export type Permission=typeof PERMISSIONS[number];
export type RoleName='SUPER_ADMIN'|'OWNER'|'DIRECTOR'|'GENERAL_MANAGER'|'ACCOUNTANT'|'FINANCE_MANAGER'|'STORE_MANAGER'|'PRODUCTION_MANAGER'|'BAKER'|'CASHIER'|'SALES_AGENT'|'PURCHASING_MANAGER'|'STOCK_MANAGER'|'AUDITOR'|'ACCOUNTANT_EXTERNAL'|'READ_ONLY';

const all=new Set<Permission>(PERMISSIONS);
const readOnly=PERMISSIONS.filter(permission=>permission.endsWith(':read'));
const grants:Record<RoleName,readonly Permission[]>={
  SUPER_ADMIN:PERMISSIONS,
  OWNER:PERMISSIONS,
  DIRECTOR:PERMISSIONS.filter(p=>p!=='settings:manage'),
  GENERAL_MANAGER:PERMISSIONS.filter(p=>!['organization:manage','settings:manage'].includes(p)),
  ACCOUNTANT:['organization:read','sites:read','sales:read','purchases:read','stock:read','finance:read','finance:manage','reports:read','reports:export'],
  FINANCE_MANAGER:['organization:read','sites:read','sales:read','purchases:read','purchases:approve','stock:read','finance:read','finance:manage','reports:read','reports:export'],
  STORE_MANAGER:['organization:read','users:read','sites:read','products:read','materials:read','stock:read','stock:move','purchases:read','recipes:read','production:read','sales:read','sales:void','cash:read','cash:close','reports:read'],
  PRODUCTION_MANAGER:['organization:read','sites:read','products:read','materials:read','materials:manage','stock:read','stock:move','recipes:read','recipes:manage','production:read','production:create','production:approve','reports:read'],
  BAKER:['sites:read','products:read','materials:read','stock:read','recipes:read','production:read','production:create'],
  CASHIER:['sites:read','products:read','stock:read','sales:read','sales:create','cash:read','cash:operate'],
  SALES_AGENT:['sites:read','products:read','stock:read','sales:read','sales:create'],
  PURCHASING_MANAGER:['organization:read','sites:read','materials:read','materials:manage','stock:read','purchases:read','purchases:create','purchases:approve','reports:read'],
  STOCK_MANAGER:['organization:read','sites:read','products:read','materials:read','materials:manage','stock:read','stock:move','stock:adjust','purchases:read','production:read','reports:read'],
  AUDITOR:[...readOnly,'audit:read','reports:export'],
  ACCOUNTANT_EXTERNAL:['organization:read','sites:read','sales:read','purchases:read','stock:read','finance:read','reports:read','reports:export','audit:read'],
  READ_ONLY:readOnly,
};

export function permissionsFor(role:RoleName):readonly Permission[]{return grants[role]??[]}
export function roleHasPermission(role:RoleName,permission:Permission):boolean{return role==='SUPER_ADMIN'||new Set(grants[role]).has(permission)}
export function roleHasAllPermissions(role:RoleName,permissions:readonly Permission[]):boolean{return role==='SUPER_ADMIN'||permissions.every(permission=>roleHasPermission(role,permission))}
export function isPermission(value:string):value is Permission{return all.has(value as Permission)}
