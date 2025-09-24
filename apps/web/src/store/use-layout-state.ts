import type { UniqueIdentifier } from '@dnd-kit/core'
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

import type { PlayableSong } from '~/types'

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
  playlistMenuOpen: boolean
  setPlaylistMenuOpen: (playlistMenuOpen: boolean) => void
  rightSidebarOpen: boolean
  toggleRightSidebarOpen: () => void
  // for reordering logic
  currentPlaylist: PlayableSong[]
  setCurrentPlaylist: (playlist: PlayableSong[]) => void
}

export const useLayoutState = create<LayoutState>()(
  devtools(
    immer(
      persist(
        (set) => ({
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
          playlistMenuOpen: false,
          setPlaylistMenuOpen: (playlistMenuOpen) =>
            set((state) => {
              state.playlistMenuOpen = playlistMenuOpen
            }),
          rightSidebarOpen: false,
          toggleRightSidebarOpen: () =>
            set((state) => {
              state.rightSidebarOpen = !state.rightSidebarOpen
            }),
          currentPlaylist: [],
          setCurrentPlaylist: (playlist) =>
            set((state) => {
              state.currentPlaylist = playlist
            }),
        }),
        {
          name: 'layout-state',
          partialize: (state) => ({
            playlistMenuOpen: state.playlistMenuOpen,
            rightSidebarOpen: state.rightSidebarOpen,
          }),
        }
      )
    )
  )
)
