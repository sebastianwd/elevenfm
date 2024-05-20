import { desc, eq } from 'drizzle-orm'
import { Field, ID, Int, ObjectType } from 'type-graphql'

import { db } from '~/db/db'
import { PlaylistsToSongs } from '~/db/schema'

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

export const getLastRankInPlaylist = async (playlistId: string) => {
  const [lastRank] = await db
    .select({
      rank: PlaylistsToSongs.rank,
    })
    .from(PlaylistsToSongs)
    .where(eq(PlaylistsToSongs.playlistId, playlistId))
    .orderBy(desc(PlaylistsToSongs.rank))
    .limit(1)

  return lastRank
}
