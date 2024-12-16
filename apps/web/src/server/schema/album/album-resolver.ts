import { map } from 'lodash'
import { Arg, Query, Resolver } from 'type-graphql'

import { audioDB } from '~/server/modules/audiodb/audiodb'
import { lastFM } from '~/server/modules/lastfm/lastfm'

import { CacheControl } from '../cache-control'
import { Album, AlbumDetails } from './album'

@Resolver(Album)
export class AlbumResolver {
  @Query(() => AlbumDetails)
  @CacheControl({ maxAge: 60 * 60 * 24 * 7 })
  async albumDetails(
    @Arg('albumId') albumId: string,
    @Arg('album') album: string,
    @Arg('artist') artist: string
  ): Promise<AlbumDetails> {
    const [
      getAlbumTracks,
      {
        data: { album: albumInfo },
      },
    ] = await Promise.all([
      audioDB.getAlbumTracks({ albumId }),
      lastFM.getAlbum({ album, artist }),
    ])

    const audioDBTracks = map(
      getAlbumTracks.data.track,
      (track) => track.strTrack
    )

    const getTracks = () => {
      if (audioDBTracks.length > 0) {
        return audioDBTracks
      }

      const tracks = albumInfo?.tracks?.track ?? { name: albumInfo?.name }

      return Array.isArray(tracks)
        ? map(tracks, (track) => track.name)
        : [tracks.name]
    }

    const tracks = getTracks()

    return {
      tracks,
      description: albumInfo?.wiki?.content,
    }
  }
}
