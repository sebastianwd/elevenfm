import { Field, ID, Int, ObjectType } from 'type-graphql'

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

  @Field(() => String, { nullable: true })
  createdAt?: Date

  @Field(() => Int, { nullable: true })
  type?: number

  @Field(() => User, { nullable: true })
  user?: Partial<User>
}
