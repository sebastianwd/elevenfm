import { isEmpty } from 'lodash'
import { Arg, Query, Resolver } from 'type-graphql'

import { invidious } from '~/server/modules/invidious/invidious'
import { lastFM } from '~/server/modules/lastfm/lastfm'
import { getLyrics } from '~/server/modules/lyrics/lyrics'
import { getCoverImage } from '~/utils/get-cover-image'

import { CacheControl } from '../cache-control'
import { Song, SongAlbum, SongLyrics, SongVideo } from '../song/song'

@Resolver(Song)
export class SongResolver {
  @Query(() => [SongVideo])
  @CacheControl({ maxAge: 60 * 60 * 24 })
  async getVideoInfo(@Arg('query') query: string): Promise<SongVideo[]> {
    const { data } = await invidious.getVideos({
      query,
    })

    /* const ytmusicMix = await ytmusic.getMix(head(data)?.videoId ?? '') */

    const video = data.map((video) => ({
      title: video.title,
      artist: video.author,
      videoId: video.videoId,
      videoUrl: `https://www.youtube.com/watch?v=${video.videoId}`,
      thumbnailUrl:
        video.videoThumbnails.find((vt) => vt.quality === 'default')?.url ?? '',
    }))

    if (isEmpty(video)) {
      throw new Error(`Video not found for query: ${query}`)
    }

    return video.slice(0, 5)
  }

  @Query(() => SongAlbum)
  @CacheControl({ maxAge: 60 * 60 * 24 * 7 })
  async getAlbumBySong(
    @Arg('artist') artist: string,
    @Arg('song') song: string
  ): Promise<SongAlbum> {
    const { data } = await lastFM.getSong({
      artist,
      track: song,
    })

    if (isEmpty(data?.track?.album)) {
      return {
        artist,
        coverUrl: '',
        title: '',
      }
    }

    const coverImage = getCoverImage(data.track.album.image)

    return {
      artist: data.track.artist.name,
      coverUrl: coverImage,
      title: data.track.album.title,
    }
  }

  @Query(() => SongLyrics)
  @CacheControl({ maxAge: 60 * 60 * 24 })
  async getLyrics(
    @Arg('artist') artist: string,
    @Arg('song') song: string
  ): Promise<SongLyrics> {
    const lyrics = await getLyrics({
      artist,
      title: song.replace(/w\//, ''),
    })

    if (isEmpty(lyrics)) {
      return {
        artist,
        title: song,
        lyrics: '',
      }
    }

    return {
      artist,
      title: song,
      lyrics,
    }
  }
}
