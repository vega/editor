import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import legacy from '@vitejs/plugin-legacy';
import {resolve} from 'path';

const commitHash = process.env.VITE_COMMIT_HASH;

export default defineConfig({
  plugins: [
    react(),
    legacy({
      targets: ['defaults', 'not IE 11'],
    }),
  ],
  define: {
    'process.env.PARCEL_BUILD_COMMIT_HASH': JSON.stringify(commitHash),
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
  },
  base: '/editor/',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  resolve: {
    alias: {},
  },
  server: {
    port: 1234,
    open: true,
  },
  publicDir: 'public',
});
