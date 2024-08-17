/* eslint-disable @next/next/no-img-element */
import type { NextPage } from 'next'

import { AnimatedBeam } from '~/components/landing/beam'
import { SearchTrigger } from '~/components/search-trigger'
import { Seo } from '~/components/seo'
import { VideoPlayerPortalContainer } from '~/components/video-player'
import { useGlobalSearchStore } from '~/store/use-global-search'

const Home: NextPage = () => {
  const { setIsOpen } = useGlobalSearchStore()

  return (
    <>
      <Seo description='Enjoy unlimited free music, find similar artists, full albums, lyrics and much more!' />
      <div className='container mx-auto flex h-full px-6 md:px-8 items-center flex-col md:flex-row lg:gap-4 relative overflow-clip md:overflow-visible'>
        <div className='flex flex-col grow'>
          <div
            className='absolute top-1/4 h-1/2'
            style={{
              width: '100%',
              maxWidth: '640px',
              backgroundImage: `radial-gradient(at 27% 37%, hsla(215, 98%, 61%, 1) 0px, transparent 0%), 
                        radial-gradient(at 97% 21%, hsla(125, 98%, 72%, 1) 0px, transparent 50%),
                        radial-gradient(at 52% 99%, hsla(354, 98%, 61%, 1) 0px, transparent 50%),
                        radial-gradient(at 10% 29%, hsla(256, 96%, 67%, 1) 0px, transparent 50%),
                        radial-gradient(at 97% 96%, hsla(38, 60%, 74%, 1) 0px, transparent 50%),
                        radial-gradient(at 33% 50%, hsla(222, 67%, 73%, 1) 0px, transparent 50%),
                        radial-gradient(at 79% 53%, hsla(343, 68%, 79%, 1) 0px, transparent 50%)`,
              position: 'absolute',
              filter: 'blur(100px) saturate(150%)',
              opacity: 0.15,
            }}
          />
          <h1
            className='mb-4 mt-8 lg:-mt-4 text-3xl md:text-4xl text-balance text-gray-100'
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
        {/*<img
          src='/landing-logo.svg'
          className='ml-auto mr-5 mt-10 h-2/5 lg:mt-0'
          alt='Landing logo'
        />*/}
        <AnimatedBeam className='mx-auto mt-10 h-2/5 lg:mt-0 pl-8' />
      </div>
      <VideoPlayerPortalContainer className='hidden' position='home-page' />
    </>
  )
}

export default Home
