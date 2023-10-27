import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

interface LayoutState {
  videoPosition: 'artist-page' | 'home-page'
  setVideoPosition: (videoPosition: 'artist-page' | 'home-page') => void
}

export const useLayoutState = create<LayoutState>()(
  devtools(
    immer((set) => ({
      videoPosition: 'artist-page',
      setVideoPosition: (videoPosition: 'artist-page' | 'home-page') =>
        set((state) => {
          state.videoPosition = videoPosition
        }),
    }))
  )
)
