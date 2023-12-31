import { GraphQLClient } from 'graphql-request'
import { GraphQLClientRequestHeaders } from 'graphql-request/build/cjs/types'
import gql from 'graphql-tag'
export type Maybe<T> = T | null
export type InputMaybe<T> = Maybe<T>
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K]
}
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>
}
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>
}
export type MakeEmpty<
  T extends { [key: string]: unknown },
  K extends keyof T,
> = { [_ in K]?: never }
export type Incremental<T> =
  | T
  | {
      [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never
    }
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string }
  String: { input: string; output: string }
  Boolean: { input: boolean; output: boolean }
  Int: { input: number; output: number }
  Float: { input: number; output: number }
}

export type Album = {
  __typename?: 'Album'
  artist: Scalars['String']['output']
  coverImage: Maybe<Scalars['String']['output']>
  description: Maybe<Scalars['String']['output']>
  genre: Maybe<Scalars['String']['output']>
  name: Scalars['String']['output']
  tracks: Maybe<Array<Scalars['String']['output']>>
  year: Maybe<Scalars['String']['output']>
}

export type Artist = {
  __typename?: 'Artist'
  bannerImage: Maybe<Scalars['String']['output']>
  biography: Maybe<Scalars['String']['output']>
  disbanded: Maybe<Scalars['Boolean']['output']>
  disbandedYear: Maybe<Scalars['String']['output']>
  facebook: Maybe<Scalars['String']['output']>
  formedYear: Maybe<Scalars['String']['output']>
  genre: Maybe<Scalars['String']['output']>
  image: Maybe<Scalars['String']['output']>
  location: Maybe<Scalars['String']['output']>
  logo: Maybe<Scalars['String']['output']>
  memberQuantity: Maybe<Scalars['Float']['output']>
  name: Scalars['String']['output']
  style: Maybe<Scalars['String']['output']>
  twitter: Maybe<Scalars['String']['output']>
  website: Maybe<Scalars['String']['output']>
}

export type Query = {
  __typename?: 'Query'
  artist: Artist
  getAlbumBySong: SongAlbum
  getAlbums: Maybe<Array<Album>>
  getLyrics: SongLyrics
  getVideoInfo: Array<SongVideo>
  searchArtists: Array<Scalars['String']['output']>
  similarArtists: Array<Artist>
  topsongsByArtist: Array<Song>
}

export type QueryArtistArgs = {
  name: Scalars['String']['input']
}

export type QueryGetAlbumBySongArgs = {
  artist: Scalars['String']['input']
  song: Scalars['String']['input']
}

export type QueryGetAlbumsArgs = {
  artist: Scalars['String']['input']
  limit?: InputMaybe<Scalars['Int']['input']>
  page: InputMaybe<Scalars['Int']['input']>
}

export type QueryGetLyricsArgs = {
  artist: Scalars['String']['input']
  song: Scalars['String']['input']
}

export type QueryGetVideoInfoArgs = {
  query: Scalars['String']['input']
}

export type QuerySearchArtistsArgs = {
  artist: Scalars['String']['input']
  limit?: Scalars['Int']['input']
}

export type QuerySimilarArtistsArgs = {
  artist: Scalars['String']['input']
  limit?: Scalars['Int']['input']
  onlyNames?: Scalars['Boolean']['input']
}

export type QueryTopsongsByArtistArgs = {
  artist: Scalars['String']['input']
  limit?: Scalars['Int']['input']
  page: InputMaybe<Scalars['Int']['input']>
}

export type Song = {
  __typename?: 'Song'
  album: Maybe<Scalars['String']['output']>
  artist: Scalars['String']['output']
  duration: Maybe<Scalars['String']['output']>
  genre: Maybe<Scalars['String']['output']>
  playcount: Maybe<Scalars['String']['output']>
  playlistId: Maybe<Scalars['Int']['output']>
  title: Scalars['String']['output']
  year: Maybe<Scalars['String']['output']>
}

export type SongAlbum = {
  __typename?: 'SongAlbum'
  artist: Scalars['String']['output']
  coverUrl: Scalars['String']['output']
  title: Scalars['String']['output']
}

export type SongLyrics = {
  __typename?: 'SongLyrics'
  artist: Scalars['String']['output']
  lyrics: Scalars['String']['output']
  title: Scalars['String']['output']
}

