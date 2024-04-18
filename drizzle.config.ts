import dotenv from 'dotenv'
import type { Config } from 'drizzle-kit'

dotenv.config({ path: ['.env.local', '.env'] })

export default {
  schema: './src/db/schema.ts',
  out: './migrations',
  driver: 'turso',
  dbCredentials: {
    url:
      process.env.NODE_ENV === 'production'
        ? process.env.TURSO_CONNECTION_URL!
        : 'file:local.db',
    authToken:
      process.env.NODE_ENV === 'production'
        ? process.env.TURSO_AUTH_TOKEN!
        : undefined,
  },
} satisfies Config
