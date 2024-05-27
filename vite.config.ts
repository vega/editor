import react from '@vitejs/plugin-react';
import childProcess from 'node:child_process';
import type {UserConfig} from 'vite';

const commitHash = childProcess.execSync('git rev-parse --short HEAD').toString();

const config: UserConfig = {
  base: '/editor/',
  define: {
    __COMMIT_HASH__: JSON.stringify(commitHash),
  },
  plugins: [react()],
  resolve: {
    preserveSymlinks: true,

    alias: {
      'vega-lite/build/vega-lite-schema.json': 'vega-lite/build/vega-lite-schema.json',
      'vega-lite': 'vega-lite/src/index.ts',
    },
  },
};

export default config;
