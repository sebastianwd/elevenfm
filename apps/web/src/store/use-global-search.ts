import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

interface GlobalSearchState {
  search: string
  isOpen: boolean
  setSearch: (search: string) => void
  setIsOpen: (isOpen: boolean) => void
}

export const useGlobalSearchStore = create<GlobalSearchState>()(
  devtools(
    immer((set) => ({
      search: '',
      isOpen: false,
      setSearch: (search: string) =>
        set((state) => {
          state.search = search
        }),
      setIsOpen: (isOpen: boolean) =>
        set((state) => {
          state.isOpen = isOpen
        }),
    }))
  )
)
