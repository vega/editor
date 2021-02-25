import {TypeScriptConfig} from '@beemo/driver-typescript';

const config: TypeScriptConfig = {
  compilerOptions: {
    lib: ['esnext', 'dom'],
    strict: false,
  },
};

export default config;