export type SongVideo = {
  __typename?: 'SongVideo'
  artist: Scalars['String']['output']
  title: Scalars['String']['output']
  videoId: Scalars['String']['output']
}

export type ArtistQueryQueryVariables = Exact<{
  name: Scalars['String']['input']
}>

export type ArtistQueryQuery = {
  __typename?: 'Query'
  artist: {
    __typename: 'Artist'
    name: string
    biography: string | null
    bannerImage: string | null
    genre: string | null
    formedYear: string | null
    twitter: string | null
    disbanded: boolean | null
    facebook: string | null
    location: string | null
    style: string | null
    logo: string | null
    image: string | null
    website: string | null
  }
}

export type GetAlbumBySongQueryQueryVariables = Exact<{
  artist: Scalars['String']['input']
  song: Scalars['String']['input']
}>

export type GetAlbumBySongQueryQuery = {
  __typename?: 'Query'
  getAlbumBySong: {
    __typename: 'SongAlbum'
    artist: string
    coverUrl: string
    title: string
  }
}

export type GetAlbumsQueryQueryVariables = Exact<{
  artist: Scalars['String']['input']
}>

export type GetAlbumsQueryQuery = {
  __typename?: 'Query'
  getAlbums: Array<{
    __typename?: 'Album'
    artist: string
    coverImage: string | null
    description: string | null
    genre: string | null
    name: string
    tracks: Array<string> | null
    year: string | null
  }> | null
}

export type GetLyricsQueryQueryVariables = Exact<{
  artist: Scalars['String']['input']
  song: Scalars['String']['input']
}>

export type GetLyricsQueryQuery = {
  __typename?: 'Query'
  getLyrics: {
    __typename: 'SongLyrics'
    artist: string
    lyrics: string
    title: string
  }
}

export type GetVideoInfoQueryQueryVariables = Exact<{
  query: Scalars['String']['input']
}>

export type GetVideoInfoQueryQuery = {
  __typename?: 'Query'
  getVideoInfo: Array<{
    __typename: 'SongVideo'
    artist: string
    title: string
    videoId: string
  }>
}

export type SearchArtistQueryQueryVariables = Exact<{
  artist: Scalars['String']['input']
}>

export type SearchArtistQueryQuery = {
  __typename?: 'Query'
  searchArtists: Array<string>
}

export type SimilarArtistsQueryQueryVariables = Exact<{
  artist: Scalars['String']['input']
  limit: InputMaybe<Scalars['Int']['input']>
  onlyNames: InputMaybe<Scalars['Boolean']['input']>
}>

export type SimilarArtistsQueryQuery = {
  __typename?: 'Query'
  similarArtists: Array<{
    __typename: 'Artist'
    name: string
    image: string | null
    bannerImage: string | null
  }>
}

export type TopsongsByArtistQueryQueryVariables = Exact<{
  artist: Scalars['String']['input']
}>

export type TopsongsByArtistQueryQuery = {
  __typename?: 'Query'
  topsongsByArtist: Array<{
    __typename: 'Song'
    artist: string
    title: string
    playcount: string | null
  }>
}

export const ArtistQueryDocument = gql`
  query artistQuery($name: String!) {
    artist(name: $name) {
      name
      biography
      bannerImage
      genre
      formedYear
      twitter
      disbanded
      facebook
      location
      disbanded
      style
      logo
      image
      website
      __typename
    }
  }
`
export const GetAlbumBySongQueryDocument = gql`
  query getAlbumBySongQuery($artist: String!, $song: String!) {
    getAlbumBySong(artist: $artist, song: $song) {
      artist
      coverUrl
      title
      __typename
    }
  }
`
export const GetAlbumsQueryDocument = gql`
  query getAlbumsQuery($artist: String!) {
    getAlbums(artist: $artist, limit: 10, page: 1) {
      artist
      coverImage
      description
      genre
      name
      tracks
      year
    }
  }
`
export const GetLyricsQueryDocument = gql`
  query getLyricsQuery($artist: String!, $song: String!) {
    getLyrics(artist: $artist, song: $song) {
      artist
      lyrics
      title
      __typename
    }
  }
`
export const GetVideoInfoQueryDocument = gql`
  query getVideoInfoQuery($query: String!) {
    getVideoInfo(query: $query) {
      artist
      title
      videoId
      __typename
    }
  }
`
export const SearchArtistQueryDocument = gql`
  query searchArtistQuery($artist: String!) {
    searchArtists(artist: $artist)
  }
`
export const SimilarArtistsQueryDocument = gql`
  query similarArtistsQuery(
    $artist: String!
    $limit: Int
    $onlyNames: Boolean
  ) {
    similarArtists(artist: $artist, limit: $limit, onlyNames: $onlyNames) {
      name
      image
      bannerImage
      __typename
    }
  }
`
export const TopsongsByArtistQueryDocument = gql`
  query topsongsByArtistQuery($artist: String!) {
    topsongsByArtist(artist: $artist) {
      artist
      title
      playcount
      __typename
    }
  }
`

