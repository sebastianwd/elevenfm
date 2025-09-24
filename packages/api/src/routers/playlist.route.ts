import { ORPCError } from '@orpc/server'
import { init } from '@paralleldrive/cuid2'
import { ytGetId } from '@repo/utils/get-yt-url-id'
import { sanitizeSongTitle } from '@repo/utils/song-title-utils'
import { type } from 'arktype'
import { and, desc, eq, getTableColumns, inArray } from 'drizzle-orm'
import { chunk, keyBy } from 'es-toolkit'
import { isEmpty, map } from 'es-toolkit/compat'
import getArtistTitle from 'get-artist-title'
import { LexoRank } from 'lexorank'
import spotifyFetch from 'spotify-url-info'

import { db } from '../db/client'
import { Playlists, PlaylistsToSongs, Songs } from '../db/schema'
import { Users } from '../db/schema/auth'
import { invidious } from '../integrations/invidious/invidious'
import { soundcloud } from '../integrations/soundcloud/soundcloud'
import { protectedProcedure } from '../lib/orpc.server'
import { logger } from '../utils/logger'

const spotifyRequest = spotifyFetch(fetch)

const createId = init({
  length: 6
})

const playlistType = {
  PLAYLIST: 1,
  RADIO: 2
} as const

// Shared schemas
const SongResponse = type({
  id: 'string',
  title: 'string',
  artist: 'string',
  'songUrl?': 'string',
  'rank?': 'string',
  createdAt: 'Date'
})

const PlaylistResponse = type({
  id: 'string',
  name: 'string',
  'type?': 'number',
  user: type({
    id: 'string',
    'name?': 'string'
  }),
  'songs?': type(SongResponse, '[]')
})

const SongInput = type({
  title: 'string',
  artist: 'string',
  'album?': 'string',
  'url?': 'string'
})

const ImportPlaylistInput = type({
  url: 'string.url',
  'playlistId?': 'string'
})

const GetPlaylistInput = type({
  playlistId: 'string'
})

const CreatePlaylistInput = type({
  'name?': 'string'
})

const RemoveFromPlaylistInput = type({
  playlistId: 'string',
  songId: 'string'
})

const DeletePlaylistInput = type({
  playlistId: 'string'
})

const UpdatePlaylistInput = type({
  playlistId: 'string',
  name: 'string'
})

const AddToPlaylistInput = type({
  playlistId: 'string',
  'songIds?': type('string', '[]'),
  'songs?': type(SongInput, '[]')
})

const CreateSongRadioInput = type({
  'songId?': 'string',
  'songTitle?': 'string',
  'songArtist?': 'string'
})

const UpdatePlaylistSongRankInput = type({
  playlistId: 'string',
  songId: 'string',
  rank: 'string'
})

// Response schemas
const ImportPlaylistResponse = PlaylistResponse.omit('songs')
const UserPlaylistsResponse = type(PlaylistResponse.and(type({ createdAt: 'Date' })), '[]')
const GetPlaylistResponse = PlaylistResponse
const CreatePlaylistResponse = PlaylistResponse.omit('songs')
const RemoveFromPlaylistResponse = type('boolean')
const DeletePlaylistResponse = type('boolean')
const UpdatePlaylistResponse = PlaylistResponse.omit('songs')
const AddToPlaylistResponse = type('boolean')
const CreateSongRadioResponse = PlaylistResponse.omit('songs')
const UpdatePlaylistSongRankResponse = type('boolean')

// Helper functions
const getUrlSourceName = (url: string) => {
  if (url.startsWith('https://open.spotify.com/playlist/') || url.startsWith('https://open.spotify.com/track/')) {
    return 'spotify'
  }

  if (ytGetId(url)) {
    return 'youtube'
  }

  if (url.match(/^https?:\/\/(www\.|m\.)?soundcloud\.com\/[a-z0-9](?!.*?(-|_){2})[\w-]{1,23}[a-z0-9](?:\/.+)?$/)) {
    return 'soundcloud'
  }
}

