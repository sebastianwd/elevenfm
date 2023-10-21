import { usePathname } from 'next/navigation'

import { Menu } from '~/components/menu'
import { Modal } from '~/components/modal'
import { FooterPlayer } from '~/components/player'
import { VideoPlayer } from '~/components/video-player'

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname()

  const isHome = pathname === '/'

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
      {isHome ? <VideoPlayer /> : null}
    </>
  )
}

export default MainLayout
