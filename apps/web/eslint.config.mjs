import {defineConfig,globalIgnores} from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';

export default defineConfig([
  ...nextVitals,
  globalIgnores(['.next/**','out/**','dist/**','next-env.d.ts']),
  {
    rules:{
      'react-hooks/set-state-in-effect':'off',
      // Event handlers are declared inline in the current POS prototype.
      'react-hooks/purity':'off',
    },
  },
]);
