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
import { UploadMp3Modal } from '~/components/modals/upload-mp3-modal'
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

  const {
    data: playlist,
    refetch: refetchPlaylist,
    isPending: isPlaylistPending,
    isError: isPlaylistError,
    error: playlistError,
  } = useQuery(
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
      setCurrentPlaylist(playlist?.songs?.toSorted(sortByLexoRankAsc) ?? [])
    } else {
      setCurrentPlaylist(
        orderBy(
          playlist?.songs ?? [],
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
    playlist?.songs,
    setCurrentPlaylist,
    sortingSettings?.direction,
    sortingSettings?.sortBy,
  ])

  const openModal = useModalStore((state) => state.openModal)
  const closeModal = useModalStore((state) => state.closeModal)

  const isRadio = playlist?.type === playlistType.RADIO

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
      title: `Import playlist to ${playlist?.name}`,
    })
  }, [openModal, closeModal, playlistId, playlist?.name])

  const onUploadMp3 = useCallback(() => {
    openModal({
      content: (
        <UploadMp3Modal
          playlistId={playlistId}
          onUploadEnd={() => {
            closeModal()
            void refetchPlaylist()
          }}
        />
      ),
      title: `Add Song to ${playlist?.name}`,
    })
  }, [openModal, playlistId, refetchPlaylist, closeModal, playlist?.name])

  const renderSongList = () => {
    if (isPlaylistError) {
      return (
        <div className='mt-[10%] flex justify-center'>
          <p>{playlistError.message || 'Something went wrong'} </p>
        </div>
      )
    }

    return (
      <SongList
        isEditable={
          playlist?.type === playlistType.PLAYLIST &&
          !!playlist.user.id &&
          playlist.user.id === session.data?.user.id
        }
        onImportFromUrl={onImportFromUrl}
        onUploadMp3={onUploadMp3}
        identifier={playlistId}
        songs={currentPlaylist}
        showArtist
        isLoading={isPlaylistPending}
        emptyMessage='This playlist is empty'
      />
    )
  }

  const playlistUser = playlist?.user.name

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
                      isPlaylistPending
                        ? ''
                        : `${
                            isRadio
                              ? `Made for 👤${playlistUser}`
                              : playlistUser
                          } - ${playlist?.songs?.length} songs`
                    }
                    title={playlist?.name ?? ''}
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
