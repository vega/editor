/// <reference types="vitest" />
import {defineConfig} from 'vitest/config';
import react from '@vitejs/plugin-react';
import {resolve} from 'path';
import {readdirSync, lstatSync, existsSync, realpathSync} from 'fs';
import {execSync} from 'child_process';
import {playwright} from '@vitest/browser-playwright';

const commitHash = execSync('git rev-parse HEAD', {encoding: 'utf8'}).trim();

const nodeModulesPath = resolve(__dirname, 'node_modules');

const isVegaPackage = (packageName: string): boolean => packageName === 'vega' || packageName.startsWith('vega-');

const getVegaPackageNames = (): string[] => readdirSync(nodeModulesPath).filter(isVegaPackage);

// Vega packages symlinked into node modules mapped
// to their specific source entry point so edits are picked up without rebuilding.
const getLinkedVegaPackages = (): Map<string, {entry: string; srcDir: string}> => {
  const linked = new Map<string, {entry: string; srcDir: string}>();
  for (const packageName of getVegaPackageNames()) {
    const packagePath = resolve(nodeModulesPath, packageName);
    if (!lstatSync(packagePath).isSymbolicLink()) continue;

    const realPath = realpathSync(packagePath);
    const entry = [
      resolve(realPath, 'index.js'),
      resolve(realPath, 'src', 'index.js'),
      resolve(realPath, 'src', 'index.ts'),
    ].find(existsSync);
    const srcDir = resolve(realPath, 'src');

    if (entry && existsSync(srcDir)) {
      linked.set(packageName, {entry, srcDir});
    }
  }
  return linked;
};

function createVegaHMRPlugin() {
  const linkedPackages = getLinkedVegaPackages();
  return {
    name: 'vega-packages-hmr',
    enforce: 'pre' as const,

    resolveId(id: string) {
      return linkedPackages.get(id)?.entry ?? null;
    },

    configureServer(server: {watcher: {add: (path: string) => void}}) {
      for (const {srcDir} of linkedPackages.values()) {
        server.watcher.add(srcDir);
      }
    },

    // Make each linked package's entry module accept
    // updates for the whole package tree, so propagation stops there
    transform(code: string, id: string) {
      for (const [packageName, {entry}] of linkedPackages) {
        if (id === entry) {
          return {
            code: `${code}
if (import.meta.hot) {
  import.meta.hot.accept((newModule) => {
    window.dispatchEvent(
      new CustomEvent('vega-package-hmr', {detail: {packageName: ${JSON.stringify(packageName)}, module: newModule}}),
    );
  });
}
`,
            map: null,
          };
        }
      }
      return null;
    },
  };
}

export default defineConfig({
  plugins: [react(), createVegaHMRPlugin()],

  define: {
    'process.env.VITE_COMMIT_HASH': JSON.stringify(commitHash),
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
  },

  base: '/editor/',

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
    fs: {
      allow: ['..', resolve(__dirname, '../..')],
    },
  },

  optimizeDeps: {
    include: [],
    exclude: getVegaPackageNames(),
  },

  publicDir: 'public',

  test: {
    projects: [
      {
        test: {
          include: ['tests/unit/*.test.{ts,tsx}'],
          name: 'unit',
          environment: 'jsdom',
          globals: true,
          setupFiles: ['tests/setup.tsx'],
        },
      },
      {
        test: {
          include: ['tests/e2e/**/*.test.ts'],
          name: 'runtime',
          browser: {
            provider: playwright(),
            enabled: true,
            headless: false,
            instances: [{browser: 'chromium'}],
          },
          globals: true,
        },
      },
    ],
  },
});
