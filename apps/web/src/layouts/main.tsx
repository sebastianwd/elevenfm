import { Toaster } from 'sonner'

import { Attribution } from '~/components/attribution/attribution'
import { Menu } from '~/components/menu'
import { Modal } from '~/components/modal'
import { FooterPlayer } from '~/components/player'
import { RightSidebar } from '~/components/right-sidebar'
import { DragSongContext } from '~/context/drag-song-context'

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <div className='relative flex w-full grow flex-col flex-wrap py-4 md:flex-row md:flex-nowrap md:py-0'>
        <DragSongContext>
          <Menu />
          <main
            role='main'
            className='@container/main order-3 w-full grow md:order-[unset]'
          >
            {children}
          </main>
          <RightSidebar />
        </DragSongContext>
        <FooterPlayer />
      </div>
      <Attribution />
      <div className='h-28' />
      <Toaster />
      <Modal />
    </>
  )
}

export default MainLayout
