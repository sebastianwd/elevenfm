import { ObjectType, Field } from 'type-graphql'

@ObjectType()
export class Album {
  @Field()
  name: string

  @Field()
  artist: string

  @Field({ nullable: true })
  coverImage?: string

  @Field({ nullable: true })
  genre?: string

  @Field({ nullable: true })
  description?: string

  @Field({ nullable: true })
  year?: string

  @Field(() => [String], { nullable: true })
  tracks?: string[]
}
