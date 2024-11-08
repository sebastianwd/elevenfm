import { init } from '@paralleldrive/cuid2'
import { and, desc, eq, getTableColumns, inArray } from 'drizzle-orm'
import getArtistTitle from 'get-artist-title'
import { LexoRank } from 'lexorank'
import { chunk, isEmpty, keyBy, map } from 'lodash'
import spotifyFetch from 'spotify-url-info'
import { Arg, Ctx, ID, Mutation, Query, Resolver } from 'type-graphql'

import { playlistType } from '~/constants'
import { db } from '~/db/db'
import { Playlists, PlaylistsToSongs, Songs, Users } from '~/db/schema'
import { logger } from '~/server/logger'
import { invidious } from '~/server/modules/invidious/invidious'
import { soundcloud } from '~/server/modules/soundcloud/soundcloud'
import { type Context } from '~/types'
import { ytGetId } from '~/utils/get-yt-url-id'
import { sanitizeSongTitle } from '~/utils/song-title-utils'

import { SongInput } from '../song/song'
import { getLastRankInPlaylist, Playlist } from './playlist'

const spotifyRequest = spotifyFetch(fetch)

const createId = init({
  length: 6,
})

const getUrlSourceName = (url: string) => {
  if (
    url.startsWith('https://open.spotify.com/playlist/') ||
    url.startsWith('https://open.spotify.com/track/')
  ) {
    return 'spotify'
  }

  if (ytGetId(url)) {
    return 'youtube'
  }

  if (
    url.match(
      /^https?:\/\/(www\.|m\.)?soundcloud\.com\/[a-z0-9](?!.*?(-|_){2})[\w-]{1,23}[a-z0-9](?:\/.+)?$/
    )
  ) {
    return 'soundcloud'
  }
}

const formatYoutubeTitle = (title: string, author: string) => {
  // remove ":"
  const formattedTitle = title.replace(/(?<=\s|^):(\w+)/g, '$1')

  const [songArtist, songTitle] = getArtistTitle(formattedTitle, {
    defaultArtist: author,
    defaultTitle: title,
  }) || ['Unknown', 'Unknown']

  return {
    // replace " - Topic" with ""
    artist: songArtist.replace(/ - Topic$/, ''),
    title: sanitizeSongTitle(songTitle),
  }
}

const getExternalPlaylistTracks = async (
  url: string,
  source: 'spotify' | 'youtube' | 'soundcloud'
): Promise<{ title: string; artist: string; url?: string }[]> => {
  if (source === 'spotify') {
    return (await spotifyRequest.getTracks(url)).map((track) => ({
      title: track.name,
      artist: track.artist,
    }))
  }

  if (source === 'youtube') {
    const ytId = ytGetId(url)
    if (!ytId) return []

    if (ytId.type === 'video') {
      const videoInfo = await invidious.getVideoInfo({ videoId: ytId.id })

      return [
        {
          ...formatYoutubeTitle(videoInfo.data.title, videoInfo.data.author),
          url,
        },
      ]
    }

    return map(
      (await invidious.getPlaylist({ playlistId: ytId.id })).data.videos,
      (video) => formatYoutubeTitle(video.title, video.author)
    )
  }

  if (source === 'soundcloud') {
    const data = await soundcloud.getTrack(url)

    return [
      {
        ...formatYoutubeTitle(data.title, data.user.username),
        url,
      },
    ]
  }

  return []
}

