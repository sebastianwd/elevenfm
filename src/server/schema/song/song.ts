import { Field, InputType, Int, ObjectType } from 'type-graphql'

@ObjectType('song')
export class Song {
  @Field()
  title: string

  @Field()
  artist!: string

  @Field({ nullable: true })
  album?: string

  @Field({ nullable: true })
  playcount?: string

  @Field({ nullable: true })
  year?: string

  @Field({ nullable: true })
  duration?: string

  @Field({ nullable: true })
  genre?: string

  @Field(() => Int, { nullable: true })
  playlistId?: number | null
}
@ObjectType('userSong')
export class UserSong extends Song {
  @Field()
  id: string

  @Field(() => String, { nullable: true })
  createdAt?: Date
}

@ObjectType('songVideo')
export class SongVideo {
  @Field()
  title: string

  @Field()
  artist!: string

  @Field()
  videoId!: string

  @Field()
  thumbnailUrl?: string
}

@ObjectType('songAlbum')
export class SongAlbum {
  @Field()
  title: string

  @Field()
  artist!: string

  @Field()
  coverUrl?: string
}

@ObjectType('songLyrics')
export class SongLyrics {
  @Field()
  title: string

  @Field()
  artist: string

  @Field()
  lyrics?: string
}

@InputType('songInput')
export class SongInput {
  @Field()
  title: string

  @Field()
  artist: string

  @Field({ nullable: true })
  album?: string
}
