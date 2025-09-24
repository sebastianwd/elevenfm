import { type } from 'arktype'
import { isEmpty } from 'es-toolkit/compat'

import { invidious } from '../integrations/invidious/invidious'
import { lastFM } from '../integrations/lastfm/lastfm'
import { getLyrics as getLyricsIntegration } from '../integrations/lyrics/lyrics'
import { o } from '../lib/orpc.server'
import { getLastFMCoverImage } from '../utils/get-cover-image'

// Shared schemas
const SongVideoResponse = type({
  title: 'string',
  artist: 'string',
  videoId: 'string',
  videoUrl: 'string',
  thumbnailUrl: 'string'
})

const SongAlbumResponse = type({
  artist: 'string',
  'coverUrl?': 'string',
  title: 'string'
})

const SongLyricsResponse = type({
  artist: 'string',
  title: 'string',
  lyrics: 'string'
})

// Input schemas
const GetVideoInfoInput = type({
  query: 'string'
})

const GetAlbumBySongInput = type({
  artist: 'string',
  song: 'string'
})

const GetLyricsInput = type({
  artist: 'string',
  song: 'string'
})

// Response schemas
const GetVideoInfoResponse = type(SongVideoResponse, '[]')
const GetAlbumBySongResponse = SongAlbumResponse
const GetLyricsResponse = SongLyricsResponse

// ========== ORPC Endpoints ======================================================
export const getVideoInfo = o
  .input(GetVideoInfoInput)
  .output(GetVideoInfoResponse)
  .handler(async ({ input }) => {
    const { data } = await invidious.getVideos({
      query: input.query
    })

    const video = data.map((video) => ({
      title: video.title,
      artist: video.author,
      videoId: video.videoId,
      videoUrl: `https://www.youtube.com/watch?v=${video.videoId}`,
      thumbnailUrl: video.videoThumbnails.find((vt) => vt.quality === 'default')?.url ?? ''
    }))

    if (isEmpty(video)) {
      throw new Error(`Video not found for query: ${input.query}`)
    }

    return video.slice(0, 5)
  })

export const getAlbumBySong = o
  .input(GetAlbumBySongInput)
  .output(GetAlbumBySongResponse)
  .handler(async ({ input }) => {
    const { data } = await lastFM.getSong({
      artist: input.artist,
      track: input.song
    })

    if (isEmpty(data?.track?.album)) {
      return {
        artist: input.artist,
        coverUrl: '',
        title: ''
      }
    }

    const coverImage = getLastFMCoverImage(data.track.album.image ?? [])

    return {
      artist: data.track.artist.name,
      coverUrl: coverImage,
      title: data.track.album.title
    }
  })

export const getLyrics = o
  .input(GetLyricsInput)
  .output(GetLyricsResponse)
  .handler(async ({ input }) => {
    const lyrics = await getLyricsIntegration({
      artist: input.artist,
      title: input.song
    })

    if (isEmpty(lyrics) || !lyrics) {
      return {
        artist: input.artist,
        title: input.song,
        lyrics: ''
      }
    }

    return {
      artist: input.artist,
      title: input.song,
      lyrics
    }
  })
