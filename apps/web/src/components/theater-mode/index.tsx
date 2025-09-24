'use client'
import { usePlayerState } from '~/store/use-player'

import { Lyrics } from '../player'
import { VideoPlayer } from '../video-player'

export const TheaterMode = () => {
  const currentSong = usePlayerState((state) => state.currentSong)

  if (!currentSong) {
    return <p className='my-auto text-center'>No song playing</p>
  }

  return (
    <div className='grid grid-cols-1 lg:grow lg:grid-cols-3'>
      <div className='lg:col-span-2'>
        <VideoPlayer />
      </div>
      <div className='relative lg:col-span-1'>
        <Lyrics
          artist={currentSong.artist}
          song={currentSong.title}
          className='h-[calc(100svh/1.95)] lg:h-[calc(100svh-11rem)]'
        />
      </div>
    </div>
  )
}