export type SdkFunctionWrapper = <T>(
  action: (requestHeaders?: Record<string, string>) => Promise<T>,
  operationName: string,
  operationType?: string
) => Promise<T>

const defaultWrapper: SdkFunctionWrapper = (
  action,
  _operationName,
  _operationType
) => action()

export function getSdk(
  client: GraphQLClient,
  withWrapper: SdkFunctionWrapper = defaultWrapper
) {
  return {
    artistQuery(
      variables: ArtistQueryQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders
    ): Promise<ArtistQueryQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<ArtistQueryQuery>(ArtistQueryDocument, variables, {
            ...requestHeaders,
            ...wrappedRequestHeaders,
          }),
        'artistQuery',
        'query'
      )
    },
    getAlbumBySongQuery(
      variables: GetAlbumBySongQueryQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders
    ): Promise<GetAlbumBySongQueryQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<GetAlbumBySongQueryQuery>(
            GetAlbumBySongQueryDocument,
            variables,
            { ...requestHeaders, ...wrappedRequestHeaders }
          ),
        'getAlbumBySongQuery',
        'query'
      )
    },
    getAlbumsQuery(
      variables: GetAlbumsQueryQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders
    ): Promise<GetAlbumsQueryQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<GetAlbumsQueryQuery>(
            GetAlbumsQueryDocument,
            variables,
            { ...requestHeaders, ...wrappedRequestHeaders }
          ),
        'getAlbumsQuery',
        'query'
      )
    },
    getLyricsQuery(
      variables: GetLyricsQueryQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders
    ): Promise<GetLyricsQueryQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<GetLyricsQueryQuery>(
            GetLyricsQueryDocument,
            variables,
            { ...requestHeaders, ...wrappedRequestHeaders }
          ),
        'getLyricsQuery',
        'query'
      )
    },
    getVideoInfoQuery(
      variables: GetVideoInfoQueryQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders
    ): Promise<GetVideoInfoQueryQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<GetVideoInfoQueryQuery>(
            GetVideoInfoQueryDocument,
            variables,
            { ...requestHeaders, ...wrappedRequestHeaders }
          ),
        'getVideoInfoQuery',
        'query'
      )
    },
    searchArtistQuery(
      variables: SearchArtistQueryQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders
    ): Promise<SearchArtistQueryQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<SearchArtistQueryQuery>(
            SearchArtistQueryDocument,
            variables,
            { ...requestHeaders, ...wrappedRequestHeaders }
          ),
        'searchArtistQuery',
        'query'
      )
    },
    similarArtistsQuery(
      variables: SimilarArtistsQueryQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders
    ): Promise<SimilarArtistsQueryQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<SimilarArtistsQueryQuery>(
            SimilarArtistsQueryDocument,
            variables,
            { ...requestHeaders, ...wrappedRequestHeaders }
          ),
        'similarArtistsQuery',
        'query'
      )
    },
    topsongsByArtistQuery(
      variables: TopsongsByArtistQueryQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders
    ): Promise<TopsongsByArtistQueryQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<TopsongsByArtistQueryQuery>(
            TopsongsByArtistQueryDocument,
            variables,
            { ...requestHeaders, ...wrappedRequestHeaders }
          ),
        'topsongsByArtistQuery',
        'query'
      )
    },
  }
}
export type Sdk = ReturnType<typeof getSdk>
