import { QueryClient } from '@tanstack/react-query'
import { getSdk } from 'elevenfm-shared'
import { GraphQLClient } from 'graphql-request'

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
  updatePlaylistMutation,
  addToPlaylistMutation,
  createSongRadioMutation,
  updatePlaylistSongRankMutation,
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
