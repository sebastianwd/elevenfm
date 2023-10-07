import { QueryClient } from '@tanstack/react-query'
import { GraphQLClient } from 'graphql-request'

import { getSdk } from '~/generated/graphql'

import { getBaseUrl } from './utils/get-base-url'

console.log('getBaseUrl', process.env.NEXT_PUBLIC_VERCEL_URL)

const gqlClient = new GraphQLClient(`${getBaseUrl()}/api/graphql`)

export const {
  artistQuery,
  searchArtistQuery,
  topsongsByArtistQuery,
  getVideoInfoQuery,
  getAlbumBySongQuery,
  getAlbumsQuery,
  similarArtistsQuery,
  getLyricsQuery,
} = getSdk(gqlClient)

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  },
})
