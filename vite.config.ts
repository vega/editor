import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import legacy from '@vitejs/plugin-legacy';
import {resolve} from 'path';

const commitHash = process.env.VITE_COMMIT_HASH;
function linkedDependencyHMR() {
  return {
    name: 'linked-dependency-hmr',
    handleHotUpdate({file, server}) {
      if (file.includes('node_modules/vega-lite/src/') || file.includes('node_modules/vega-lite/build/')) {
        const module = server.moduleGraph.getModuleById('vega-lite');
        if (module) {
          server.reloadModule(module);
        }
        server.ws.send({
          type: 'full-reload',
        });
        return [];
      }
    },
  };
}

export default defineConfig({
  plugins: [
    react({
      include: '**/*.{jsx,tsx,ts,js}',
    }),
    linkedDependencyHMR(),
  ],
  define: {
    'process.env.PARCEL_BUILD_COMMIT_HASH': JSON.stringify(commitHash),
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
  },
  base: process.env.NODE_ENV === 'production' ? '/editor/' : '/',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      'vega-lite/vega-lite-schema.json': resolve(__dirname, 'node_modules/vega-lite/build/vega-lite-schema.json'),
    },
    preserveSymlinks: false,
  },
  server: {
    port: 1234,
    open: true,
    watch: {
      ignored: ['!**/node_modules/vega-lite/src/**', '!**/node_modules/vega-lite/build/**'],
    },
    fs: {
      allow: ['..'],
    },
  },
  optimizeDeps: {
    exclude: ['vega-lite'],
    entries: [],
  },
  publicDir: 'public',
});