const formatYoutubeTitle = (title: string, author: string) => {
  // remove ":"
  const formattedTitle = title.replace(/(?<=\s|^):(\w+)/g, '$1')

  const [songArtist, songTitle] = getArtistTitle(formattedTitle, {
    defaultArtist: author,
    defaultTitle: title
  }) || ['Unknown', 'Unknown']

  return {
    // replace " - Topic" with ""
    artist: songArtist.replace(/ - Topic$/, ''),
    title: sanitizeSongTitle(songTitle)
  }
}

const getExternalPlaylistTracks = async (
  url: string,
  source: 'spotify' | 'youtube' | 'soundcloud'
): Promise<{ title: string; artist: string; url?: string }[]> => {
  if (source === 'spotify') {
    return (await spotifyRequest.getTracks(url)).map((track) => ({
      title: track.name,
      artist: track.artist
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
          url
        }
      ]
    }

    return map((await invidious.getPlaylist({ playlistId: ytId.id })).data.videos, (video) =>
      formatYoutubeTitle(video.title, video.author)
    )
  }

  const data = await soundcloud.getTrack(url)

  return [
    {
      ...formatYoutubeTitle(data.title, data.user.username),
      url
    }
  ]
}

const getLastRankInPlaylist = async (playlistId: string) => {
  const [lastRank] = await db
    .select({
      rank: PlaylistsToSongs.rank
    })
    .from(PlaylistsToSongs)
    .where(eq(PlaylistsToSongs.playlistId, playlistId))
    .orderBy(desc(PlaylistsToSongs.createdAt))
    .limit(1)

  return lastRank
}

// ========== ORPC Endpoints ======================================================
export const importPlaylist = protectedProcedure
  .input(ImportPlaylistInput)
  .output(ImportPlaylistResponse)
  .handler(async ({ input, context }) => {
    const urlSourceName = getUrlSourceName(input.url)

    if (!urlSourceName) {
      throw new ORPCError('BAD_REQUEST', { message: 'Invalid URL' })
    }

    const [existingPlaylist] = input.playlistId
      ? await db
          .select({
            id: Playlists.id
          })
          .from(Playlists)
          .where(and(eq(Playlists.id, input.playlistId), eq(Playlists.userId, context.session.user.id)))
      : [null]

    if (input.playlistId && !existingPlaylist) {
      throw new ORPCError('NOT_FOUND', { message: 'Playlist not found' })
    }

    const tracks = await getExternalPlaylistTracks(input.url, urlSourceName)

    if (tracks.length === 0) {
      throw new ORPCError('BAD_REQUEST', { message: 'No tracks found in url' })
    }

    const playlistName = `playlist-${createId()}`

    const createdPlaylistId = await db.transaction(async (tx) => {
      const [createdPlaylist] = existingPlaylist
        ? [{ insertedId: existingPlaylist.id }]
        : await tx
            .insert(Playlists)
            .values({
              name: playlistName,
              userId: context.session.user.id,
              updatedAt: new Date()
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
                set: { updatedAt: new Date() }
              })
              .returning({
                insertedId: Songs.id,
                insertedTitle: Songs.title,
                insertedArtist: Songs.artist
              })

            const songsByTitleArtist = keyBy(chunk, (song) => `${song.artist}${song.title}`)

            const lastRank = await getLastRankInPlaylist(createdPlaylist!.insertedId)

            let currentRank = lastRank?.rank ? LexoRank.parse(lastRank.rank).genNext() : LexoRank.middle()

            await tx
              .insert(PlaylistsToSongs)
              .values(
                createdSongs.map((createdSong) => {
                  const song = {
                    playlistId: createdPlaylist!.insertedId,
                    songId: createdSong.insertedId,
                    songUrl:
                      songsByTitleArtist[`${createdSong.insertedArtist}${createdSong.insertedTitle}`]?.url || null,
                    rank: currentRank.toString()
                  }
                  currentRank = currentRank.genNext()

                  return song
                })
              )
              .onConflictDoNothing()
          })
        )
      } catch (error) {
        logger.error(error)
        throw new ORPCError('INTERNAL_SERVER_ERROR', { message: 'Error importing playlist or all songs already exist' })
      }

      return createdPlaylist!.insertedId
    })

    return {
      id: createdPlaylistId,
      name: playlistName,
      user: {
        id: context.session.user.id
      }
    }
  })

