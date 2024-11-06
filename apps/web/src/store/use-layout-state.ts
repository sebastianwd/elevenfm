import { UniqueIdentifier } from '@dnd-kit/core'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

import { PlayableSong } from '~/types'

export type VideoPosition =
  | 'artist-page'
  | 'home-page'
  | 'theater-mode'
  | 'playlist-page'

interface LayoutState {
  videoPosition: VideoPosition
  setVideoPosition: (videoPosition: VideoPosition) => void
  theaterMode: boolean
  setTheaterMode: (theaterMode: boolean) => void
  draggingToPlaylistData: {
    id: UniqueIdentifier
    items: {
      artist: string
      title: string
    }[]
  } | null
  setDraggingToPlaylistEl: (el: LayoutState['draggingToPlaylistData']) => void
  currentPlaylist: PlayableSong[]
  setCurrentPlaylist: (playlist: PlayableSong[]) => void
}

export const useLayoutState = create<LayoutState>()(
  devtools(
    immer((set) => ({
      videoPosition: 'artist-page',
      setVideoPosition: (videoPosition) =>
        set((state) => {
          state.videoPosition = videoPosition
        }),
      theaterMode: false,
      setTheaterMode: (theaterMode) =>
        set((state) => {
          state.theaterMode = theaterMode
        }),
      draggingToPlaylistData: null,
      setDraggingToPlaylistEl: (el) =>
        set((state) => {
          state.draggingToPlaylistData = el
        }),
      currentPlaylist: [],
      setCurrentPlaylist: (playlist) =>
        set((state) => {
          state.currentPlaylist = playlist
        }),
    }))
  )
)
