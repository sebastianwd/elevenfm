import { type } from 'arktype'
import { map } from 'es-toolkit/compat'

import { audioDB } from '../integrations/audiodb/audiodb'
import { lastFM } from '../integrations/lastfm/lastfm'
import { o } from '../lib/orpc.server'

const AlbumDetailsResponse = type({
  tracks: type('string', '[]'),
  'description?': 'string'
})

const AlbumDetailsInput = type({
  albumId: 'string',
  album: 'string',
  artist: 'string'
})

// ========== ORPC Endpoints ======================================================
export const albumDetails = o
  .input(AlbumDetailsInput)
  .output(AlbumDetailsResponse)
  .handler(async ({ input }) => {
    const [
      getAlbumTracks,
      {
        data: { album: albumInfo }
      }
    ] = await Promise.all([
      audioDB.getAlbumTracks({ albumId: input.albumId }),
      lastFM.getAlbum({ album: input.album, artist: input.artist })
    ])

    const audioDBTracks = map(getAlbumTracks.data.track, (track) => track.strTrack)

    const getTracks = () => {
      if (audioDBTracks.length > 0) {
        return audioDBTracks
      }

      const tracks = albumInfo.tracks?.track ?? { name: albumInfo.name }

      return Array.isArray(tracks) ? map(tracks, (track) => track.name) : [tracks.name]
    }

    const tracks = getTracks()

    return {
      tracks,
      description: albumInfo.wiki?.content || ''
    }
  })
