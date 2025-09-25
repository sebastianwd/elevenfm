'use client'

import { Icon } from '@iconify/react'
import { useMemo } from 'react'

import { useSpotifyDragDrop } from '~/hooks/use-spotify-drag-drop'

export const URLDragOverlay = () => {
  const { isDragging, isImporting } = useSpotifyDragDrop()

  const message = useMemo(() => {
    if (isImporting) {
      return {
        title: 'Adding songs...',
        subtitle: 'Please wait while we add songs to your playlist',
        icon: 'svg-spinners:ring-resize',
      }
    }

    return {
      title: 'Drop to import',
      subtitle: 'Release to add songs to this playlist',
      icon: 'material-symbols:music-note',
    }
  }, [isImporting])

  if (!isDragging && !isImporting) return null

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm'>
      <div className='animate-in duration-200 fade-in-0 zoom-in-95'>
        <div className='relative rounded-xl border border-surface-700 bg-surface-800 p-6 text-center shadow-xl'>
          <div className='relative z-10'>
            <div className='mb-4 flex justify-center'>
              <Icon
                icon={message.icon}
                className={`size-12 text-surface-300 ${
                  isImporting ? 'animate-spin' : 'animate-pulse'
                }`}
              />
            </div>

            <h3 className='mb-2 text-lg font-semibold text-white'>
              {message.title}
            </h3>

            <p className='text-sm text-surface-400'>{message.subtitle}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
