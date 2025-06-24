import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import {resolve} from 'path';
import {watch as fsWatch, readdirSync, lstatSync, existsSync} from 'fs';
const commitHash = process.env.VITE_COMMIT_HASH;

function getVegaPackages() {
  const nodeModulesPath = resolve(process.cwd(), 'node_modules');
  const vegaPackages: string[] = [];
  const items = readdirSync(nodeModulesPath);
  for (const item of items) {
    if (item === 'vega' || item.startsWith('vega-')) {
      vegaPackages.push(item);
    }
  }
  return [...new Set([...vegaPackages])];
}

export default defineConfig({
  plugins: [
    react({
      include: '**/*.{jsx,tsx,ts,js}',
    }),
    {
      name: 'vega-packages-hmr',
      enforce: 'pre',
      configureServer(server) {
        const nodeModulesPath = resolve(__dirname, 'node_modules');
        const vegaPackagePaths: string[] = [];
        const vegaPackageAliases: Record<string, string> = {};

        const items = readdirSync(nodeModulesPath);
        for (const item of items) {
          if (item === 'vega' || item.startsWith('vega-')) {
            const packagePath = resolve(nodeModulesPath, item);
            const stats = lstatSync(packagePath);
            if (stats.isSymbolicLink()) {
              const realPath = resolve(packagePath);
              const srcPath = resolve(realPath, 'src');

              if (existsSync(srcPath)) {
                vegaPackagePaths.push(srcPath);
              }

              const indexPath = resolve(realPath, 'index.js');
              if (existsSync(indexPath)) {
                vegaPackageAliases[item] = indexPath;
              } else if (existsSync(srcPath)) {
                const srcIndexPath = resolve(srcPath, 'index.js');
                if (existsSync(srcIndexPath)) {
                  vegaPackageAliases[item] = srcIndexPath;
                }
              }
            }
          }
        }

        (server as any).vegaPackageAliases = vegaPackageAliases;

        const watchers: any[] = [];

        vegaPackagePaths.forEach((srcPath) => {
          const watcher = fsWatch(srcPath, {recursive: true}, (_eventType, filename) => {
            if (filename && (filename.endsWith('.ts') || filename.endsWith('.js'))) {
              console.log(`Vega file changed: ${filename}`);
              const moduleGraph = server.moduleGraph;

              const modules = Array.from(moduleGraph.urlToModuleMap.values());
              const vegaModules: any[] = [];
              const dependentModules = new Set<any>();

              modules.forEach((module: any) => {
                if (
                  module.id &&
                  (module.id.includes('vega-') ||
                    module.id.includes('vega') ||
                    module.url?.includes('vega-') ||
                    module.url?.includes('vega'))
                ) {
                  vegaModules.push(module);
                  moduleGraph.invalidateModule(module);
                }

                if (module.importedModules) {
                  for (const importedModule of module.importedModules) {
                    if (
                      importedModule.id &&
                      (importedModule.id.includes('vega-') || importedModule.id.includes('vega'))
                    ) {
                      dependentModules.add(module);
                      break;
                    }
                  }
                }
              });

              dependentModules.forEach((module: any) => {
                moduleGraph.invalidateModule(module);
              });

              if (vegaModules.length > 0) {
                server.ws.send({
                  type: 'update',
                  updates: vegaModules.map((module: any) => ({
                    type: 'js-update' as const,
                    path: module.url,
                    acceptedPath: module.url,
                    timestamp: Date.now(),
                  })),
                });
              }
            }
          });
          watchers.push(watcher);
        });

        server.httpServer?.on('close', () => {
          watchers.forEach((watcher) => watcher.close());
        });
      },
      resolveId(id, importer) {
        if (id.startsWith('vega') && (id === 'vega' || id.startsWith('vega-'))) {
          const nodeModulesPath = resolve(__dirname, 'node_modules');
          const packagePath = resolve(nodeModulesPath, id);

          const stats = lstatSync(packagePath);
          if (stats.isSymbolicLink()) {
            const realPath = resolve(packagePath);

            const entryPoints = [
              resolve(realPath, 'index.js'),
              resolve(realPath, 'src', 'index.js'),
              resolve(realPath, 'src', 'index.ts'),
            ];

            for (const entryPoint of entryPoints) {
              if (existsSync(entryPoint)) {
                return entryPoint;
              }
            }
          }
        }
        return null;
      },
      async transform(code, id) {
        if (id.includes('/vega') && id.includes('/src/')) {
          const hmrCode = `
      if (import.meta.hot) {
          import.meta.hot.accept();
    }
${code}`;
          return {
            code: hmrCode,
            map: null,
          };
        }
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
      allow: ['..', resolve(__dirname, '../..')],
    },
  },
  optimizeDeps: {
    include: [],
    exclude: getVegaPackages(),
  },
  publicDir: 'public',
});
