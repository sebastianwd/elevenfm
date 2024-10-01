import { Field, ObjectType } from 'type-graphql'

@ObjectType('account')
export class Account {
  @Field(() => String)
  provider: string
}
