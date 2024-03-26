import react from '@vitejs/plugin-react';
import childProcess from 'child_process';
import type {UserConfig} from 'vite';

const commitHash = childProcess.execSync('git rev-parse --short HEAD').toString();

import type {PluginOption} from 'vite';

const vegaPackages = [
  'vega-lite',
  'vega',
  'vega-scale',
  'vega-embed',
  'vega-schema-url-parser',
  'vega-themes',
  'vega-tooltip',
];

function watchNodeModules(modules: string[]): PluginOption {
  return {
    name: 'watch-node-modules',
    config() {
      return {
        server: {
          watch: {
            ignored: modules.map((m) => `!**/node_modules/${m}/**`),
          },
        },
        optimizeDeps: {
          exclude: modules,
        },
      };
    },
  };
}

const config: UserConfig = {
  base: '/editor/',
  define: {
    __COMMIT_HASH__: JSON.stringify(commitHash),
  },
  plugins: [react(), watchNodeModules(vegaPackages)],
  resolve: {
    preserveSymlinks: true,

    alias: {
      'vega-lite/build/vega-lite-schema.json': 'vega-lite/build/vega-lite-schema.json',
      'vega-lite': 'vega-lite/src/index.ts',
    },
  },
};

export default config;
