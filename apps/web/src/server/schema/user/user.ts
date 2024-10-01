import { Field, ID, InputType, ObjectType } from 'type-graphql'

import { Account } from '../account/account'

@ObjectType('user')
export class User {
  @Field(() => ID)
  id: string

  @Field(() => String, { nullable: true })
  name?: string

  @Field(() => String)
  username: string

  @Field(() => String, { nullable: true })
  email?: string

  @Field(() => String)
  createdAt: Date

  @Field(() => String)
  updatedAt: Date

  @Field(() => [Account])
  accounts: Account[]
}

@ObjectType('updateUserOutput')
export class UpdateUserOutput implements Partial<User> {
  @Field(() => String, { nullable: true })
  name?: string

  @Field(() => String)
  username: string

  @Field(() => String, { nullable: true })
  email?: string

  @Field(() => String)
  updatedAt: Date
}

@InputType('userInput')
export class UserInput {
  @Field(() => String)
  username: string

  @Field(() => String, { nullable: true })
  name?: string

  @Field(() => String, { nullable: true })
  email?: string

  @Field(() => String, { nullable: true })
  password?: string

  @Field(() => String, { nullable: true })
  newPassword?: string
}
