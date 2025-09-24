'use client'

import { useSpotifyDragDrop } from '~/hooks/use-spotify-drag-drop'

export const URLDragOverlay = () => {
  const { isDragging, isImporting } = useSpotifyDragDrop()

  if (!isDragging && !isImporting) return null

  const getMessage = () => {
    if (isImporting) {
      return {
        title: 'Adding songs...',
        subtitle: 'Please wait while we add songs to your playlist',
        icon: '⏳',
      }
    }

    return {
      title: 'Drop to import',
      subtitle: 'Release to add songs to this playlist',
      icon: '📀',
    }
  }

  const message = getMessage()

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md'>
      <div className='animate-in duration-200 fade-in-0 zoom-in-95'>
        <div className='relative rounded-2xl border border-surface-700 bg-gradient-to-br from-surface-800 to-surface-900 p-8 text-center shadow-2xl'>
          <div className='absolute inset-0 animate-pulse rounded-2xl bg-gradient-to-r from-primary-500/20 to-purple-500/20' />

          <div className='relative z-10'>
            <div
              className={`mb-6 text-6xl ${isImporting ? 'animate-spin' : 'animate-bounce'}`}
            >
              {message.icon}
            </div>

            <h3 className='mb-3 text-2xl font-bold text-white'>
              {message.title}
            </h3>

            <p className='mb-6 max-w-md text-gray-300'>{message.subtitle}</p>

            <div className='flex items-center justify-center space-x-2'>
              <div
                className={`h-2 w-2 rounded-full bg-primary-500 ${isImporting ? 'animate-pulse' : 'animate-pulse'}`}
              />
              <div
                className={`h-2 w-2 rounded-full bg-primary-500 ${isImporting ? 'animate-pulse delay-100' : 'animate-pulse delay-100'}`}
              />
              <div
                className={`h-2 w-2 rounded-full bg-primary-500 ${isImporting ? 'animate-pulse delay-200' : 'animate-pulse delay-200'}`}
              />
            </div>
          </div>

          {/* Decorative elements */}
          <div className='absolute -top-2 -right-2 h-4 w-4 animate-ping rounded-full bg-primary-500/30' />
          <div className='absolute -bottom-2 -left-2 h-3 w-3 animate-ping rounded-full bg-purple-500/30 delay-300' />
        </div>
      </div>
    </div>
  )
}
