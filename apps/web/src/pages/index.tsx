/* eslint-disable @next/next/no-img-element */
import type { NextPage } from 'next'

import { SearchTrigger } from '~/components/search-trigger'
import { Seo } from '~/components/seo'
import { VideoPlayerPortalContainer } from '~/components/video-player'
import { useGlobalSearchStore } from '~/store/use-global-search'

const Home: NextPage = () => {
  const { setIsOpen } = useGlobalSearchStore()

  return (
    <>
      <Seo description='Enjoy unlimited free music, find similar artists, full albums, lyrics and much more!' />
      <div className='container mx-auto flex h-full flex-col px-6 md:px-8'>
        <h1 className='mb-4 mt-8 text-3xl md:text-4xl lg:mt-28' id='home'>
          Discover new music <br /> or listen to your favorite artists!
        </h1>
        <h2 className='text-lg text-zinc-400'>
          Enjoy unlimited free music, find similar artists, full albums, lyrics
          and much more!
        </h2>
        <SearchTrigger
          className='mt-8 h-12 py-7 px-5 md:w-1/2'
          onClick={() => setIsOpen(true)}
        />
        <img
          src='/landing-logo.svg'
          className='ml-auto mr-5 mt-10 h-2/5 lg:mt-0'
          alt='Landing logo'
        />
      </div>
      <VideoPlayerPortalContainer className='hidden' position='home-page' />
    </>
  )
}

export default Home
