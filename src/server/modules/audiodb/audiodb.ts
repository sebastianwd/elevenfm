import Axios from 'axios'
import { oneLineTrim } from 'common-tags'

import { createQueryParam } from '~/utils/create-query-param'

import { SearchAlbums, SearchArtist } from './types'

type AudioDBMethods = 'searchalbum' | 'search'

interface AudioDBParams {
  track?: string
  artist?: string
  album?: string
}

const getEndpoint = (method: string) =>
  `https://www.theaudiodb.com/api/v1/json/${process.env.AUDIODB_API_KEY}/${method}.php?`

const audioDB = async <T>(method: AudioDBMethods, args: AudioDBParams) => {
  const { track, artist, album } = args

  const url = oneLineTrim`${getEndpoint(method)}
    ${createQueryParam({ s: track || artist, a: album })}`

  return Axios.get<T>(url, {
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

audioDB.getAlbumsByArtist = (args: AudioDBParams) =>
  audioDB<SearchAlbums>('searchalbum', args)

audioDB.getArtist = (args: AudioDBParams) =>
  audioDB<SearchArtist>('search', args)

export { audioDB }