@Resolver(Playlist)
export class PlaylistResolver {
  @Mutation(() => Playlist)
  async importPlaylist(
    @Ctx() ctx: Context,
    @Arg('url') url: string,
    @Arg('playlistId', () => ID, { nullable: true }) playlistId?: string
  ): Promise<Playlist> {
    const urlSourceName = getUrlSourceName(url)

    if (!urlSourceName) {
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

    const tracks = await getExternalPlaylistTracks(url, urlSourceName)

    if (tracks.length === 0) {
      throw new Error('No tracks found in url')
    }

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
            const createdSongs = await tx
              .insert(Songs)
              .values(chunk)
              .onConflictDoUpdate({
                target: [Songs.title, Songs.artist, Songs.album],
                set: { updatedAt: new Date() },
              })
              .returning({
                insertedId: Songs.id,
                insertedTitle: Songs.title,
                insertedArtist: Songs.artist,
              })

            const songsByTitleArtist = keyBy(
              chunk,
              (song) => `${song.artist}${song.title}`
            )

            const lastRank = await getLastRankInPlaylist(
              createdPlaylist.insertedId
            )

            let currentRank = lastRank?.rank
              ? LexoRank.parse(lastRank.rank).genNext()
              : LexoRank.middle()

            await tx.insert(PlaylistsToSongs).values(
              createdSongs.map((createdSong) => {
                const song = {
                  playlistId: createdPlaylist.insertedId,
                  songId: createdSong.insertedId,
                  songUrl:
                    songsByTitleArtist[
                      `${createdSong.insertedArtist}${createdSong.insertedTitle}`
                    ]?.url || null,
                  rank: currentRank.toString(),
                }
                currentRank = currentRank.genNext()

                return song
              })
            )
          })
        )
      } catch (error) {
        logger.error(error)
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
      .where(
        and(
          eq(Playlists.userId, session.user.id),
          eq(Playlists.type, playlistType.PLAYLIST)
        )
      )
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
      type: userPlaylist.playlists.type,
      user: {
        id: userPlaylist.users.id,
        name: userPlaylist.users.name,
      },
      songs: songs.map((song) => ({
        id: song.songs.id,
        title: song.songs.title,
        artist: song.songs.artist,
        songUrl: song.playlistsToSongs.songUrl || undefined,
        rank: song.playlistsToSongs.rank || undefined,
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
      await db.transaction(async (tx) => {
        if (hasExistingSongs && !!songIds) {
          const songUrls = await tx
            .select({
              songUrl: PlaylistsToSongs.songUrl,
              songId: PlaylistsToSongs.songId,
            })
            .from(PlaylistsToSongs)
            .where(inArray(PlaylistsToSongs.songId, songIds))

          const songUrlById = keyBy(songUrls, (song) => song.songId)

          const lastRank = await getLastRankInPlaylist(playlistId)

          let currentRank = lastRank?.rank
            ? LexoRank.parse(lastRank.rank).genNext()
            : LexoRank.middle()

          const createdSongs = await tx
            .insert(PlaylistsToSongs)
            .values(
              songIds.map((songId) => {
                const song = {
                  playlistId,
                  songId,
                  songUrl: songUrlById[songId]?.songUrl || null,
                  rank: currentRank.toString(),
                }
                currentRank = currentRank.genNext()

                return song
              })
            )
            .onConflictDoNothing()
            .returning({ insertedId: PlaylistsToSongs.songId })

          if (createdSongs.length === 0) {
            throw new Error('Song already in playlist')
          }
        } else if (songs) {
          await Promise.all(
            chunk(songs, 50).map(async (chunk) => {
              const createdSongs = await tx
                .insert(Songs)
                .values(chunk)
                .onConflictDoUpdate({
                  target: [Songs.title, Songs.artist, Songs.album],
                  set: { updatedAt: new Date() },
                })
                .returning({ insertedId: Songs.id })

              const lastRank = await getLastRankInPlaylist(playlistId)

              let currentRank = lastRank?.rank
                ? LexoRank.parse(lastRank.rank).genNext()
                : LexoRank.middle()

              await tx.insert(PlaylistsToSongs).values(
                createdSongs.map((createdSong) => {
                  const song = {
                    playlistId,
                    songId: createdSong.insertedId,
                    rank: currentRank.toString(),
                  }
                  currentRank = currentRank.genNext()

                  return song
                })
              )
            })
          )
        }
      })
    } catch (error) {
      logger.error(error)
      throw new Error(`Song${itemsCount === 1 ? '' : 's'} already in playlist`)
    }

    return true
  }

  @Mutation(() => Playlist)
  async createSongRadio(
    @Ctx() ctx: Context,
    @Arg('songId', () => ID, { nullable: true }) songId?: string,
    @Arg('songTitle', { nullable: true }) songTitle?: string,
    @Arg('songArtist', { nullable: true }) songArtist?: string
  ): Promise<Playlist> {
    const session = ctx.session

    if (!session?.user) {
      throw new Error('Unauthorized')
    }
    if (!songId && !songTitle) {
      throw new Error('No song provided')
    }

    const { id: playlistId, name } = getTableColumns(Playlists)
    const { id: colSongId } = getTableColumns(Songs)

    const [existingSong] =
      songTitle && songArtist && !songId
        ? await db
            .select({ id: colSongId })
            .from(Songs)
            .where(
              and(eq(Songs.title, songTitle), eq(Songs.artist, songArtist))
            )
        : [null]

    const existingSongId = songId || existingSong?.id

    if (existingSongId) {
      const [radioPlaylist] = await db
        .select({
          playlistId,
          name,
        })
        .from(Playlists)
        .where(
          and(
            eq(Playlists.userId, session.user.id),
            eq(Playlists.radioSongId, existingSongId)
          )
        )

      if (radioPlaylist) {
        return {
          id: radioPlaylist.playlistId,
          name: radioPlaylist.name,
        }
      }
    }

    const { data: videoData } = await invidious.getVideos({
      query: `${songArtist} - ${songTitle}`,
    })

    const video = videoData[0]

    if (!video) {
      throw new Error('Video not found')
    }

    const { data: radioData } = await invidious.getMix({
      videoId: video.videoId,
    })

    if (!radioData) {
      throw new Error('Could not create radio from song :(')
    }

    const songs = radioData.videos.map((video) =>
      formatYoutubeTitle(video.title, video.author)
    )

    const radioPlaylistName = `${songArtist} Radio`

    const createdRadioPlaylist = await db.transaction(async (tx) => {
      const [createdRadioSong] = await tx
        .insert(Songs)
        .values({
          title: songTitle!,
          artist: songArtist!,
        })
        .onConflictDoUpdate({
          target: [Songs.title, Songs.artist, Songs.album],
          set: { updatedAt: new Date() },
        })
        .returning({ insertedId: Songs.id })

      const [createdPlaylist] = await tx
        .insert(Playlists)
        .values({
          name: radioPlaylistName,
          userId: session.user.id,
          radioSongId: createdRadioSong.insertedId,
          type: playlistType.RADIO,
          updatedAt: new Date(),
        })
        .returning({ insertedId: Playlists.id })

      await Promise.all(
        chunk(songs, 50).map(async (chunk) => {
          const createdSongs = await tx
            .insert(Songs)
            .values(chunk)
            .onConflictDoUpdate({
              target: [Songs.title, Songs.artist, Songs.album],
              set: { updatedAt: new Date() },
            })
            .returning({ insertedId: Songs.id })

          await tx
            .insert(PlaylistsToSongs)
            .values(
              createdSongs.map((song) => ({
                playlistId: createdPlaylist.insertedId,
                songId: song.insertedId,
              }))
            )
            .onConflictDoNothing()
        })
      )

      return createdPlaylist
    })

    return {
      id: createdRadioPlaylist.insertedId,
      name: radioPlaylistName,
      user: {
        id: session.user.id,
      },
    }
  }

  @Mutation(() => Boolean)
  async updatePlaylistSongRank(
    @Ctx() ctx: Context,
    @Arg('playlistId', () => ID) playlistId: string,
    @Arg('songId', () => ID) songId: string,
    @Arg('rank') rank: string
  ): Promise<boolean> {
    const session = ctx.session

    if (!session?.user) {
      throw new Error('Unauthorized')
    }

    const { userId } = getTableColumns(Playlists)

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
      .update(PlaylistsToSongs)
      .set({
        rank,
      })
      .where(
        and(
          eq(PlaylistsToSongs.playlistId, playlistId),
          eq(PlaylistsToSongs.songId, songId)
        )
      )

    return true
  }
}