export const userPlaylists = protectedProcedure.output(UserPlaylistsResponse).handler(async ({ context }) => {
  const playlists = await db
    .select()
    .from(Playlists)
    .where(and(eq(Playlists.userId, context.session.user.id), eq(Playlists.type, playlistType.PLAYLIST)))
    .orderBy(desc(Playlists.createdAt))

  return map(playlists, (playlist) => ({
    id: playlist.id,
    name: playlist.name,
    type: playlist.type,
    user: {
      id: playlist.userId
    },
    createdAt: playlist.createdAt
  }))
})

export const getPlaylist = protectedProcedure
  .input(GetPlaylistInput)
  .output(GetPlaylistResponse)
  .handler(async ({ input }) => {
    const songs = await db
      .select()
      .from(Songs)
      .innerJoin(PlaylistsToSongs, eq(PlaylistsToSongs.songId, Songs.id))
      .where(eq(PlaylistsToSongs.playlistId, input.playlistId))

    const [userPlaylist] = await db
      .select()
      .from(Playlists)
      .innerJoin(Users, eq(Playlists.userId, Users.id))
      .where(eq(Playlists.id, input.playlistId))

    if (!userPlaylist) {
      throw new ORPCError('NOT_FOUND', { message: 'Playlist not found' })
    }

    return {
      id: input.playlistId,
      name: userPlaylist.playlists.name,
      type: userPlaylist.playlists.type,
      user: {
        id: userPlaylist.users.id,
        name: userPlaylist.users.name || undefined
      },
      songs: songs.map((song) => ({
        id: song.songs.id,
        title: song.songs.title,
        artist: song.songs.artist,
        songUrl: song.playlistsToSongs.songUrl || '',
        rank: song.playlistsToSongs.rank || undefined,
        createdAt: song.playlistsToSongs.createdAt
      }))
    }
  })

export const createPlaylist = protectedProcedure
  .input(CreatePlaylistInput)
  .output(CreatePlaylistResponse)
  .handler(async ({ input, context }) => {
    const playlistName = input.name ?? `playlist-${createId()}`

    const [createdPlaylist] = await db
      .insert(Playlists)
      .values({
        name: playlistName,
        userId: context.session.user.id,
        updatedAt: new Date()
      })
      .returning({ insertedId: Playlists.id })

    return {
      id: createdPlaylist!.insertedId,
      name: playlistName,
      user: {
        id: context.session.user.id
      }
    }
  })

export const removeFromPlaylist = protectedProcedure
  .input(RemoveFromPlaylistInput)
  .output(RemoveFromPlaylistResponse)
  .handler(async ({ input, context }) => {
    const { userId } = getTableColumns(Playlists)

    const [playlist] = await db
      .select({
        userId
      })
      .from(Playlists)
      .where(eq(Playlists.id, input.playlistId))

    if (!playlist || playlist.userId !== context.session.user.id) {
      throw new ORPCError('UNAUTHORIZED', { message: 'Unauthorized' })
    }

    await db
      .delete(PlaylistsToSongs)
      .where(and(eq(PlaylistsToSongs.playlistId, input.playlistId), eq(PlaylistsToSongs.songId, input.songId)))

    return true
  })

export const deletePlaylist = protectedProcedure
  .input(DeletePlaylistInput)
  .output(DeletePlaylistResponse)
  .handler(async ({ input, context }) => {
    const { userId } = getTableColumns(Playlists)

    const [playlist] = await db
      .select({
        userId
      })
      .from(Playlists)
      .where(eq(Playlists.id, input.playlistId))

    if (!playlist || playlist.userId !== context.session.user.id) {
      throw new ORPCError('UNAUTHORIZED', { message: 'Unauthorized' })
    }

    await db.delete(Playlists).where(eq(Playlists.id, input.playlistId))

    return true
  })

