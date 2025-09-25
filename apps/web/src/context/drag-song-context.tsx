'use client'
import type { Data, DataRef } from '@dnd-kit/core'
import { DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { restrictToWindowEdges, snapCenterToCursor } from '@dnd-kit/modifiers'
import type { SortableData } from '@dnd-kit/sortable'
import { arrayMove } from '@dnd-kit/sortable'
import { orpc, queryClient } from '@repo/api/lib/orpc.client'
import { useMutation } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import { memo, useCallback, useMemo } from 'react'
import { toast } from 'sonner'

import { Toast } from '~/components/toast'
import { useLayoutState } from '~/store/use-layout-state'
import type { PlayableSong } from '~/types'
import { getBetweenRankAsc } from '~/utils/lexorank'

type DroppableEntity =
  | DataRef<{ name: string; id: string }>
  | DataRef<{ items: PlayableSong[] } & SortableData>

const isPlaylistEntity = (
  entity: DroppableEntity['current']
): entity is Data<{ name: string; id: string }> => {
  if (!entity) return false

  return 'name' in entity && 'id' in entity
}
export const DragSongContext = memo(
  ({ children }: { children: React.ReactNode }) => {
    const setDraggingToPlaylistEl = useLayoutState(
      (state) => state.setDraggingToPlaylistEl
    )

    const { mutateAsync: updatePlaylistSongRank } = useMutation(
      orpc.playlist.updateSongRank.mutationOptions()
    )

    const onDragStart = useCallback<
      NonNullable<React.ComponentProps<typeof DndContext>['onDragStart']>
    >(
      (event) => {
        const data = (
          event.active.data as DataRef<{ items: PlayableSong[] } & SortableData>
        ).current

        if (!data) {
          return
        }

        setDraggingToPlaylistEl({
          id: event.active.id,
          items: data.items.map((item) => ({
            title: item.title,
            artist: item.artist,
          })),
        })
      },
      [setDraggingToPlaylistEl]
    )

    const params = useParams<{ playlistId: string }>()

    const { mutateAsync: addToPlaylist } = useMutation(
      orpc.playlist.addSong.mutationOptions()
    )

    const setCurrentPlaylist = useLayoutState(
      (state) => state.setCurrentPlaylist
    )
    const currentPlaylist = useLayoutState((state) => state.currentPlaylist)

    const onDragEnd = useCallback<
      NonNullable<React.ComponentProps<typeof DndContext>['onDragEnd']>
    >(
      async (event) => {
        const droppableEntity = (event.over?.data as DroppableEntity).current

        if (!droppableEntity) {
          setDraggingToPlaylistEl(null)
          return
        }

        const songs = (
          event.active.data as DataRef<{ items: PlayableSong[] } & SortableData>
        ).current

        if (isPlaylistEntity(droppableEntity)) {
          if (!songs) {
            return
          }

          const songsHaveIds = songs.items.every((song) => !!song.id)

          try {
            await addToPlaylist({
              playlistId: droppableEntity.id,
              // songs in a playlist use id
              songIds: songsHaveIds ? songs.items.map((song) => song.id!) : [],
              // songs from public artist use song data
              songs: !songsHaveIds
                ? songs.items.map((song) => ({
                    title: song.title,
                    artist: song.artist,
                    songUrl: song.songUrl || null,
                    album: '',
                  }))
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
              queryKey: orpc.playlist.get.queryKey({
                input: { playlistId: droppableEntity.id },
              }),
              type: 'all',
            })
          } catch (error) {
            if (error instanceof Error) {
              toast.custom(() => <Toast message={`❌ ${error.message}`} />, {
                duration: 3500,
              })

              return
            }

            toast.custom(() => <Toast message='❌ Something went wrong' />, {
              duration: 3500,
            })
          } finally {
            setDraggingToPlaylistEl(null)
          }
        } else {
          const song = songs?.items[0]
          if (
            droppableEntity.items[0]?.id === song?.id ||
            !params.playlistId ||
            !song?.id ||
            !songs ||
            songs.items.length !== 1
          ) {
            setDraggingToPlaylistEl(null)
            return
          }

          const oldIndex = songs.sortable.index
          const newIndex = droppableEntity.sortable.index

          if (!currentPlaylist.length) return

          const reorderedPlaylist = arrayMove(
            currentPlaylist,
            oldIndex,
            newIndex
          )

          setCurrentPlaylist(reorderedPlaylist)

          const newRank = getBetweenRankAsc({
            previous: reorderedPlaylist[newIndex - 1],
            next: reorderedPlaylist[newIndex + 1],
            item: currentPlaylist[oldIndex]!,
          })

          await updatePlaylistSongRank({
            playlistId: params.playlistId,
            songId: song.id,
            rank: newRank.toString(),
          })

          await queryClient.invalidateQueries({
            queryKey: orpc.playlist.get.queryKey({
              input: { playlistId: params.playlistId },
            }),
          })
        }

        setDraggingToPlaylistEl(null)
      },
      [
        addToPlaylist,
        currentPlaylist,
        params.playlistId,
        setCurrentPlaylist,
        setDraggingToPlaylistEl,
        updatePlaylistSongRank,
      ]
    )

    const pointerSensor = useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3,
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

DragSongContext.displayName = 'AddToPlaylistDndContext'
