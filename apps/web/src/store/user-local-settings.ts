import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

interface LocalSettingsState {
  shuffledPlaylists: string[]
  toggleShuffledPlaylist: (shuffledPlaylist: string) => void
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
        }),
        { name: 'local-settings' }
      )
    )
  )
)
