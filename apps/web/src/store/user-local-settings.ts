import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

export type UserPlaylistSortableProperties =
  | 'custom'
  | 'title'
  | 'artist'
  | 'dateAdded'

export type ArtistSortableProperties = 'default' | 'scrobbles' | 'title'

export type PlaylistSortingSettings = {
  identifier: string
  sortBy?: UserPlaylistSortableProperties | ArtistSortableProperties
  direction?: 'asc' | 'desc'
}

interface LocalSettingsState {
  shuffledPlaylists: string[]
  toggleShuffledPlaylist: (shuffledPlaylist: string) => void
  sortedPlaylists: PlaylistSortingSettings[]
  toggleSortedPlaylist: (sortedPlaylist: PlaylistSortingSettings) => void
}

export const useLocalSettings = create<LocalSettingsState>()(
  devtools(
    immer(
      persist(
        (set) => ({
          shuffledPlaylists: [],
          toggleShuffledPlaylist: (shuffledPlaylist: string) =>
            set((state) => {
              if (state.shuffledPlaylists.includes(shuffledPlaylist)) {
                state.shuffledPlaylists = state.shuffledPlaylists.filter(
                  (playlist) => playlist !== shuffledPlaylist
                )
                return
              }
              state.shuffledPlaylists.push(shuffledPlaylist)
            }),
          sortedPlaylists: [],
          toggleSortedPlaylist: (sortedPlaylist: PlaylistSortingSettings) =>
            set((state) => {
              const index = state.sortedPlaylists.findIndex(
                (playlist) => playlist.identifier === sortedPlaylist.identifier
              )
              if (index !== -1) {
                state.sortedPlaylists[index] = {
                  ...state.sortedPlaylists[index],
                  ...sortedPlaylist,
                }
                return
              }

              state.sortedPlaylists.push(sortedPlaylist)
            }),
        }),
        { name: 'local-settings' }
      )
    )
  )
)
