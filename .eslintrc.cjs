/** @type {import("eslint").Linter.Config} */
module.exports = {
  parser: '@typescript-eslint/parser',
  root: true,
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: '.',
    ecmaFeatures: {
      jsx: true,
    },
    sourceType: 'module',
    extraFileExtensions: ['.json', '.d.ts'],
  },
  env: {
    browser: true,
    node: true,
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/typescript',
    'plugin:prettier/recommended',
    'next/core-web-vitals',
  ],
  plugins: ['@typescript-eslint', 'simple-import-sort', 'react-hooks', 'react'],
  rules: {
    'react-hooks/rules-of-hooks': 'warn',
    '@typescript-eslint/explicit-function-return-type': 0,
    '@typescript-eslint/no-use-before-define': 0,
    'react/prop-types': 0,
    'react/jsx-one-expression-per-line': 0,
    'react/require-default-props': 0,
    'react/react-in-jsx-scope': 0,
    'import/extensions': 0,
    'import/prefer-default-export': 0,
    'simple-import-sort/imports': 1,
    'simple-import-sort/exports': 1,
    'import/no-dynamic-require': 0,
    'jsx-a11y/anchor-is-valid': 0,
    'import/namespace': ['error', { allowComputed: true }],
    'react/jsx-filename-extension': [
      'warn',
      {
        extensions: ['.jsx', '.tsx', '.ts', '.d.ts'],
      },
    ],
  },
}
