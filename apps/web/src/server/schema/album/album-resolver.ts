import { Arg, Query, Resolver } from 'type-graphql'

import { audioDB } from '~/server/modules/audiodb/audiodb'

import { CacheControl } from '../cache-control'
import { Album, AlbumTracks } from './album'

@Resolver(Album)
export class AlbumResolver {
  @Query(() => AlbumTracks)
  @CacheControl({ maxAge: 60 * 60 * 24 * 7 })
  async albumSongs(@Arg('albumId') albumId: string): Promise<AlbumTracks> {
    const getAlbumTracks = await audioDB.getAlbumTracks({ albumId })

    if (!getAlbumTracks.data?.track) {
      throw new Error('Tracks not found')
    }

    const tracks = getAlbumTracks.data.track.map((track) => track.strTrack)

    return {
      tracks,
    }
  }
}
