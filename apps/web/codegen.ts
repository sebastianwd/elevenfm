import { type CodegenConfig } from '@graphql-codegen/cli'

const config = {
  schema: 'http://localhost:3000/api/graphql',
  overwrite: true,
  documents: ['src/**/*.gql'],
  generates: {
    './src/generated/graphql.ts': {
      plugins: [
        'typescript',
        'typescript-operations',
        'typescript-graphql-request',
      ],
      config: {
        avoidOptionals: true,
      },
      hooks: {
        afterOneFileWrite: ['prettier --write'],
      },
    },
    'graphql.schema.json': {
      plugins: ['introspection'],
      config: {
        minify: true,
      },
    },
  },
} satisfies CodegenConfig

export default config
