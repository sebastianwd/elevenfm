import swdEslintPlugin from 'swd-eslint-config'
import tseslint from 'typescript-eslint'

export default tseslint.config({
  languageOptions: {
    parserOptions: {
      parser: tseslint.parser,
      tsconfigRootDir: import.meta.dirname,
      project: ['./tsconfig.json'],
    },
  },
  ignores: ['**/generated/*', 'node_modules'],
  extends: [
    ...swdEslintPlugin.configs.base,
    ...swdEslintPlugin.configs.react({ framework: 'next' }),
  ],
})