export const updatePlaylist = protectedProcedure
  .input(UpdatePlaylistInput)
  .output(UpdatePlaylistResponse)
  .handler(async ({ input, context }) => {
    const { userId } = getTableColumns(Playlists)

    const [playlist] = await db
      .select({
        userId
      })
      .from(Playlists)
      .where(eq(Playlists.id, input.playlistId))

    if (!playlist || playlist.userId !== context.session.user.id) {
      throw new ORPCError('UNAUTHORIZED', { message: 'Unauthorized' })
    }

    await db
      .update(Playlists)
      .set({
        name: input.name
      })
      .where(eq(Playlists.id, input.playlistId))

    return {
      id: input.playlistId,
      name: input.name,
      user: {
        id: context.session.user.id
      }
    }
  })

export const addToPlaylist = protectedProcedure
  .input(AddToPlaylistInput)
  .output(AddToPlaylistResponse)
  .handler(async ({ input, context }) => {
    const { userId } = getTableColumns(Playlists)

    if (!input.songIds && !input.songs) {
      throw new ORPCError('BAD_REQUEST', { message: 'No songs provided' })
    }

    const [playlist] = await db
      .select({
        userId
      })
      .from(Playlists)
      .where(eq(Playlists.id, input.playlistId))

    if (!playlist || playlist.userId !== context.session.user.id) {
      throw new ORPCError('UNAUTHORIZED', { message: 'Unauthorized' })
    }

    const hasExistingSongs = !isEmpty(input.songIds)
    const itemsCount = hasExistingSongs ? input.songIds!.length : input.songs?.length

    try {
      await db.transaction(async (tx) => {
        if (hasExistingSongs && !!input.songIds) {
          const songUrls = await tx
            .select({
              songUrl: PlaylistsToSongs.songUrl,
              songId: PlaylistsToSongs.songId
            })
            .from(PlaylistsToSongs)
            .where(inArray(PlaylistsToSongs.songId, input.songIds))

          const songUrlById = keyBy(songUrls, (song) => song.songId)

          const lastRank = await getLastRankInPlaylist(input.playlistId)

          let currentRank = lastRank?.rank ? LexoRank.parse(lastRank.rank).genNext() : LexoRank.middle()

          const createdSongs = await tx
            .insert(PlaylistsToSongs)
            .values(
              input.songIds.map((songId) => {
                const song = {
                  playlistId: input.playlistId,
                  songId,
                  songUrl: songUrlById[songId]?.songUrl || null,
                  rank: currentRank.toString()
                }
                currentRank = currentRank.genNext()

                return song
              })
            )
            .onConflictDoNothing()
            .returning({ insertedId: PlaylistsToSongs.songId })

          if (createdSongs.length === 0) {
            throw new ORPCError('BAD_REQUEST', { message: 'Song already in playlist' })
          }
        } else if (input.songs) {
          await Promise.all(
            chunk(input.songs, 50).map(async (chunk) => {
              const createdSongs = await tx
                .insert(Songs)
                .values(chunk)
                .onConflictDoUpdate({
                  target: [Songs.title, Songs.artist, Songs.album],
                  set: { updatedAt: new Date() }
                })
                .returning({ insertedId: Songs.id })

              const lastRank = await getLastRankInPlaylist(input.playlistId)

              let currentRank = lastRank?.rank ? LexoRank.parse(lastRank.rank).genNext() : LexoRank.middle()

              await tx
                .insert(PlaylistsToSongs)
                .values(
                  createdSongs.map((createdSong) => {
                    const song = {
                      playlistId: input.playlistId,
                      songId: createdSong.insertedId,
                      rank: currentRank.toString()
                    }
                    currentRank = currentRank.genNext()

                    return song
                  })
                )
                .onConflictDoUpdate({
                  target: [PlaylistsToSongs.playlistId, PlaylistsToSongs.songId],
                  set: {
                    updatedAt: new Date()
                  }
                })
            })
          )
        }
      })
    } catch (error) {
      logger.error(error)
      throw new ORPCError('BAD_REQUEST', { message: `Song${itemsCount === 1 ? '' : 's'} already in playlist` })
    }

    return true
  })

