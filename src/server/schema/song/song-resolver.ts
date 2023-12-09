import { isEmpty } from 'lodash'
import { Arg, Query, Resolver } from 'type-graphql'

import { invidious } from '~/server/modules/invidious/invidious'
import { lastFM } from '~/server/modules/lastfm/lastfm'
import { getLyrics } from '~/server/modules/lyrics/lyrics'
import { getCoverImage } from '~/utils/get-cover-image'

import { Song, SongAlbum, SongLyrics, SongVideo } from '../song/song'

@Resolver(Song)
export class SongResolver {
  @Query(() => [SongVideo])
  async getVideoInfo(@Arg('query') query: string): Promise<SongVideo[]> {
    const { data } = await invidious.getVideos({
      query,
    })

    const video = data.map((video) => ({
      title: video.title,
      artist: video.author,
      videoId: video.videoId,
    }))

    if (isEmpty(video)) {
      throw new Error(`Video not found for query: ${query}`)
    }

    return video.slice(0, 5)
  }

  @Query(() => SongAlbum)
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
  async getLyrics(
    @Arg('artist') artist: string,
    @Arg('song') song: string
  ): Promise<SongLyrics> {
    const lyrics = await getLyrics({
      artist,
      title: song,
    })

    if (isEmpty(lyrics)) {
      return {
        artist,
        title: song,
      }
    }

    return {
      artist,
      title: song,
      lyrics,
    }
  }
}
