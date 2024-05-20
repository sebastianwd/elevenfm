import { Field, ID, ObjectType } from 'type-graphql'

@ObjectType('user')
export class User {
  @Field(() => ID)
  id: string

  @Field(() => String)
  name: string

  @Field(() => String, { nullable: true })
  email?: number
}
