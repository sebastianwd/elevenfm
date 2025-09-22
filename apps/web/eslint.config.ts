import baseConfig from '@repo/eslint-config/base'
import reactConfig from '@repo/eslint-config/react'
import { defineConfig } from 'eslint/config'

export default defineConfig(...baseConfig, ...reactConfig)
