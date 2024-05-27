import Axios from 'axios'
import { oneLineTrim } from 'common-tags'

import { createQueryParam } from '~/utils/create-query-param'

import {
  AlbumGetInfo,
  ArtistGetInfo,
  ArtistGetSimilar,
  ArtistGetTopAlbums,
  ArtistSearch,
  GetTopTracks,
  TrackGetInfo,
} from './types'

type LastFMMethods =
  | 'track.getInfo'
  | 'artist.getTopTracks'
  | 'album.getInfo'
  | 'artist.getinfo'
  | 'artist.getSimilar'
  | 'artist.getTopAlbums'
  | 'artist.search'

interface LastFMParams {
  limit?: number
  page?: number
  track?: string
  artist?: string
  album?: string
}

const getEndpoint = (method: string) =>
  `http://ws.audioscrobbler.com/2.0/?method=${method}&format=json`

const lastFM = async <T>(method: LastFMMethods, args: LastFMParams) => {
  const { limit, track, artist, album, page } = args

  const url = oneLineTrim`${getEndpoint(method)}
  &api_key=${process.env.LASTFM_API_KEY}
  &${createQueryParam({ limit, page, artist, track, album })}`

  return Axios.get<T>(url)
}

lastFM.getArtist = (args: LastFMParams) =>
  lastFM<ArtistGetInfo>('artist.getinfo', args)

lastFM.getArtistSongs = (args: LastFMParams) =>
  lastFM<GetTopTracks>('artist.getTopTracks', args)

lastFM.getSong = (args: LastFMParams) =>
  lastFM<TrackGetInfo>('track.getInfo', args)

lastFM.searchArtist = (args: LastFMParams) =>
  lastFM<ArtistSearch>('artist.search', args)

lastFM.getSimilarArtists = (args: LastFMParams) =>
  lastFM<ArtistGetSimilar>('artist.getSimilar', args)

lastFM.getAlbum = (args: LastFMParams) =>
  lastFM<AlbumGetInfo>('album.getInfo', args)

lastFM.getTopAlbums = (args: LastFMParams) =>
  lastFM<ArtistGetTopAlbums>('artist.getTopAlbums', args)

export { lastFM }
