import { usePlayerState } from '~/store/use-player'

import { Lyrics } from '../player'
import { VideoPlayerPortalContainer } from '../video-player'

export const TheaterMode = () => {
  const currentSong = usePlayerState((state) => state.currentSong)

  if (!currentSong) {
    return <p className='text-center my-auto'>No song playing</p>
  }

  return (
    <div className='grid grid-cols-1 lg:grid-cols-3 lg:grow'>
      <VideoPlayerPortalContainer
        className='aspect-video max-w-full lg:h-full lg:col-span-2'
        position='theater-mode'
      />
      <div className='lg:col-span-1'>
        <Lyrics
          artist={currentSong?.artist}
          song={currentSong?.title}
          className='lg:h-[calc(100svh-11rem)] h-[calc(100svh/1.95)]'
        />
      </div>
    </div>
  )
}
