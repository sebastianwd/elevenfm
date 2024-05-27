import { type CodegenConfig } from "@graphql-codegen/cli";

const config = {
  schema: "http://localhost:3000/api/graphql",
  overwrite: true,
  documents: ["apps/web/src/**/*.gql"],
  generates: {
    "./apps/web/graphql.schema.json": {
      plugins: ["introspection"],
      config: {
        minify: true,
      },
    },
    "./packages/shared/generated/graphql.ts": {
      plugins: [
        {
          add: {
            content:
              'import type { DocumentNode } from "graphql/language/ast";',
          },
        },
        "typescript",
        "typescript-operations",
        "typescript-graphql-request",
      ],
      config: {
        avoidOptionals: true,
        useTypeImports: true,
      },
      hooks: {
        afterOneFileWrite: ["prettier --write"],
      },
    },
  },
} satisfies CodegenConfig;

export default config;
