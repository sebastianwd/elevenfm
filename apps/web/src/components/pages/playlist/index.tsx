'use client'

import { useSession } from '@repo/api/auth/auth.client'
import { orpc } from '@repo/api/lib/orpc.client'
import { useQuery } from '@tanstack/react-query'
import { orderBy } from 'es-toolkit'
import { useCallback, useEffect } from 'react'
import { toast } from 'sonner'
import { twMerge } from 'tailwind-merge'
import { useShallow } from 'zustand/react/shallow'

import { ArtistHeader } from '~/components/artist-header'
import { ImportPlaylistModal } from '~/components/modals/import-playlist-modal'
import { SongList } from '~/components/song-list'
import { TheaterMode } from '~/components/theater-mode'
import { Toast } from '~/components/toast'
import { VideoPlayerPortalContainer } from '~/components/video-player'
import { playlistType } from '~/constants'
import { useLayoutState } from '~/store/use-layout-state'
import { useLocalSettings } from '~/store/use-local-settings'
import { useModalStore } from '~/store/use-modal'
import { sortByLexoRankAsc } from '~/utils/lexorank'

interface PlaylistPageProps {
  playlistId: string
}

export function PlaylistPage({ playlistId }: PlaylistPageProps) {
  const session = useSession()

  const playlist = useQuery(
    orpc.playlist.get.queryOptions({
      input: { playlistId },
      staleTime: Infinity,
      gcTime: Infinity,
      enabled: !!playlistId,
    })
  )

  // need a separate state for instant playlist update when reordering
  const { setCurrentPlaylist, currentPlaylist } = useLayoutState(
    useShallow((state) => ({
      setCurrentPlaylist: state.setCurrentPlaylist,
      currentPlaylist: state.currentPlaylist,
    }))
  )

  const { sortedPlaylists } = useLocalSettings(
    useShallow((state) => ({
      sortedPlaylists: state.sortedPlaylists,
    }))
  )
  const sortingSettings = sortedPlaylists.find(
    (playlist) => playlist.identifier === playlistId
  )

  useEffect(() => {
    if (sortingSettings?.sortBy === 'custom' || !sortingSettings?.sortBy) {
      setCurrentPlaylist(
        playlist.data?.songs?.toSorted(sortByLexoRankAsc) ?? []
      )
    } else {
      setCurrentPlaylist(
        orderBy(
          playlist.data?.songs ?? [],
          [
            // @ts-expect-error TODO: fix this
            sortingSettings.sortBy === 'dateAdded'
              ? 'createdAt'
              : sortingSettings.sortBy,
          ],
          [sortingSettings.direction || 'desc']
        )
      )
    }
  }, [
    playlist.data?.songs,
    setCurrentPlaylist,
    sortingSettings?.direction,
    sortingSettings?.sortBy,
  ])

  const openModal = useModalStore((state) => state.openModal)
  const closeModal = useModalStore((state) => state.closeModal)

  const isRadio = playlist.data?.type === playlistType.RADIO

  const onImportFromUrl = useCallback(() => {
    openModal({
      content: (
        <ImportPlaylistModal
          playlistId={playlistId}
          onImportEnd={() => {
            toast.custom(() => <Toast message='✔ Playlist imported' />, {
              duration: 3000,
            })
            closeModal()
          }}
        />
      ),
      title: `Import playlist to ${playlist.data?.name}`,
    })
  }, [openModal, closeModal, playlistId, playlist.data?.name])

  const renderSongList = () => {
    if (playlist.isError) {
      return (
        <div className='mt-[10%] flex justify-center'>
          <p>{playlist.error.message || 'Something went wrong'} </p>
        </div>
      )
    }

    return (
      <SongList
        isEditable={
          playlist.data?.type === playlistType.PLAYLIST &&
          !!playlist.data.user.id &&
          playlist.data.user.id === session.data?.user.id
        }
        onImportFromUrl={onImportFromUrl}
        identifier={playlistId}
        songs={currentPlaylist}
        showArtist
        isLoading={playlist.isPending}
        emptyMessage='This playlist is empty'
      />
    )
  }

  const playlistUser = playlist.data?.user.name

  const { theaterMode } = useLayoutState()

  return (
    <div className='relative'>
      {theaterMode ? null : (
        <div
          className={twMerge(`absolute top-0 left-0 flex h-80 w-full flex-col`)}
        >
          <div
            className={twMerge(
              'size-full bg-top bg-no-repeat',
              'bg-gradient-blend-surface'
            )}
          ></div>
        </div>
      )}
      <div className='relative container mx-auto flex min-h-full w-full max-w-[1920px] flex-col'>
        {theaterMode ? (
          <TheaterMode />
        ) : (
          <>
            <div className='relative grid lg:grid-cols-3'>
              <header className='col-span-2 flex h-48 md:h-72'>
                <div className='z-10 mt-auto mb-16 flex w-full flex-col items-center gap-7 px-8 md:flex-row'>
                  <ArtistHeader
                    subtitle={
                      playlist.isPending
                        ? ''
                        : `${
                            isRadio
                              ? `Made for 👤${playlistUser}`
                              : playlistUser
                          } - ${playlist.data?.songs?.length} songs`
                    }
                    title={playlist.data?.name ?? ''}
                    externalUrls={{}}
                  />
                </div>
              </header>
              <div className='z-10 col-span-2 flex justify-center lg:col-span-1 lg:justify-end'>
                <VideoPlayerPortalContainer
                  position='playlist-page'
                  className='aspect-video max-w-full [&_iframe]:rounded-2xl'
                />
              </div>
            </div>
            <div className='grid'>
              <div className='md:px-8'>{renderSongList()}</div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
