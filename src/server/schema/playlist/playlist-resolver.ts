import { init } from '@paralleldrive/cuid2'
import { and, desc, eq, getTableColumns } from 'drizzle-orm'
import getArtistTitle from 'get-artist-title'
import { chunk, isEmpty, map } from 'lodash'
import spotifyFetch from 'spotify-url-info'
import { Arg, Ctx, ID, Mutation, Query, Resolver } from 'type-graphql'

import { db } from '~/db/db'
import { Playlists, PlaylistsToSongs, Songs, Users } from '~/db/schema'
import { logger } from '~/server/logger'
import { invidious } from '~/server/modules/invidious/invidious'
import { type Context } from '~/types'
import { ytGetId } from '~/utils/get-yt-url-id'

import { SongInput } from '../song/song'
import { Playlist } from './playlist'

const { getTracks } = spotifyFetch(fetch)

const createId = init({
  length: 8,
})

const isValidUrl = (
  url: string
): url is `https://open.spotify.com/${string}` => {
  return (
    url.startsWith('https://open.spotify.com/playlist/') ||
    url.startsWith('https://open.spotify.com/track/')
  )
}

const getExternalPlaylistTracks = async (
  url: string,
  source: 'spotify' | 'youtube'
) => {
  if (source === 'spotify') {
    return (await getTracks(url)).map((track) => ({
      title: track.name,
      artist: track.artist,
    }))
  }

  const ytId = ytGetId(url)
  if (!ytId) return []

  if (ytId.type === 'video') {
    const videoInfo = await invidious.getVideoInfo({ videoId: ytId.id })

    const [artist, title] = getArtistTitle(videoInfo.data.title, {
      defaultArtist: videoInfo.data.author,
      defaultTitle: videoInfo.data.title,
    }) || ['Unknown', 'Unknown']

    return [
      {
        title,
        artist,
      },
    ]
  }

  return map(
    (await invidious.getPlaylist({ playlistId: ytId.id })).data.videos,
    (video) => {
      const [artist, title] = getArtistTitle(video.title, {
        defaultArtist: video.author,
        defaultTitle: video.title,
      }) || ['Unknown', 'Unknown']

      return {
        title,
        artist,
      }
    }
  )
}

