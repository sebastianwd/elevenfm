import { create } from 'zustand'

type ModalContent = {
  title: string
  content: React.ReactNode
}

type ModalState = {
  isOpen: boolean
  content: ModalContent
  openModal: (content: ModalContent) => void
  closeModal: () => void
}

export const useModalStore = create<ModalState>((set) => ({
  isOpen: false,
  content: {
    title: '',
    content: '',
  },
  openModal: (content) => set({ isOpen: true, content }),
  closeModal: () => set({ isOpen: false }),
}))
