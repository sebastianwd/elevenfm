import { QueryClient } from '@tanstack/react-query'
import { GraphQLClient } from 'graphql-request'

import { getSdk } from '~/generated/graphql'

import { getBaseURL } from './utils/get-base-url'

const gqlClient = new GraphQLClient(`${getBaseURL()}/api/graphql`)

export const {
  artistQuery,
  searchArtistQuery,
  topsongsByArtistQuery,
  getVideoInfoQuery,
  getAlbumBySongQuery,
  getAlbumsQuery,
  similarArtistsQuery,
  getLyricsQuery,
  userPlaylistsQuery,
  createPlaylistMutation,
  playlistQuery,
  importPlaylistMutation,
  removeFromPlaylistMutation,
  deletePlaylistMutation,
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
