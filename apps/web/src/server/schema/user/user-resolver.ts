import { LibsqlError } from '@libsql/client'
import argon2 from 'argon2'
import { eq, getTableColumns } from 'drizzle-orm'
import {
  Arg,
  Ctx,
  FieldResolver,
  Mutation,
  Query,
  Resolver,
  Root,
} from 'type-graphql'

import { dbErrorCodes } from '~/constants'
import { db } from '~/db/db'
import { Accounts, Users } from '~/db/schema'
import type { Context } from '~/types'

import { UpdateUserOutput, User, UserInput } from './user'

@Resolver(User)
export class UserResolver {
  @Query(() => User)
  async me(@Ctx() ctx: Context): Promise<User> {
    const session = ctx.session

    if (!session?.user) {
      throw new Error('Unauthorized')
    }

    const userWithAccounts = await db
      .select()
      .from(Users)
      .leftJoin(Accounts, eq(Accounts.userId, Users.id))
      .where(eq(Users.id, session.user.id))

    const user = userWithAccounts[0]

    if (!user.users) {
      throw new Error('User not found')
    }

    const accounts = userWithAccounts
      .filter((userWithAccount) => !!userWithAccount.accounts)
      .map((userWithAccount) => userWithAccount.accounts)

    return {
      id: user.users.id,
      name: user.users.name,
      username: user.users.username,
      email: user.users.email ?? undefined,
      createdAt: user.users.createdAt,
      updatedAt: user.users.updatedAt,
      accounts: accounts.map((account) => ({
        provider: account!.provider,
      })),
    }
  }

  @Mutation(() => UpdateUserOutput)
  async updateUser(
    @Ctx() ctx: Context,
    @Arg('user') user: UserInput
  ): Promise<UpdateUserOutput> {
    const session = ctx.session

    if (!session?.user) {
      throw new Error('Unauthorized')
    }

    if (!user.username) {
      throw new Error('Username is required')
    }

    const getNewPassword = async () => {
      if (user.password && user.newPassword) {
        const { password } = getTableColumns(Users)

        const [dbUser] = await db
          .select({ password })
          .from(Users)
          .where(eq(Users.id, session.user.id))

        const isValid = await argon2.verify(
          String(dbUser.password),
          user.password
        )

        if (!isValid) {
          throw new Error('Invalid password')
        }

        return {
          password: await argon2.hash(String(user.newPassword)),
        }
      }
      return {}
    }

    const updatedAt = new Date()

    try {
      await db
        .update(Users)
        .set({
          name: user.name,
          username: user.username,
          email: user.email || null,
          updatedAt,
          ...(await getNewPassword()),
        })
        .where(eq(Users.id, session.user.id))
    } catch (error) {
      if (error instanceof LibsqlError) {
        if (error.code === dbErrorCodes.SQLITE_CONSTRAINT_UNIQUE) {
          throw new Error('Credentials not available or already taken')
        }
      }
      throw error
    }

    return {
      username: user.username,
      name: user.name,
      email: user.email ?? undefined,
      updatedAt,
    }
  }

  @FieldResolver(() => Boolean)
  async hasPassword(@Root() user: User): Promise<boolean> {
    const { password } = getTableColumns(Users)

    const [dbUser] = await db
      .select({ password })
      .from(Users)
      .where(eq(Users.id, user.id))

    return !!dbUser.password
  }
}
