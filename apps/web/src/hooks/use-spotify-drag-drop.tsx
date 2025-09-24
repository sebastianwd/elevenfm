'use client'

import { orpc, queryClient } from '@repo/api/lib/orpc.client'
import { useMutation } from '@tanstack/react-query'
import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

import { Toast } from '~/components/toast'

export const useSpotifyDragDrop = () => {
  const pathname = usePathname()
  const isPlaylistPage = pathname.startsWith('/playlist/')
  const playlistId = isPlaylistPage ? pathname.split('/')[2] : null

  const [isDragging, setIsDragging] = useState(false)

  const { mutateAsync: importPlaylist, isPending: isImporting } = useMutation(
    orpc.playlist.import.mutationOptions()
  )

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault()
  }, [])

  const handleDragEnter = useCallback(() => {
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: DragEvent) => {
    if (!e.relatedTarget) {
      setIsDragging(false)
    }
  }, [])

  const handleDrop = useCallback(
    async (e: DragEvent) => {
      e.preventDefault()
      setIsDragging(false)

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
    [isPlaylistPage, playlistId, importPlaylist]
  )

  const handleDragEnd = useCallback(() => {
    setIsDragging(false)
  }, [])

  useEffect(() => {
    window.addEventListener('dragover', handleDragOver)
    window.addEventListener('dragenter', handleDragEnter)
    window.addEventListener('dragleave', handleDragLeave)
    window.addEventListener('drop', handleDrop)
    window.addEventListener('dragend', handleDragEnd)

    return () => {
      window.removeEventListener('dragover', handleDragOver)
      window.removeEventListener('dragenter', handleDragEnter)
      window.removeEventListener('dragleave', handleDragLeave)
      window.removeEventListener('drop', handleDrop)
      window.removeEventListener('dragend', handleDragEnd)
    }
  }, [
    handleDragOver,
    handleDragEnter,
    handleDragLeave,
    handleDrop,
    handleDragEnd,
  ])

  return {
    isDragging: isDragging && isPlaylistPage,
    isImporting,
  }
}
