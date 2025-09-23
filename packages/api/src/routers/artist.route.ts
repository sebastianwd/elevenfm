import { ORPCError, os } from '@orpc/server'
import { type } from 'arktype'
import { compact } from 'es-toolkit'

import { audioDB } from '../integrations/audiodb/audiodb'
import { lastFM } from '../integrations/lastfm/lastfm'

// Shared schemas
const ArtistResponse = type({
  name: 'string',
  'formedYear?': 'string',
  'image?': 'string.url',
  'bannerImage?': 'string.url',
  'logo?': 'string.url',
  'style?': 'string',
  'genre?': 'string',
  'website?': 'string.url',
  'facebook?': 'string.url',
  'twitter?': 'string.url',
  'biography?': 'string',
  'memberQuantity?': 'number.integer',
  'location?': 'string',
  'disbanded?': 'boolean',
  'disbandedYear?': 'number.integer'
})

const SongResponse = type({
  title: 'string',
  artist: 'string',
  playcount: 'string'
})

const AlbumResponse = type({
  name: 'string',
  artist: 'string',
  'coverImage?': 'string.url',
  'genre?': 'string',
  'year?': 'string',
  'albumId?': 'string',
  'description?': 'string'
})

// Input schemas
const SearchArtistInput = type({
  artist: 'string >= 3',
  'limit?': '1 <= number.integer <= 100'
})

const GetArtistInput = type({
  name: 'string >= 1'
})

const TopSongsByArtistInput = type({
  artist: 'string >= 1',
  'limit?': '1 <= number.integer <= 100',
  'page?': 'number.integer >= 1'
})

const SimilarArtistsInput = type({
  artist: 'string >= 1',
  'limit?': '1 <= number.integer <= 50',
  'onlyNames?': 'boolean'
})

const GetAlbumsInput = type({
  artist: 'string >= 1',
  'limit?': '1 <= number.integer <= 100', // default 10 in handler
  'page?': 'number.integer >= 1'
})

// Response schemas (reusing base types)
const SearchArtistResponse = type('string[]')
const TopSongsByArtistResponse = type(SongResponse, '[]')
const SimilarArtistsResponse = type(ArtistResponse, '[]')
const GetAlbumsResponse = type(AlbumResponse, '[]')

/* ------------------- */

export const searchArtist = os
  .input(SearchArtistInput)
  .output(SearchArtistResponse)
  .handler(async ({ input }) => {
    const searchArtistResponse = await lastFM.searchArtist({
      artist: input.artist,
      limit: input.limit
    })

    const artists = searchArtistResponse.data.results.artistmatches.artist
    return artists.map((artist) => artist.name)
  })

/* ------------------- */

export const getArtist = os.input(GetArtistInput).handler(async ({ input }) => {
  const [getArtistResponse, getFallbackArtistResponse] = await Promise.all([
    audioDB.getArtist({ artist: input.name }),
    lastFM.getArtist({ artist: input.name })
  ])

  const artist = getArtistResponse.data.artists?.[0]
  const fallbackArtist = getFallbackArtistResponse.data.artist

  if (artist) {
    return {
      name: artist.strArtist,
      formedYear: artist.intFormedYear.toString(),
      image: artist.strArtistThumb,
      bannerImage: artist.strArtistFanart,
      logo: artist.strArtistLogo,
      style: artist.strStyle,
      genre: artist.strGenre,
      website: artist.strWebsite,
      facebook: artist.strFacebook,
      twitter: artist.strTwitter,
      biography: fallbackArtist?.bio?.summary || artist.strBiographyEN,
      memberQuantity: Number(artist.intMembers),
      location: artist.strCountry,
      disbanded: artist.strDisbanded ? Boolean(artist.strDisbanded) : undefined,
      disbandedYear: artist.intDiedYear
    }
  }

  if (!fallbackArtist) {
    throw new ORPCError('NOT_FOUND', { message: 'Artist not found' })
  }

  return {
    name: fallbackArtist.name,
    biography: fallbackArtist.bio?.summary,
    genre: fallbackArtist.tags?.tag.map((tag) => tag.name).join(', ')
  }
})

/* ------------------- */

export const topSongsByArtist = os
  .input(TopSongsByArtistInput)
  .output(TopSongsByArtistResponse)
  .handler(async ({ input }) => {
    const { data } = await lastFM.getArtistSongs({
      artist: input.artist,
      limit: input.limit ?? 30,
      page: input.page
    })

    const tracks = data.toptracks?.track

    if (!tracks) {
      throw new ORPCError('NOT_FOUND', { message: `Tracks not found for artist ${input.artist}` })
    }

    return tracks.map((track) => ({
      artist: track.artist.name,
      title: track.name,
      playcount: track.playcount
    }))
  })

