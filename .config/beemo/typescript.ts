import {TypeScriptConfig} from '@beemo/driver-typescript';

const config: TypeScriptConfig = {
  compilerOptions: {
    lib: ['esnext', 'dom'],
    strict: false,
    skipLibCheck: true,
  },
};

export default config;
