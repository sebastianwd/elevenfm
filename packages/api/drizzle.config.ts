import dotenv from 'dotenv'
import { defineConfig } from 'drizzle-kit'

if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: ['.env.local', '.env'] })
}

export default defineConfig({
  schema: './src/db/schema',
  out: './migrations',
  dialect: 'turso',
  dbCredentials: {
    url: process.env.NODE_ENV === 'production' ? process.env.TURSO_CONNECTION_URL! : 'file:local.db',
    authToken: process.env.NODE_ENV === 'production' ? process.env.TURSO_AUTH_TOKEN! : undefined
  }
})
