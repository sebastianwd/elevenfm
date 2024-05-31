import {
  Data,
  DataRef,
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { restrictToWindowEdges, snapCenterToCursor } from '@dnd-kit/modifiers'
import { arrayMove, SortableData } from '@dnd-kit/sortable'
import { useMutation } from '@tanstack/react-query'
import { ClientError } from 'graphql-request'
import { useParams } from 'next/navigation'
import { memo, useCallback, useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { toast, Toaster } from 'sonner'

import {
  addToPlaylistMutation,
  queryClient,
  updatePlaylistSongRankMutation,
} from '~/api'
import { Menu } from '~/components/menu'
import { Modal } from '~/components/modal'
import { FooterPlayer } from '~/components/player'
import { Toast } from '~/components/toast'
import { VideoPlayer } from '~/components/video-player'
import { useLayoutState } from '~/store/use-layout-state'
import { PlayableSong } from '~/types'
import { getError } from '~/utils/get-error'
import { getBetweenRankAsc } from '~/utils/lexorank'

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

type DroppableEntity =
  | DataRef<{ name: string; id: string }>
  | DataRef<PlayableSong & SortableData>

const isPlaylistEntity = (
  entity: DroppableEntity['current']
): entity is Data<{ name: string; id: string }> => {
  if (!entity) return false

  return 'name' in entity && 'id' in entity
}

const AddToPlaylistDndContext = memo(
  ({ children }: { children: React.ReactNode }) => {
    const { setDraggingToPlaylistEl } = useLayoutState((state) => ({
      setDraggingToPlaylistEl: state.setDraggingToPlaylistEl,
    }))

    const updatePlaylistSongRank = useMutation({
      mutationKey: ['updatePlaylistSongRank'],
      mutationFn: updatePlaylistSongRankMutation,
      onError: (err: ClientError) => err,
    })

    const onDragStart = useCallback<
      NonNullable<React.ComponentProps<typeof DndContext>['onDragStart']>
    >(
      (event) => {
        setDraggingToPlaylistEl({
          artist: event.active.data.current?.artist,
          id: event.active.id,
          title: event.active.data.current?.title,
        })
      },
      [setDraggingToPlaylistEl]
    )

    const params = useParams<{ playlistId: string }>()

    const addToPlaylist = useMutation({
      mutationKey: ['addToPlaylist'],
      mutationFn: addToPlaylistMutation,
      onError: (err: ClientError) => err,
    })

    const { setCurrentPlaylist, currentPlaylist } = useLayoutState((state) => ({
      setCurrentPlaylist: state.setCurrentPlaylist,
      currentPlaylist: state.currentPlaylist,
    }))

    const onDragEnd = useCallback<
      NonNullable<React.ComponentProps<typeof DndContext>['onDragEnd']>
    >(
      async (event) => {
        const droppableEntity = (event.over?.data as DroppableEntity)?.current

        if (!droppableEntity) {
          setDraggingToPlaylistEl(null)
          return
        }

        const song = (event.active.data as DataRef<PlayableSong & SortableData>)
          ?.current

        if (isPlaylistEntity(droppableEntity)) {
          if (!song?.title && !song?.artist) return

          try {
            await addToPlaylist.mutateAsync({
              playlistId: droppableEntity.id,
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
              () => (
                <Toast message={`✔ Song added to ${droppableEntity.name}`} />
              ),
              {
                duration: 3500,
              }
            )

            await queryClient.invalidateQueries({
              queryKey: ['userPlaylist', droppableEntity.id],
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
          } finally {
            setDraggingToPlaylistEl(null)
          }
        } else {
          if (
            droppableEntity.id === song?.id ||
            !params?.playlistId ||
            !song?.id
          ) {
            setDraggingToPlaylistEl(null)
            return
          }

          const oldIndex = song.sortable.index
          const newIndex = droppableEntity.sortable.index

          if (!currentPlaylist?.length) return

          const reorderedPlaylist = arrayMove(
            currentPlaylist,
            oldIndex,
            newIndex
          )

          setCurrentPlaylist(reorderedPlaylist)

          const newRank = getBetweenRankAsc({
            previous: reorderedPlaylist[newIndex - 1],
            next: reorderedPlaylist[newIndex + 1],
            item: currentPlaylist[oldIndex],
          })

          await updatePlaylistSongRank.mutateAsync({
            playlistId: params.playlistId,
            songId: song.id,
            rank: newRank.toString(),
          })

          await queryClient.invalidateQueries({
            queryKey: ['userPlaylist', params.playlistId],
          })
        }

        setDraggingToPlaylistEl(null)
      },
      [
        addToPlaylist,
        currentPlaylist,
        params?.playlistId,
        setCurrentPlaylist,
        setDraggingToPlaylistEl,
        updatePlaylistSongRank,
      ]
    )

    const pointerSensor = useSensor(PointerSensor, {
      activationConstraint: {
        distance: 4,
      },
    })

    const sensors = useSensors(pointerSensor)

    const modifiers = useMemo(
      () => [snapCenterToCursor, restrictToWindowEdges],
      []
    )

    const onDragCancel = useCallback(() => {
      setDraggingToPlaylistEl(null)
    }, [setDraggingToPlaylistEl])

    return (
      <DndContext
        onDragStart={onDragStart}
        sensors={sensors}
        onDragEnd={onDragEnd}
        modifiers={modifiers}
        onDragCancel={onDragCancel}
      >
        {children}
      </DndContext>
    )
  }
)

AddToPlaylistDndContext.displayName = 'AddToPlaylistDndContext'

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
