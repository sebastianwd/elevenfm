'use client'

import { SearchTrigger } from '~/components/search-trigger'
import { Seo } from '~/components/seo'
import { TheaterMode } from '~/components/theater-mode'
import { VideoPlayerPortalContainer } from '~/components/video-player'
import { useGlobalSearchStore } from '~/store/use-global-search'
import { useLayoutState } from '~/store/use-layout-state'

import { AnimatedBeam } from './beam'
import { Gradient } from './gradient'

export const HomePage = () => {
  const { setIsOpen } = useGlobalSearchStore()

  const theaterMode = useLayoutState((state) => state.theaterMode)

  const renderContent = () => {
    if (theaterMode) {
      return <TheaterMode />
    }

    return (
      <>
        <div className='relative container mx-auto flex h-full flex-col items-center px-6 md:flex-row md:px-8 lg:gap-4'>
          <Gradient />
          <div className='flex grow flex-col'>
            <h1
              className='mt-8 mb-4 text-3xl text-balance text-gray-100 lg:-mt-4 lg:text-4xl'
              id='home'
            >
              Listen to your favorite artists <br /> and create your own
              playlists!
            </h1>
            <h2 className='text-lg text-zinc-400'>
              Enjoy unlimited free music, full albums, lyrics, import playlists{' '}
              and much more!
            </h2>
            <SearchTrigger
              className='z-10 mt-6 h-12 px-5 py-7'
              onClick={() => setIsOpen(true)}
            />
          </div>
          <AnimatedBeam className='mx-auto mt-10 h-2/5 md:pl-8 lg:mt-0' />
        </div>
        <VideoPlayerPortalContainer className='hidden' position='home-page' />
      </>
    )
  }

  return (
    <>
      <Seo description='Enjoy unlimited free music, find similar artists, full albums, lyrics and much more!' />
      {renderContent()}
    </>
  )
}