export const createSongRadio = protectedProcedure
  .input(CreateSongRadioInput)
  .output(CreateSongRadioResponse)
  .handler(async ({ input, context }) => {
    if (!input.songId && !input.songTitle) {
      throw new ORPCError('BAD_REQUEST', { message: 'No song provided' })
    }

    const { id: playlistId, name } = getTableColumns(Playlists)
    const { id: colSongId } = getTableColumns(Songs)

    const [existingSong] =
      input.songTitle && input.songArtist && !input.songId
        ? await db
            .select({ id: colSongId })
            .from(Songs)
            .where(and(eq(Songs.title, input.songTitle), eq(Songs.artist, input.songArtist)))
        : [null]

    const existingSongId = input.songId || existingSong?.id

    if (existingSongId) {
      const [radioPlaylist] = await db
        .select({
          playlistId,
          name
        })
        .from(Playlists)
        .where(and(eq(Playlists.userId, context.session.user.id), eq(Playlists.radioSongId, existingSongId)))

      if (radioPlaylist) {
        return {
          id: radioPlaylist.playlistId,
          name: radioPlaylist.name,
          user: {
            id: context.session.user.id
          }
        }
      }
    }

    const { data: videoData } = await invidious.getVideos({
      query: `${input.songArtist} - ${input.songTitle}`
    })

    const video = videoData[0]

    if (!video) {
      throw new ORPCError('NOT_FOUND', { message: 'Video not found' })
    }

    const { data: radioData } = await invidious.getMix({
      videoId: video.videoId
    })

    if (!radioData) {
      throw new ORPCError('INTERNAL_SERVER_ERROR', { message: 'Could not create radio from song' })
    }

    const songs = radioData.videos.map((video) => formatYoutubeTitle(video.title, video.author))

    const radioPlaylistName = `${input.songArtist} Radio`

    const createdRadioPlaylist = await db.transaction(async (tx) => {
      const [createdRadioSong] = await tx
        .insert(Songs)
        .values({
          title: input.songTitle!,
          artist: input.songArtist!
        })
        .onConflictDoUpdate({
          target: [Songs.title, Songs.artist, Songs.album],
          set: { updatedAt: new Date() }
        })
        .returning({ insertedId: Songs.id })

      const [createdPlaylist] = await tx
        .insert(Playlists)
        .values({
          name: radioPlaylistName,
          userId: context.session.user.id,
          radioSongId: createdRadioSong!.insertedId,
          type: playlistType.RADIO,
          updatedAt: new Date()
        })
        .returning({ insertedId: Playlists.id })

      await Promise.all(
        chunk(songs, 50).map(async (chunk) => {
          const createdSongs = await tx
            .insert(Songs)
            .values(chunk)
            .onConflictDoUpdate({
              target: [Songs.title, Songs.artist, Songs.album],
              set: { updatedAt: new Date() }
            })
            .returning({ insertedId: Songs.id })

          await tx
            .insert(PlaylistsToSongs)
            .values(
              createdSongs.map((song) => ({
                playlistId: createdPlaylist!.insertedId,
                songId: song.insertedId
              }))
            )
            .onConflictDoNothing()
        })
      )

      return createdPlaylist
    })

    return {
      id: createdRadioPlaylist!.insertedId,
      name: radioPlaylistName,
      user: {
        id: context.session.user.id
      }
    }
  })

export const updatePlaylistSongRank = protectedProcedure
  .input(UpdatePlaylistSongRankInput)
  .output(UpdatePlaylistSongRankResponse)
  .handler(async ({ input, context }) => {
    const { userId } = getTableColumns(Playlists)

    const [playlist] = await db
      .select({
        userId
      })
      .from(Playlists)
      .where(eq(Playlists.id, input.playlistId))

    if (!playlist || playlist.userId !== context.session.user.id) {
      throw new ORPCError('UNAUTHORIZED', { message: 'Unauthorized' })
    }

    await db
      .update(PlaylistsToSongs)
      .set({
        rank: input.rank
      })
      .where(and(eq(PlaylistsToSongs.playlistId, input.playlistId), eq(PlaylistsToSongs.songId, input.songId)))

    return true
  })
