import { compact, find, isEmpty, map, sortBy, toLower } from 'lodash'
import { Arg, Int, Query, Resolver } from 'type-graphql'

import { audioDB } from '~/server/modules/audiodb/audiodb'
import { lastFM } from '~/server/modules/lastfm/lastfm'
import { getCoverImage } from '~/utils/get-cover-image'

import { Album } from '../album/album'
import { CacheControl } from '../cache-control'
import { Song } from '../song/song'
import { Artist } from './artist'

@Resolver(Artist)
export class ArtistResolver {
  @Query(() => Artist)
  @CacheControl({ maxAge: 60 * 60 * 24 * 7 })
  async artist(
    @Arg('name') name: string
  ): Promise<Partial<Artist> | undefined> {
    const getArtist = async (): Promise<Partial<Artist> | undefined> => {
      const [getArtistResponse, getFallbackArtistResponse] = await Promise.all([
        audioDB.getArtist({ artist: name }),
        lastFM.getArtist({ artist: name }),
      ])

      const artist = getArtistResponse.data?.artists?.[0]

      const fallbackArtist = getFallbackArtistResponse.data?.artist

      if (artist) {
        return {
          name: artist.strArtist,
          formedYear: artist.intFormedYear?.toString(),
          image: artist.strArtistThumb,
          bannerImage: artist.strArtistFanart,
          logo: artist.strArtistLogo,
          style: artist.strStyle,
          genre: artist.strGenre,
          website: artist.strWebsite,
          facebook: artist.strFacebook,
          twitter: artist.strTwitter,
          biography: fallbackArtist.bio.summary || artist.strBiographyEN,
          memberQuantity: Number(artist.intMembers),
          location: artist.strCountry,
          disbanded: artist.strDisbanded
            ? Boolean(artist.strDisbanded)
            : undefined,
          disbandedYear: artist.intDiedYear?.toString(),
        }
      }

      if (!fallbackArtist) {
        return undefined
      }

      return {
        name: fallbackArtist.name,
        biography: fallbackArtist.bio.summary,
        genre: fallbackArtist.tags.tag?.map((tag) => tag.name).join(', '),
      }
    }

    const artist = await getArtist()

    if (!artist) {
      throw new Error('Artist not found')
    }

    return artist
  }

  @Query(() => [Song])
  @CacheControl({ maxAge: 60 * 60 * 24 })
  async topsongsByArtist(
    @Arg('artist') artist: string,
    @Arg('limit', () => Int, { defaultValue: 20 }) limit: number,
    @Arg('page', () => Int, { nullable: true }) page?: number
  ): Promise<Pick<Song, 'title' | 'artist' | 'playcount'>[]> {
    const { data } = await lastFM.getArtistSongs({
      artist,
      limit,
      page,
    })

    const tracks = data.toptracks?.track

    if (!tracks) {
      throw new Error(`Tracks for  not found for artist ${artist}`)
    }

    return tracks?.map((track) => ({
      artist: track.artist.name,
      title: track.name,
      playcount: track.playcount,
    }))
  }

  @Query(() => [String])
  async searchArtists(
    @Arg('artist') artist: string,
    @Arg('limit', () => Int, { defaultValue: 10 }) limit: number
  ): Promise<string[]> {
    const searchArtistResponse = await lastFM.searchArtist({ artist, limit })

    const artists = searchArtistResponse.data.results?.artistmatches?.artist

    return artists?.map((artist) => artist.name) || []
  }

  @Query(() => [Artist])
  @CacheControl({ maxAge: 60 * 60 * 24 })
  async similarArtists(
    @Arg('artist') artist: string,
    @Arg('limit', () => Int, { defaultValue: 8 }) limit: number,
    @Arg('onlyNames', { defaultValue: true }) onlyNames?: boolean
  ): Promise<Partial<Artist>[]> {
    const getSimilarArtistsResponse = await lastFM.getSimilarArtists({
      artist,
      limit,
    })

    const similarArtistsBase =
      getSimilarArtistsResponse.data?.similarartists?.artist || []

    const similarArtistsNames = similarArtistsBase.map((artist) => ({
      name: artist.name,
    }))

    if (onlyNames) {
      return similarArtistsNames
    }

    const similarArtists = await Promise.all(
      similarArtistsNames.map(async (similarArtistName) => {
        const getArtistResponse = await audioDB.getArtist({
          artist: similarArtistName.name,
        })

        const similarArtist = getArtistResponse.data?.artists?.[0]

        return similarArtist
          ? {
              name: similarArtist.strArtist,
              formedYear: similarArtist.intFormedYear?.toString(),
              image: similarArtist.strArtistThumb,
              bannerImage: similarArtist.strArtistFanart,
              logo: similarArtist.strArtistLogo,
              style: similarArtist.strStyle,
              genre: similarArtist.strGenre,
              website: similarArtist.strWebsite,
              facebook: similarArtist.strFacebook,
              twitter: similarArtist.strTwitter,
              biography: similarArtist.strBiographyEN,
              memberQuantity: Number(similarArtist.intMembers),
              location: similarArtist.strCountry,
              disbanded: similarArtist.strDisbanded
                ? Boolean(similarArtist.strDisbanded)
                : undefined,
              disbandedYear: similarArtist.intDiedYear?.toString(),
            }
          : similarArtistName
      })
    )

    return similarArtists
  }

  @Query(() => [Album], { nullable: true })
  @CacheControl({ maxAge: 60 * 60 * 24 * 7 })
  async getAlbums(
    @Arg('artist') artist: string,
    @Arg('limit', () => Int, { nullable: true, defaultValue: 8 })
    limit: number,
    @Arg('page', () => Int, { nullable: true }) page?: number
  ): Promise<Album[]> {
    const getAlbumsByArtist = await audioDB.getAlbumsByArtist({ artist })

    const baseAlbums = getAlbumsByArtist.data.album

    const getTopAlbums = await lastFM.getTopAlbums({ artist, limit, page })

    const fallbackAlbums = getTopAlbums.data.topalbums?.album

    if (!fallbackAlbums && !baseAlbums) {
      return []
    }

    const albums = await Promise.all(
      map(fallbackAlbums, async (fallbackAlbum) => {
        try {
          const albumArtistName = fallbackAlbum?.artist.name

          const {
            data: { album: albumInfo },
          } = await lastFM.getAlbum({
            album: fallbackAlbum.name,
            artist: albumArtistName,
          })

          const tracks = albumInfo?.tracks.track

          if (isEmpty(tracks)) {
            return undefined
          }

          const trackNames = Array.isArray(tracks)
            ? map(tracks, (track) => track.name)
            : [tracks.name]

          const matchedAlbum = find(
            baseAlbums,
            (baseAlbum) =>
              toLower(baseAlbum?.strAlbum) == toLower(fallbackAlbum?.name)
          )

          const coverImage =
            matchedAlbum?.strAlbumThumb || getCoverImage(albumInfo?.image)

          const description =
            matchedAlbum?.strDescription || albumInfo?.wiki?.content

          return {
            artist: albumArtistName,
            coverImage,
            description,
            tracks: trackNames || [],
            name: fallbackAlbum!.name,
            genre: matchedAlbum?.strGenre,
            year: matchedAlbum?.intYearReleased,
          } as Album
        } catch {
          return undefined
        }
      })
    )

    const albumsByYear = sortBy(compact(albums), (item) =>
      item.year ? Number(item.year) : 0
    ).reverse()

    return albumsByYear
  }
}
