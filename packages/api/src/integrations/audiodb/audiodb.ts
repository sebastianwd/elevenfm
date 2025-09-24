import { createQueryParam } from '@repo/utils/create-query-param'
import Axios from 'axios'
import { oneLineTrim } from 'common-tags'

import type { AlbumTracks, SearchAlbums, SearchArtist } from './types'

type AudioDBMethods = 'searchalbum' | 'search' | 'track'

interface AudioDBParams {
  track?: string
  artist?: string
  album?: string
  albumId?: string
}

const getEndpoint = (method: string) =>
  `https://www.theaudiodb.com/api/v1/json/${process.env.AUDIODB_API_KEY}/${method}.php?`

const audioDB = async <T>(method: AudioDBMethods, args: AudioDBParams) => {
  const { track, artist, album, albumId } = args

  const url = oneLineTrim`${getEndpoint(method)}
    ${createQueryParam({ s: track || artist, a: album, m: albumId })}`

  return Axios.get<T>(url, {
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

audioDB.getAlbumsByArtist = (args: AudioDBParams) => audioDB<SearchAlbums>('searchalbum', args)

audioDB.getArtist = (args: AudioDBParams) => audioDB<SearchArtist>('search', args)

audioDB.getAlbumTracks = (args: AudioDBParams) => audioDB<AlbumTracks>('track', args)

export { audioDB }
