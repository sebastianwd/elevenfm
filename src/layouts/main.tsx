import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Toaster } from 'sonner'

import { Menu } from '~/components/menu'
import { Modal } from '~/components/modal'
import { FooterPlayer } from '~/components/player'
import { VideoPlayer } from '~/components/video-player'
import { useLayoutState } from '~/store/use-layout-state'

const VideoPlayerPortal = () => {
  const videoPosition = useLayoutState((state) => state.videoPosition)

  const [domReady, setDomReady] = useState(false)

  useEffect(() => {
    setDomReady(true)
  }, [])

  const container = domReady
    ? document.querySelector(`[data-${videoPosition}]`)
    : null

  return domReady && container ? createPortal(<VideoPlayer />, container) : null
}

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <div className='relative flex w-full flex-grow flex-col flex-wrap py-4 md:flex-row md:flex-nowrap md:py-0'>
        <Menu />
        <main role='main' className='w-full flex-grow'>
          {children}
        </main>
      </div>
      <div className='h-28' />
      <FooterPlayer />
      <Toaster />
      <Modal />
      <VideoPlayerPortal />
    </>
  )
}

export default MainLayout
