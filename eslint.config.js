import js from '@eslint/js';
import prettier from 'eslint-plugin-prettier';
import react from 'eslint-plugin-react';
import prettierConfig from 'eslint-config-prettier';
import globals from 'globals';
import vitest from '@vitest/eslint-plugin';
import tseslint from 'typescript-eslint';

export default [
  {
    ignores: ['dist/**', 'build/**', 'node_modules/**', 'public/**', '*.config.js', '*.config.ts', '*.config.cjs'],
  },

  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  vitest.configs.recommended,

  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
      globals: {
        __COMMIT_HASH__: 'readonly',
        ...globals.browser,
      },
    },
    plugins: {
      prettier,
      react,
      vitest,
    },
    settings: {
      vitest: {
        typeCheck: true,
      },
      react: {
        version: 'detect',
      },
    },
    rules: {
      'prettier/prettier': 'warn',

      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-explicit-any': 'off',

      // Some of these rules can be removed as we increase type safety
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/no-misused-promises': 'off',
      '@typescript-eslint/require-await': 'off',
      '@typescript-eslint/await-thenable': 'warn',
      '@typescript-eslint/no-redundant-type-constituents': 'warn',
      '@typescript-eslint/no-unnecessary-type-assertion': 'warn',
      '@typescript-eslint/no-use-before-define': 'off',
      '@typescript-eslint/prefer-for-of': 'error',
      '@typescript-eslint/no-for-in-array': 'error',
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/explicit-member-accessibility': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-shadow': 'error',
      '@typescript-eslint/no-namespace': 'error',
      '@typescript-eslint/ban-ts-comment': 'warn',
      '@typescript-eslint/no-unnecessary-type-assertion': 'off', // has false positives

      'no-unused-vars': 'off',
      'no-shadow': 'off',
      'linebreak-style': ['error', 'unix'],
      'no-irregular-whitespace': ['error', {skipComments: true}],
      'no-alert': 'off',
      'prefer-const': 'error',
      'no-return-assign': 'error',
      'no-useless-call': 'error',
      'no-useless-concat': 'error',
      'no-console': 'off',
      'no-undef': 'off',
      'no-unreachable': 'off',
      'no-prototype-builtins': 'warn',

      'react/react-in-jsx-scope': 'off',
      'react/no-deprecated': 'warn',
      'react/no-string-refs': 'warn',
      'react/no-find-dom-node': 'warn',
      'react/no-unescaped-entities': 'off',
      'react/prop-types': 'off',

      'vitest/no-commented-out-tests': 'off',
    },
  },
  prettierConfig,
  {
    files: ['**/*.js'],
    ...tseslint.configs.disableTypeChecked,
  },
];