/* ------------------- */

export const similarArtists = os.input(SimilarArtistsInput).handler(async ({ input }) => {
  const getSimilarArtistsResponse = await lastFM.getSimilarArtists({
    artist: input.artist,
    limit: input.limit ?? 8
  })

  const similarArtistsBase = getSimilarArtistsResponse.data.similarartists?.artist || []

  const similarArtistsNames = similarArtistsBase.map((artist) => ({
    name: artist.name
  }))

  if (input.onlyNames ?? true) {
    return similarArtistsNames
  }

  const similarArtists = await Promise.all(
    similarArtistsNames.map(async (similarArtistName) => {
      const getArtistResponse = await audioDB.getArtist({
        artist: similarArtistName.name
      })

      const similarArtist = getArtistResponse.data.artists?.[0]

      return similarArtist
        ? {
            name: similarArtist.strArtist,
            formedYear: similarArtist.intFormedYear.toString() || undefined,
            image: similarArtist.strArtistThumb || undefined,
            bannerImage: similarArtist.strArtistFanart || undefined,
            logo: similarArtist.strArtistLogo || undefined,
            style: similarArtist.strStyle || undefined,
            genre: similarArtist.strGenre || undefined,
            website: similarArtist.strWebsite || undefined,
            facebook: similarArtist.strFacebook || undefined,
            twitter: similarArtist.strTwitter || undefined,
            biography: similarArtist.strBiographyEN || undefined,
            memberQuantity: Number(similarArtist.intMembers || 0),
            location: similarArtist.strCountry || undefined,
            disbanded: similarArtist.strDisbanded ? Boolean(similarArtist.strDisbanded) : undefined,
            disbandedYear: similarArtist.intDiedYear ? Number(similarArtist.intDiedYear) : undefined
          }
        : similarArtistName
    })
  )

  return similarArtists
})

/* ------------------- */

export const getAlbums = os.input(GetAlbumsInput).handler(async ({ input }) => {
  const getAlbumsByArtist = await audioDB.getAlbumsByArtist({ artist: input.artist })
  const baseAlbums = getAlbumsByArtist.data.album

  const getTopAlbums = await lastFM.getTopAlbums({
    artist: input.artist,
    limit: input.limit ?? 10,
    page: input.page
  })
  const fallbackAlbums = getTopAlbums.data.topalbums?.album

  if (!fallbackAlbums && !baseAlbums) {
    return []
  }

  // Process fallback albums from Last.fm
  const albums = (fallbackAlbums || [])
    .map((fallbackAlbum) => {
      try {
        const albumArtistName = fallbackAlbum.artist.name

        if (!fallbackAlbum.name || fallbackAlbum.name === '(null)' || fallbackAlbum.name === 'undefined') {
          return null
        }

        const matchedAlbum = baseAlbums?.find(
          (baseAlbum) => baseAlbum.strAlbum.toLowerCase() === fallbackAlbum.name.toLowerCase()
        )

        const coverImage =
          matchedAlbum?.strAlbumThumb || fallbackAlbum.image.find((img) => img.size === 'large')?.['#text']

        return {
          artist: albumArtistName,
          coverImage,
          description: matchedAlbum?.strDescription || matchedAlbum?.strDescriptionEN,
          name: fallbackAlbum.name,
          genre: matchedAlbum?.strGenre,
          year: matchedAlbum?.intYearReleased.toString(),
          albumId: matchedAlbum?.idAlbum
        }
      } catch {
        return null
      }
    })
    .filter(Boolean)

  // Add missing albums from AudioDB that weren't in Last.fm results
  const missingAlbums = (baseAlbums || [])
    .filter((baseAlbum) => !albums.find((album) => album?.name.toLowerCase() === baseAlbum.strAlbum.toLowerCase()))
    .map((baseAlbum) => ({
      artist: baseAlbum.strArtist,
      coverImage: baseAlbum.strAlbumThumb,
      description: baseAlbum.strDescription,
      name: baseAlbum.strAlbum,
      genre: baseAlbum.strGenre,
      year: baseAlbum.intYearReleased.toString(),
      albumId: baseAlbum.idAlbum
    }))

  // Combine and sort albums
  const allAlbums = compact([...albums, ...missingAlbums])

  // Sort by year (desc) and then by whether it has cover image
  const albumsSorted = allAlbums.sort((a, b) => {
    const yearA = a.year ? Number(a.year) : 0
    const yearB = b.year ? Number(b.year) : 0

    if (yearA !== yearB) {
      return yearB - yearA // desc
    }

    const hasImageA = a.coverImage ? 1 : 2
    const hasImageB = b.coverImage ? 1 : 2

    return hasImageA - hasImageB // asc (images first)
  })

  return albumsSorted
})
