module.exports = {
  "parser": "@typescript-eslint/parser",
  "plugins": [
    "@typescript-eslint",
    "prettier",
    "react"
  ],
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended",
    "plugin:react/recommended"
  ],
  "overrides": [
    {
      "files": [
        "*.ts",
        "*.tsx"
      ]
    },
    {
      "files": ["vite.config.ts"],
      "parserOptions": {
        "project": "./tsconfig.json"
      },
      "env": {
        "node": true
      }
    }
  ],
  "settings": {
    "react": {
      "version": "detect"
    }
  },
  "env": {
    "browser": true,
    "node": false
  },
  "parserOptions": {
    "project": "tsconfig.json",
    "ecmaVersion": 2020,
    "sourceType": "module",
    "jsx": true
  },
  "rules": {
    "prettier/prettier": "warn",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-use-before-define": "off",
    "@typescript-eslint/ban-types": "warn",
    "@typescript-eslint/prefer-for-of": "error",
    "@typescript-eslint/no-for-in-array": "error",
    "@typescript-eslint/no-require-imports": "off",
    "@typescript-eslint/no-parameter-properties": "off",
    "@typescript-eslint/explicit-member-accessibility": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": "warn",
    "no-shadow": "off",
    "@typescript-eslint/no-shadow": "error",
    "@typescript-eslint/no-object-literal-type-assertion": "off",
    "@typescript-eslint/no-namespace": "error",
    "linebreak-style": [
      "error",
      "unix"
    ],
    "no-irregular-whitespace": [
      "error",
      {
        "skipComments": true
      }
    ],
    "no-alert": "off",
    "prefer-const": "error",
    "no-return-assign": "error",
    "no-useless-call": "error",
    "no-useless-concat": "error",
    "no-console": "off",
    "no-undef": "off",
    "no-unreachable": "off",
    "react/no-deprecated": "warn",
    "react/no-string-refs": "warn",
    "@typescript-eslint/no-var-requires": "off",
    "react/no-find-dom-node": "warn",
    "react/no-unescaped-entities": "off",
    "no-prototype-builtins": "warn",
    "@typescript-eslint/ban-ts-comment": "warn",
  },
  "globals": {
    "__COMMIT_HASH__": true
  }
};