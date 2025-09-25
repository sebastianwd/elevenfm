'use client'

import { orpc, queryClient } from '@repo/api/lib/orpc.client'
import { useMutation } from '@tanstack/react-query'
import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

import { Toast } from '~/components/toast'
import { useModalStore } from '~/store/use-modal'

export const useSpotifyDragDrop = () => {
  const pathname = usePathname()
  const isPlaylistPage = pathname.startsWith('/playlist/')
  const playlistId = isPlaylistPage ? pathname.split('/')[2] : null
  const isModalOpen = useModalStore((state) => state.isOpen)

  const [isDragging, setIsDragging] = useState(false)

  const { mutateAsync: importPlaylist, isPending: isImporting } = useMutation(
    orpc.playlist.import.mutationOptions()
  )

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault()
  }, [])

  const handleDragEnter = useCallback(() => {
    if (isModalOpen) return
    setIsDragging(true)
  }, [isModalOpen])

  const handleDragLeave = useCallback((e: DragEvent) => {
    if (!e.relatedTarget) {
      setIsDragging(false)
    }
  }, [])

  const handleDrop = useCallback(
    async (e: DragEvent) => {
      e.preventDefault()
      setIsDragging(false)

      // Don't process drops if modal is open
      if (isModalOpen) return

      if (!isPlaylistPage || !playlistId) return

      const data = e.dataTransfer?.getData('text/plain')
      if (!data) return

      try {
        await importPlaylist({
          url: data,
          playlistId,
        })

        await queryClient.invalidateQueries({
          queryKey: orpc.playlist.get.queryKey({ input: { playlistId } }),
        })

        toast.custom(() => <Toast message='✔ Added song to playlist' />, {
          duration: 3000,
        })
      } catch (error) {
        console.error('Failed to import song:', error)
        toast.custom(
          () => <Toast message='❌ Failed to add song to playlist' />,
          {
            duration: 3000,
          }
        )
      }
    },
    [isPlaylistPage, playlistId, importPlaylist, isModalOpen]
  )

  const handleDragEnd = useCallback(() => {
    setIsDragging(false)
  }, [])

  useEffect(() => {
    const controller = new AbortController()

    window.addEventListener('dragover', handleDragOver, {
      signal: controller.signal,
    })
    window.addEventListener('dragenter', handleDragEnter, {
      signal: controller.signal,
    })
    window.addEventListener('dragleave', handleDragLeave, {
      signal: controller.signal,
    })
    window.addEventListener('drop', handleDrop, { signal: controller.signal })
    window.addEventListener('dragend', handleDragEnd, {
      signal: controller.signal,
    })

    return () => {
      controller.abort()
    }
  }, [
    handleDragOver,
    handleDragEnter,
    handleDragLeave,
    handleDrop,
    handleDragEnd,
  ])

  return {
    isDragging: isDragging && isPlaylistPage && !isModalOpen,
    isImporting,
  }
}
