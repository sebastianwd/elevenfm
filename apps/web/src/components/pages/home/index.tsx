import { SearchTrigger } from '~/components/search-trigger'
import { Seo } from '~/components/seo'
import { VideoPlayerPortalContainer } from '~/components/video-player'
import { useGlobalSearchStore } from '~/store/use-global-search'

import { AnimatedBeam } from './beam'
import { Gradient } from './gradient'

export const HomePage = () => {
  const { setIsOpen } = useGlobalSearchStore()

  return (
    <>
      <Seo description='Enjoy unlimited free music, find similar artists, full albums, lyrics and much more!' />
      <div className='container mx-auto flex h-full px-6 md:px-8 items-center flex-col md:flex-row lg:gap-4 relative '>
        <Gradient />
        <div className='flex flex-col grow'>
          <h1
            className='mb-4 mt-8 lg:-mt-4 text-3xl lg:text-4xl text-balance text-gray-100'
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
            className='mt-6 h-12 py-7 px-5 z-10'
            onClick={() => setIsOpen(true)}
          />
        </div>
        <AnimatedBeam className='mx-auto mt-10 h-2/5 lg:mt-0 md:pl-8' />
      </div>
      <VideoPlayerPortalContainer className='hidden' position='home-page' />
    </>
  )
}
