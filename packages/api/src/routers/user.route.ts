import { LibsqlError } from '@libsql/client'
import { ORPCError } from '@orpc/server'
import { DBErrorCode } from '@repo/utils/contants'
import { type } from 'arktype'
import { eq } from 'drizzle-orm'
import { headers } from 'next/headers'

import { auth } from '../auth/auth.server'
import { db } from '../db/client'
import { AccountSelectSchema, UserSelectSchema } from '../db/schema'
import { Accounts, Users } from '../db/schema/auth'
import { protectedProcedure } from '../lib/orpc.server'

const UserResponse = UserSelectSchema.omit('emailVerified').and({
  accounts: type(AccountSelectSchema.pick('providerId'), '[]'),
  hasPassword: 'boolean'
})

const UpdateUserInput = UserSelectSchema.pick('username', 'name', 'email').and({
  'password?': 'string',
  'newPassword?': 'string'
})

const UpdateUserResponse = UserSelectSchema.pick('username', 'name', 'email', 'updatedAt')

export const me = protectedProcedure.output(UserResponse).handler(async ({ context }) => {
  const userWithAccounts = await db
    .select()
    .from(Users)
    .leftJoin(Accounts, eq(Accounts.userId, Users.id))
    .where(eq(Users.id, context.session.user.id))

  const user = userWithAccounts[0]

  if (!user) {
    throw new ORPCError('NOT_FOUND', { message: 'User not found' })
  }

  const accounts = userWithAccounts
    .filter((userWithAccount) => !!userWithAccount.accounts)
    .map((userWithAccount) => userWithAccount.accounts!)

  return {
    id: user.users.id,
    name: user.users.name || null,
    username: user.users.username,
    email: user.users.email,
    image: user.users.image || null,
    createdAt: user.users.createdAt,
    updatedAt: user.users.updatedAt,
    accounts: accounts.map((account) => ({
      providerId: account.providerId
    })),
    hasPassword: !!accounts.find((account) => !!account.password)
  }
})

export const updateUser = protectedProcedure
  .input(UpdateUserInput)
  .output(UpdateUserResponse)
  .handler(async ({ input, context }) => {
    if (!input.username) {
      throw new ORPCError('BAD_REQUEST', { message: 'Username is required' })
    }

    if (input.password && input.newPassword) {
      await auth.api.changePassword({
        body: {
          newPassword: input.newPassword,
          currentPassword: input.password,
          revokeOtherSessions: true
        },
        headers: await headers()
      })
    }
    const updatedAt = new Date()

    try {
      await db
        .update(Users)
        .set({
          name: input.name,
          username: input.username,
          email: input.email || null,
          updatedAt
        })
        .where(eq(Users.id, context.session.user.id))
    } catch (error) {
      if (error instanceof LibsqlError) {
        if (error.code === DBErrorCode.SQLITE_CONSTRAINT_UNIQUE) {
          throw new ORPCError('BAD_REQUEST', { message: 'Credentials not available or already taken' })
        }
      }
      throw error
    }

    return {
      username: input.username,
      name: input.name,
      email: input.email,
      updatedAt
    }
  })
