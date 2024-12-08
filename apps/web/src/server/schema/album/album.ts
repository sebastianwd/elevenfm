import { Field, ObjectType } from 'type-graphql'

@ObjectType('albumTracks')
export class AlbumTracks {
  @Field(() => [String], { nullable: true })
  tracks?: string[]
}

@ObjectType('album')
export class Album extends AlbumTracks {
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

  @Field({ nullable: true })
  albumId?: string
}
