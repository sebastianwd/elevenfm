import { init } from '@paralleldrive/cuid2'
import { and, desc, eq, getTableColumns } from 'drizzle-orm'
import { chunk } from 'lodash'
import spotifyFetch from 'spotify-url-info'
import { Arg, Ctx, ID, Mutation, Query, Resolver } from 'type-graphql'

import { db } from '~/db/db'
import { Playlists, PlaylistsToSongs, Songs, Users } from '~/db/schema'
import { type Context } from '~/types'

import { Playlist } from './playlist'

const { getTracks } = spotifyFetch(fetch)

const createId = init({
  length: 8,
})

const isValidUrl = (
  url: string
): url is `https://open.spotify.com/playlist/${string}` => {
  return url.startsWith('https://open.spotify.com/playlist/')
}

@Resolver(Playlist)
export class PlaylistResolver {
  @Mutation(() => Playlist)
  async importPlaylist(
    @Arg('url') url: string,
    @Ctx() ctx: Context
  ): Promise<Playlist> {
    if (!isValidUrl(url)) {
      throw new Error('Invalid URL')
    }

    const tracks = await getTracks(url)

    const session = ctx.session

    if (!session?.user) {
      throw new Error('Unauthorized')
    }

    const playlistName = `playlist-${createId()}`

    const createdPlaylistId = await db.transaction(async (tx) => {
      const [createdPlaylist] = await tx
        .insert(Playlists)
        .values({
          name: playlistName,
          userId: session?.user.id,
          updatedAt: new Date(),
        })
        .returning({ insertedId: Playlists.id })

      await Promise.all(
        chunk(tracks, 50).map(async (chunk) => {
          const createdSongs = await tx
            .insert(Songs)
            .values(
              chunk.map((track) => ({
                title: track.name,
                artist: track.artist,
              }))
            )
            .returning({ insertedId: Songs.id })

          await tx.insert(PlaylistsToSongs).values(
            createdSongs.map((song) => ({
              playlistId: createdPlaylist.insertedId,
              songId: song.insertedId,
            }))
          )
        })
      )

      return createdPlaylist.insertedId
    })

    return {
      id: createdPlaylistId,
      name: playlistName,
      user: {
        id: session.user.id,
      },
    }
  }

  @Query(() => [Playlist])
  async userPlaylists(@Ctx() ctx: Context): Promise<Playlist[]> {
    const session = ctx.session

    if (!session?.user) {
      throw Error('Unauthorized')
    }

    const playlists = await db
      .select()
      .from(Playlists)
      .where(eq(Playlists.userId, session.user.id))
      .orderBy(desc(Playlists.createdAt))

    return playlists.map((playlist) => ({
      id: playlist.id,
      name: playlist.name,
      userId: playlist.userId,
      songsCount: playlist.songsCount ?? 0,
      createdAt: playlist.createdAt,
    }))
  }

  @Query(() => Playlist)
  async playlist(
    @Arg('playlistId', () => ID) playlistId: string,
    @Ctx() ctx: Context
  ): Promise<Partial<Playlist>> {
    const session = ctx.session

    if (!session?.user) {
      throw new Error('Unauthorized')
    }

    const songs = await db
      .select()
      .from(Songs)
      .innerJoin(PlaylistsToSongs, eq(PlaylistsToSongs.songId, Songs.id))
      .where(eq(PlaylistsToSongs.playlistId, playlistId))

    const [userPlaylist] = await db
      .select()
      .from(Playlists)
      .innerJoin(Users, eq(Playlists.userId, Users.id))
      .where(eq(Playlists.id, playlistId))

    return {
      id: playlistId,
      name: userPlaylist.playlists.name,
      user: {
        id: userPlaylist.users.id,
        name: userPlaylist.users.name,
      },
      songs: songs.map((song) => ({
        id: song.songs.id,
        title: song.songs.title,
        artist: song.songs.artist,
      })),
    }
  }

  @Mutation(() => Playlist)
  async createPlaylist(
    @Ctx() ctx: Context,
    @Arg('name', { nullable: true }) name?: string
  ): Promise<Playlist> {
    const session = ctx.session

    if (!session?.user) {
      throw new Error('Unauthorized')
    }

    const playlistName = name ?? `playlist-${createId()}`

    const [createdPlaylist] = await db
      .insert(Playlists)
      .values({
        name: playlistName,
        userId: session.user.id,
        updatedAt: new Date(),
      })
      .returning({ insertedId: Playlists.id })

    return {
      id: createdPlaylist.insertedId,
      name: playlistName,
      user: {
        id: session.user.id,
      },
    }
  }

  @Mutation(() => Boolean)
  async removeFromPlaylist(
    @Arg('playlistId', () => ID) playlistId: string,
    @Arg('songId', () => ID) songId: string,
    @Ctx() ctx: Context
  ): Promise<boolean> {
    const session = ctx.session

    const { userId } = getTableColumns(Playlists)

    const [playlist] = await db
      .select({
        userId,
      })
      .from(Playlists)
      .where(eq(Playlists.id, playlistId))

    if (!session?.user || playlist.userId !== session.user.id) {
      throw new Error('Unauthorized')
    }

    await db
      .delete(PlaylistsToSongs)
      .where(
        and(
          eq(PlaylistsToSongs.playlistId, playlistId),
          eq(PlaylistsToSongs.songId, songId)
        )
      )

    return true
  }
}
