import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import {resolve} from 'path';
import {watch as fsWatch, readdirSync, lstatSync, existsSync} from 'fs';
import {execSync} from 'child_process';

const commitHash = execSync('git rev-parse HEAD', {encoding: 'utf8'}).trim();

const vegaUtils = {
  isVegaPackage: (packageName: string): boolean => packageName === 'vega' || packageName.startsWith('vega-'),

  isVegaModule: (url: string): boolean => url?.includes('vega-') || url?.includes('vega'),

  getNodeModulesPath: () => resolve(process.cwd(), 'node_modules'),

  getVegaPackageNames: (nodeModulesPath: string): string[] => {
    const items = readdirSync(nodeModulesPath);
    return items.filter((item) => vegaUtils.isVegaPackage(item));
  },

  findEntryPoint: (realPath: string): string | null => {
    const entryPoints = [
      resolve(realPath, 'index.js'),
      resolve(realPath, 'src', 'index.js'),
      resolve(realPath, 'src', 'index.ts'),
    ];
    return entryPoints.find(existsSync) || null;
  },

  resolvePackagePath: (packageName: string, nodeModulesPath: string) => {
    const packagePath = resolve(nodeModulesPath, packageName);
    if (!existsSync(packagePath)) return null;

    const stats = lstatSync(packagePath);
    if (stats.isSymbolicLink()) {
      const realPath = resolve(packagePath);
      return {
        realPath,
        entryPoint: vegaUtils.findEntryPoint(realPath),
        srcPath: resolve(realPath, 'src'),
      };
    }
    return null;
  },

  handleVegaFileChange: (server: any) => {
    const moduleGraph = server.moduleGraph;
    const modules = Array.from(moduleGraph.urlToModuleMap.values());
    const modulesToUpdate: any[] = [];

    modules.forEach((module: any) => {
      const isVegaModule = vegaUtils.isVegaModule(module.url);
      const importsVega =
        module.importedModules &&
        Array.from(module.importedModules).some((importedModule: any) =>
          vegaUtils.isVegaModule(importedModule.id || importedModule.url),
        );

      if (isVegaModule || importsVega) {
        modulesToUpdate.push(module);
        moduleGraph.invalidateModule(module);
      }
    });

    if (modulesToUpdate.length > 0) {
      server.ws.send({
        type: 'update',
        updates: modulesToUpdate.map((module) => ({
          type: 'js-update' as const,
          path: module.url,
          acceptedPath: module.url,
          timestamp: Date.now(),
        })),
      });

      server.ws.send({
        type: 'custom',
        event: 'vega-package-updating',
        data: {timestamp: Date.now()},
      });
    }
  },
};

function createVegaHMRPlugin() {
  return {
    name: 'vega-packages-hmr',
    enforce: 'pre' as const,

    configureServer(server: any) {
      const nodeModulesPath = resolve(__dirname, 'node_modules');
      const vegaPackageNames = vegaUtils.getVegaPackageNames(nodeModulesPath);

      const {vegaPackagePaths, vegaPackageAliases} = vegaPackageNames.reduce(
        (acc, packageName) => {
          const resolved = vegaUtils.resolvePackagePath(packageName, nodeModulesPath);
          if (resolved) {
            if (existsSync(resolved.srcPath)) {
              acc.vegaPackagePaths.push(resolved.srcPath);
            }
            if (resolved.entryPoint) {
              acc.vegaPackageAliases[packageName] = resolved.entryPoint;
            }
          }
          return acc;
        },
        {vegaPackagePaths: [] as string[], vegaPackageAliases: {} as Record<string, string>},
      );

      server.vegaPackageAliases = vegaPackageAliases;

      const watchers = vegaPackagePaths.map((srcPath) =>
        fsWatch(srcPath, {recursive: true}, (_, filename) => {
          if (filename?.match(/\.(ts|js)$/)) {
            vegaUtils.handleVegaFileChange(server);
          }
        }),
      );

      server.httpServer?.on('close', () => {
        watchers.forEach((watcher) => watcher.close());
      });
    },

    resolveId(id: string) {
      if (vegaUtils.isVegaPackage(id)) {
        const nodeModulesPath = resolve(__dirname, 'node_modules');
        const resolved = vegaUtils.resolvePackagePath(id, nodeModulesPath);
        return resolved?.entryPoint || null;
      }
      return null;
    },

    async transform(code: string, id: string) {
      if (id.includes('/vega') && id.includes('/src/')) {
        return {
          code: `
if (import.meta.hot) {
    import.meta.hot.accept();
}
${code}`,
          map: null,
        };
      }
    },
  };
}

export default defineConfig({
  plugins: [
    react({
      include: '**/*.{jsx,tsx,ts,js}',
    }),
    createVegaHMRPlugin(),
  ],

  define: {
    'process.env.VITE_COMMIT_HASH': JSON.stringify(commitHash),
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
  },

  base: '/',

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
    exclude: vegaUtils.getVegaPackageNames(vegaUtils.getNodeModulesPath()),
  },

  publicDir: 'public',
});
