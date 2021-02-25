import {Config} from 'vega-lite-dev-config';

const config: Config = {
  module: 'vega-lite-dev-config',
  drivers: ['typescript', 'prettier', 'eslint'],
  settings: {
    react: true,
    node: false,
  },
};

export default config;