@Resolver(Playlist)
export class PlaylistResolver {
  @Mutation(() => Playlist)
  async importPlaylist(
    @Ctx() ctx: Context,
    @Arg('url') url: string,
    @Arg('playlistId', () => ID, { nullable: true }) playlistId?: string
  ): Promise<Playlist> {
    const isValidSpotifyUrl = isValidUrl(url)
    const isValidYoutubeUrl = !isValidSpotifyUrl && ytGetId(url)

    if (!isValidSpotifyUrl && !isValidYoutubeUrl) {
      throw new Error('Invalid URL')
    }

    const session = ctx.session

    if (!session?.user) {
      throw new Error('Unauthorized')
    }

    const [existingPlaylist] = playlistId
      ? await db
          .select({
            id: Playlists.id,
          })
          .from(Playlists)
          .where(
            and(
              eq(Playlists.id, playlistId),
              eq(Playlists.userId, session.user.id)
            )
          )
      : [null]

    if (playlistId && !existingPlaylist) {
      throw new Error('Playlist not found')
    }

    const tracks = await getExternalPlaylistTracks(
      url,
      isValidSpotifyUrl ? 'spotify' : 'youtube'
    )

    const playlistName = `playlist-${createId()}`

    const createdPlaylistId = await db.transaction(async (tx) => {
      const [createdPlaylist] = existingPlaylist
        ? [{ insertedId: existingPlaylist.id }]
        : await tx
            .insert(Playlists)
            .values({
              name: playlistName,
              userId: session?.user.id,
              updatedAt: new Date(),
            })
            .returning({ insertedId: Playlists.id })

      try {
        await Promise.all(
          chunk(tracks, 50).map(async (chunk) => {
            console.log(
              'tracks',
              chunk.map((track) => ({
                title: track.title,
                artist: track.artist,
              }))
            )
            const createdSongs = await tx
              .insert(Songs)
              .values(chunk)
              .onConflictDoNothing()
              .returning({ insertedId: Songs.id })

            await tx.insert(PlaylistsToSongs).values(
              createdSongs.map((song) => ({
                playlistId: createdPlaylist.insertedId,
                songId: song.insertedId,
              }))
            )
          })
        )
      } catch (error) {
        throw new Error('Error importing playlist or all songs already exist')
      }

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

    return map(playlists, (playlist) => ({
      id: playlist.id,
      name: playlist.name,
      userId: playlist.userId,
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

    if (!userPlaylist) {
      throw new Error('Playlist not found')
    }

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
        createdAt: song.playlistsToSongs.createdAt,
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

  @Mutation(() => Boolean)
  async deletePlaylist(
    @Arg('playlistId', () => ID) playlistId: string,
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

    await db.delete(Playlists).where(eq(Playlists.id, playlistId))

    return true
  }

  @Mutation(() => Playlist)
  async updatePlaylist(
    @Arg('playlistId', () => ID) playlistId: string,
    @Arg('name') name: string,
    @Ctx() ctx: Context
  ): Promise<Playlist> {
    const session = ctx.session

    const { userId } = getTableColumns(Playlists)

    if (!session?.user) {
      throw new Error('Unauthorized')
    }

    const [playlist] = await db
      .select({
        userId,
      })
      .from(Playlists)
      .where(eq(Playlists.id, playlistId))

    if (playlist.userId !== session.user.id) {
      throw new Error('Unauthorized')
    }

    await db
      .update(Playlists)
      .set({
        name,
      })
      .where(eq(Playlists.id, playlistId))

    return {
      id: playlistId,
      name,
      user: {
        id: session.user.id,
      },
    }
  }

  @Mutation(() => Boolean)
  async addToPlaylist(
    @Ctx() ctx: Context,
    @Arg('playlistId', () => ID) playlistId: string,
    @Arg('songIds', () => [ID], { nullable: true }) songIds?: string[],
    @Arg('songs', () => [SongInput], { nullable: true })
    songs?: SongInput[]
  ): Promise<boolean> {
    const session = ctx.session

    const { userId } = getTableColumns(Playlists)

    if (!session?.user) {
      throw new Error('Unauthorized')
    }

    if (!songIds && !songs) {
      throw new Error('No songs provided')
    }

    const [playlist] = await db
      .select({
        userId,
      })
      .from(Playlists)
      .where(eq(Playlists.id, playlistId))

    if (playlist.userId !== session.user.id) {
      throw new Error('Unauthorized')
    }

    const hasExistingSongs = !isEmpty(songIds)

    const itemsCount = hasExistingSongs ? songIds!.length : songs?.length

    try {
      if (hasExistingSongs) {
        const createdSongs = await db
          .insert(PlaylistsToSongs)
          .values(
            songIds!.map((songId) => ({
              playlistId,
              songId,
            }))
          )
          .onConflictDoNothing()
          .returning({ insertedId: PlaylistsToSongs.songId })

        if (createdSongs.length === 0) {
          throw new Error('Existing song already in playlist')
        }
      } else if (songs) {
        await Promise.all(
          chunk(songs, 50).map(async (chunk) => {
            const createdSongs = await db
              .insert(Songs)
              .values(chunk)
              .onConflictDoUpdate({
                target: [Songs.title, Songs.artist, Songs.album],
                set: { updatedAt: new Date() },
              })
              .returning({ insertedId: Songs.id })

            await db.insert(PlaylistsToSongs).values(
              createdSongs.map((song) => ({
                playlistId,
                songId: song.insertedId,
              }))
            )
          })
        )
      }
    } catch (error) {
      logger.error(error)
      throw new Error(`Song${itemsCount === 1 ? '' : 's'} already in playlist`)
    }

    return true
  }
}
