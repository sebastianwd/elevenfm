/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import { type Linter } from 'eslint'
import swdEslintPlugin from 'swd-eslint-config'

export default swdEslintPlugin.configs.base as Linter.Config[]
