import { AccessDenied, CredentialsSignin } from '@auth/core/errors'
import { UpstashRedisAdapter } from '@auth/upstash-redis-adapter'
import { Redis } from '@upstash/redis'
import argon2 from 'argon2'
import { and, eq } from 'drizzle-orm'
import { random } from 'lodash'
import { cookies } from 'next/headers'
import NextAuth, { type NextAuthConfig } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GithubProvider from 'next-auth/providers/github'

import { db } from './db/db'
import { Accounts, Users } from './db/schema'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
})

const validateCsrfToken = (tokenValue: string) => {
  const csrfCookie = cookies().get(
    process.env.NODE_ENV === 'production'
      ? '__Host-authjs.csrf-token'
      : 'authjs.csrf-token'
  )
  const csrfValue = csrfCookie?.value?.split('|').at(0)

  return csrfValue === tokenValue
}

export const { handlers, auth } = NextAuth({
  adapter: UpstashRedisAdapter(redis, { baseKeyPrefix: 'efm:' }),
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60,
  },
  providers: [
    GithubProvider({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    }),
    CredentialsProvider({
      id: 'credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
        csrfToken: { type: 'text' },
        action: { type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials) {
          throw new CredentialsSignin('Invalid Credentials')
        }

        const { username, password, action } = credentials

        const isTokenValid = validateCsrfToken(credentials.csrfToken as string)
        if (!isTokenValid) {
          throw new AccessDenied('CSRF token mismatch')
        }

        if (!username || !password || !action) {
          return null
        }

        if (action === 'login') {
          const [user] = await db
            .select()
            .from(Users)
            .where(eq(Users.username, String(username)))

          if (!user?.password) {
            throw new CredentialsSignin()
          }

          const isValid = await argon2.verify(user.password, String(password))

          if (!isValid) {
            throw new CredentialsSignin()
          }

          return {
            id: user.id,
            name: user.name,
            email: user.email,
          }
        } else {
          const [existingUser] = await db
            .select()
            .from(Users)
            .where(eq(Users.username, String(username)))

          if (existingUser) {
            throw new CredentialsSignin()
          }

          const [insertedUser] = await db
            .insert(Users)
            .values({
              username: String(username),
              name: String(username),
              password: await argon2.hash(String(password)),
              updatedAt: new Date(),
            })
            .returning({
              insertedId: Users.id,
              name: Users.name,
              email: Users.email,
            })

          return {
            id: insertedUser.insertedId,
            name: insertedUser.name,
            email: insertedUser.email,
          }
        }
      },
    }),
  ],
  secret: process.env.AUTH_SECRET,
  /*events: {
    signIn: async (message) => {},
  },*/
  callbacks: {
    session: ({ session, token }) => {
      if (session && token) {
        session.user.id = token.id! || token.sub!
      }

      return session
    },
    signIn: async ({ user, account }) => {
      if (!account) {
        return false
      }

      if (
        (account.provider !== 'credentials' && !user.email) ||
        (account.provider === 'credentials' && !user.name)
      ) {
        return false
      }

      // sign up first time user with oauth provider
      if (user.email) {
        const [existingUser] = await db
          .select()
          .from(Users)
          .where(eq(Users.email, user.email))

        if (!existingUser) {
          const usernameFromEmail = user.email.substring(
            0,
            user.email.lastIndexOf('@')
          )

          const [createdUser] = await db
            .insert(Users)
            .values({
              name: `${user.name!}`,
              username: `${usernameFromEmail}#${random(1000, 9999)}`,
              email: `${user.email}`,
              updatedAt: new Date(),
            })
            .returning({ insertedId: Users.id })

          await db.insert(Accounts).values({
            provider: account.provider,
            providerAccountId: account.providerAccountId,
            updatedAt: new Date(),
            userId: createdUser.insertedId,
          })
        }
      }

      return true
    },
    async jwt({ token, trigger, account, user, session }) {
      if (trigger === 'signIn' || trigger === 'signUp') {
        const isOAuth = account && account.provider !== 'credentials'

        if (isOAuth) {
          const [usersByAccount] = await db
            .select()
            .from(Accounts)
            .innerJoin(Users, eq(Users.id, Accounts.userId))
            .where(
              and(
                eq(Accounts.providerAccountId, account.providerAccountId),
                eq(Accounts.provider, account.provider)
              )
            )

          return {
            ...token,
            id: usersByAccount.users.id,
          }
        } else if (user.id) {
          return {
            ...token,
            id: user.id,
          }
        }
      }

      if (trigger === 'update' && session) {
        return {
          ...token,
          name: session.name ?? token.name,
          email: session.email ?? token.email,
        }
      }

      return token
    },
  },
} satisfies NextAuthConfig)
