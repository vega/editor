import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import childProcess from 'child_process';

const commitHash = childProcess.execSync('git rev-parse --short HEAD').toString();

export default defineConfig({
  base: '/editor/',
  define: {
    __COMMIT_HASH__: JSON.stringify(commitHash),
  },
  plugins: [react()],
  resolve: {
    preserveSymlinks: true,
  },
});
