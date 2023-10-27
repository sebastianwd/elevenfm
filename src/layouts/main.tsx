import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

import { Menu } from '~/components/menu'
import { Modal } from '~/components/modal'
import { FooterPlayer } from '~/components/player'
import { VideoPlayer } from '~/components/video-player'
import { useLayoutState } from '~/store/use-layout-state'

const VideoPlayerContainer = () => {
  const videoPosition = useLayoutState((state) => state.videoPosition)

  const [domReady, setDomReady] = useState(false)

  useEffect(() => {
    setDomReady(true)
  }, [])

  return domReady
    ? createPortal(
        <VideoPlayer />,
        document.querySelector(`[data-${videoPosition}]`) as Element
      )
    : null
}

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <div className='relative flex w-full flex-grow flex-col flex-wrap py-4 md:flex-row md:flex-nowrap md:py-0'>
        <div className='flex-shrink-0 md:w-36'></div>
        <Menu />
        <main role='main' className='w-full flex-grow'>
          {children}
        </main>
      </div>
      <div className='h-28' />
      <FooterPlayer />
      <Modal />
      <VideoPlayerContainer />
    </>
  )
}

export default MainLayout
