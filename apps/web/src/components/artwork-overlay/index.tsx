'use client'

import { memo } from 'react'

import { isR2Url } from '~/utils/r2-utils'

interface ArtworkOverlayProps {
  currentSong?: {
    urls?: string[]
    albumCoverUrl?: string
    title?: string
    artist?: string
  }
  className?: string
}

export const ArtworkOverlay = memo(
  ({ currentSong, className }: ArtworkOverlayProps) => {
    // Only show overlay for R2 files
    if (!currentSong?.urls?.[0] || !isR2Url(currentSong.urls[0])) {
      return null
    }

    return (
      <div
        className={`absolute inset-2 bottom-8 flex items-center justify-center ${className || ''}`}
      >
        <div className='flex flex-col items-center space-y-3'>
          <img
            src={currentSong.albumCoverUrl || '/cover-placeholder.png'}
            width={120}
            height={120}
            alt=''
            className='h-30 w-30 rounded-lg object-cover shadow-lg'
          />
        </div>
      </div>
    )
  }
)

ArtworkOverlay.displayName = 'ArtworkOverlay'
