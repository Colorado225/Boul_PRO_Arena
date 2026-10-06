import tseslint from 'typescript-eslint';

export default tseslint.config(
  {ignores:['**/node_modules/**','**/dist/**','**/.next/**','**/*.d.ts']},
  ...tseslint.configs.recommended,
  {
    files:['apps/api/src/**/*.ts','packages/domain/src/**/*.ts'],
    rules:{
      '@typescript-eslint/no-explicit-any':'off',
      '@typescript-eslint/no-namespace':'off',
      '@typescript-eslint/no-unused-vars':['error',{argsIgnorePattern:'^_',varsIgnorePattern:'^_'}],
    },
  },
);
