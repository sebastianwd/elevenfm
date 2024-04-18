import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

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
}

export const useLayoutState = create<LayoutState>()(
  devtools(
    immer((set) => ({
      videoPosition: 'artist-page',
      setVideoPosition: (videoPosition: VideoPosition) =>
        set((state) => {
          state.videoPosition = videoPosition
        }),
      theaterMode: false,
      setTheaterMode: (theaterMode: boolean) =>
        set((state) => {
          state.theaterMode = theaterMode
        }),
    }))
  )
)
