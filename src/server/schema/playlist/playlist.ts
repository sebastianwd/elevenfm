import { Field, ID, ObjectType } from 'type-graphql'

import { UserSong } from '../song/song'
import { User } from '../user/user'

@ObjectType('playlist')
export class Playlist {
  @Field(() => ID)
  id: string

  @Field()
  name: string

  @Field(() => [UserSong], { nullable: true })
  songs?: UserSong[]

  @Field(() => Number, { nullable: true })
  songsCount?: number

  @Field(() => String, { nullable: true })
  createdAt?: Date

  @Field(() => User, { nullable: true })
  user?: Partial<User>
}
