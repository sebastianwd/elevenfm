import argon2 from 'argon2'
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { username } from 'better-auth/plugins'

import { db } from '../db/client'
import { Accounts, Sessions, Users, Verifications } from '../db/schema/auth'

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'sqlite',
    schema: { account: Accounts, session: Sessions, user: Users, verification: Verifications }
  }),
  socialProviders: {
    github: {
      clientId: process.env.AUTH_GITHUB_ID as string,
      clientSecret: process.env.AUTH_GITHUB_SECRET as string
    }
  },
  emailAndPassword: {
    enabled: true,
    password: {
      hash: argon2.hash,
      verify: (data) => argon2.verify(data.hash, data.password)
    }
  },
  plugins: [username()],
  session: {
    expiresIn: 60 * 60 * 24 * 7
  },
  advanced: {
    defaultCookieAttributes: {
      sameSite: 'none',
      secure: true,
      httpOnly: true
    }
  }
})
