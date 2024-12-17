import { Field, ObjectType } from 'type-graphql'

@ObjectType('albumDetails')
export class AlbumDetails {
  @Field(() => [String], { nullable: true })
  tracks?: string[]

  @Field({ nullable: true })
  description?: string
}

@ObjectType('album')
export class Album extends AlbumDetails {
  @Field()
  name: string

  @Field()
  artist: string

  @Field({ nullable: true })
  coverImage?: string

  @Field({ nullable: true })
  genre?: string

  @Field({ nullable: true })
  year?: string

  @Field({ nullable: true })
  albumId?: string
}
