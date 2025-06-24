import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import {resolve} from 'path';
import {watch as fsWatch} from 'fs';

const commitHash = process.env.VITE_COMMIT_HASH;

export default defineConfig({
  plugins: [
    react({
      include: '**/*.{jsx,tsx,ts,js}',
    }),
    {
      name: 'hmr',
      enforce: 'pre',
      configureServer(server) {
        const vegaLitePath = resolve(__dirname, 'node_modules/vega-lite/src');
        const watcher = fsWatch(vegaLitePath, {recursive: true}, async (_eventType, filename) => {
          if (filename && (filename.endsWith('.ts') || filename.endsWith('.js'))) {
            const moduleGraph = server.moduleGraph;

            const modules = Array.from(moduleGraph.urlToModuleMap.values());
            const vegaLiteModules: any[] = [];
            const dependentModules = new Set<any>();

            modules.forEach((module) => {
              if (module.id && (module.id.includes('vega-lite') || module.url?.includes('vega-lite'))) {
                vegaLiteModules.push(module);
                moduleGraph.invalidateModule(module);
              }

              if (module.importedModules) {
                for (const importedModule of module.importedModules) {
                  if (importedModule.id?.includes('vega-lite')) {
                    dependentModules.add(module);
                    break;
                  }
                }
              }
            });

            dependentModules.forEach((module) => {
              moduleGraph.invalidateModule(module);
            });

            if (vegaLiteModules.length > 0) {
              server.ws.send({
                type: 'update',
                updates: vegaLiteModules.map((module) => ({
                  type: 'js-update' as const,
                  path: module.url,
                  acceptedPath: module.url,
                  timestamp: Date.now(),
                })),
              });
            }
          }
        });

        server.httpServer?.on('close', () => {
          watcher.close();
        });
      },
    },
  ],
  define: {
    'process.env.VITE_COMMIT_HASH': JSON.stringify(commitHash),
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
      'vega/vega-schema.json': resolve(__dirname, 'node_modules/vega/build/vega-schema.json'),
      'vega-lite': resolve(__dirname, '../../vega-lite/src/'),
    },
    preserveSymlinks: false,
  },
  server: {
    port: 1234,
    open: true,
    watch: {
      ignored: ['!**/node_modules/vega-lite/**'],
      followSymlinks: true,
    },
    fs: {
      allow: ['..', resolve(__dirname, '../../vega-lite')],
    },
  },
  optimizeDeps: {
    include: [],
    exclude: ['vega-lite', 'vega'],
  },
  publicDir: 'public',
});
