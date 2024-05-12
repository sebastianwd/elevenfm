import {
  DataRef,
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { snapCenterToCursor } from '@dnd-kit/modifiers'
import { useMutation } from '@tanstack/react-query'
import { ClientError } from 'graphql-request'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { toast, Toaster } from 'sonner'

import { addToPlaylistMutation, queryClient } from '~/api'
import { Menu } from '~/components/menu'
import { Modal } from '~/components/modal'
import { FooterPlayer } from '~/components/player'
import { Toast } from '~/components/toast'
import { VideoPlayer } from '~/components/video-player'
import { useLayoutState } from '~/store/use-layout-state'
import { getError } from '~/utils/get-error'

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

const AddToPlaylistDndContext = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const { setDraggingToPlaylistEl } = useLayoutState((state) => ({
    setDraggingToPlaylistEl: state.setDraggingToPlaylistEl,
  }))

  const onDragStart: React.ComponentProps<typeof DndContext>['onDragStart'] = (
    event
  ) => {
    setDraggingToPlaylistEl({
      artist: event.active.data.current?.artist,
      id: event.active.id,
      title: event.active.data.current?.title,
    })
  }

  const addToPlaylist = useMutation({
    mutationKey: ['addToPlaylist'],
    mutationFn: addToPlaylistMutation,
    onError: (err: ClientError) => err,
  })

  const onDragEnd: React.ComponentProps<
    typeof DndContext
  >['onDragEnd'] = async (event) => {
    const playlist = (event.over?.data as DataRef<{ name: string; id: string }>)
      ?.current

    const song = (
      event.active.data as DataRef<{
        artist: string
        title: string
        songUrl?: string
        id?: string
      }>
    )?.current

    if (playlist?.id && song?.title && song?.artist) {
      try {
        await addToPlaylist.mutateAsync({
          playlistId: playlist.id,
          songIds: song.id ? [song.id] : [],
          songs: !song.id
            ? [
                {
                  title: song.title,
                  artist: song.artist,
                  songUrl: song.songUrl || null,
                  album: '',
                },
              ]
            : [],
        })

        toast.custom(
          () => <Toast message={`✔ Song added to ${playlist.name}`} />,
          {
            duration: 3500,
          }
        )

        await queryClient.invalidateQueries({
          queryKey: ['userPlaylist', playlist.id],
          type: 'all',
        })
      } catch (error) {
        if (error instanceof ClientError) {
          toast.custom(() => <Toast message={`❌ ${getError(error)}`} />, {
            duration: 3500,
          })

          return
        }

        toast.custom(() => <Toast message={`❌ Something went wrong`} />, {
          duration: 3500,
        })
      }
    }

    setDraggingToPlaylistEl(null)
  }

  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: {
      distance: 10,
    },
  })

  const sensors = useSensors(pointerSensor)

  return (
    <DndContext
      onDragStart={onDragStart}
      sensors={sensors}
      onDragEnd={onDragEnd}
      modifiers={[snapCenterToCursor]}
    >
      {children}
    </DndContext>
  )
}

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <div className='relative flex w-full flex-grow flex-col flex-wrap py-4 md:flex-row md:flex-nowrap md:py-0'>
        <AddToPlaylistDndContext>
          <Menu />
          <main role='main' className='w-full flex-grow'>
            {children}
          </main>
        </AddToPlaylistDndContext>
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
