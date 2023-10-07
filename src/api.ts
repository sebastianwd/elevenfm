import { QueryClient } from '@tanstack/react-query'
import { GraphQLClient } from 'graphql-request'

import { getSdk } from '~/generated/graphql'

const gqlClient = new GraphQLClient('http://localhost:3000/api/graphql')

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
