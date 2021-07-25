import {ESLintConfig} from '@beemo/driver-eslint';

const config: ESLintConfig = {
  rules: {
    'react/no-deprecated': 'warn',
    'react/no-string-refs': 'warn',
    'no-alert': 'off',
    '@typescript-eslint/no-require-imports': 'off',
    '@typescript-eslint/no-var-requires': 'off',
    'react/no-find-dom-node': 'warn',
    'react/no-unescaped-entities': 'off',
    '@typescript-eslint/no-unused-vars': 'warn',
    'no-prototype-builtins': 'warn',
  },
  ignore: ['webpack.config.js'],
  globals: {__COMMIT_HASH__: true},
};

export default config;
