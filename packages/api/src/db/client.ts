import { createClient } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'

const client = createClient({
  url: process.env.NODE_ENV === 'production' ? process.env.TURSO_CONNECTION_URL! : 'file:local.db',
  authToken: process.env.NODE_ENV === 'production' ? process.env.TURSO_AUTH_TOKEN! : undefined
})

export const db = drizzle(client, { logger: true })
