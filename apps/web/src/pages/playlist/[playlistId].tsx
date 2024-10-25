import { useQuery } from '@tanstack/react-query'
import { ClientError } from 'graphql-request'
import { isEmpty, orderBy } from 'lodash'
import { NextPage } from 'next'
import { useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import React, { useCallback, useEffect } from 'react'
import { toast } from 'sonner'
import { useShallow } from 'zustand/react/shallow'

import { playlistQuery } from '~/api'
import { ArtistHeader } from '~/components/artist-header'
import { WavesLoader } from '~/components/loader'
import { ImportPlaylistModal } from '~/components/modals/import-playlist-modal'
import { Seo } from '~/components/seo'
import { SongList } from '~/components/song-list'
import { TheaterMode } from '~/components/theater-mode'
import { Toast } from '~/components/toast'
import { VideoPlayerPortalContainer } from '~/components/video-player'
import { playlistType } from '~/constants'
import { useLayoutState } from '~/store/use-layout-state'
import { useLocalSettings } from '~/store/use-local-settings'
import { useModalStore } from '~/store/use-modal'
import { getError } from '~/utils/get-error'
import { sortByLexoRankAsc } from '~/utils/lexorank'

const PlaylistPage: NextPage = () => {
  const params = useParams<{ playlistId: string }>()

  const session = useSession()

  const playlist = useQuery({
    queryKey: ['userPlaylist', params?.playlistId],
    queryFn: () => playlistQuery({ playlistId: params?.playlistId ?? '' }),
    staleTime: Infinity,
    enabled: !!params?.playlistId,
  })

  // need a separate state for instant playlist update when reordering
  const { setCurrentPlaylist, currentPlaylist } = useLayoutState((state) => ({
    setCurrentPlaylist: state.setCurrentPlaylist,
    currentPlaylist: state.currentPlaylist,
  }))

  const { sortedPlaylists } = useLocalSettings(
    useShallow((state) => ({
      sortedPlaylists: state.sortedPlaylists,
    }))
  )
  const sortingSettings = sortedPlaylists.find(
    (playlist) => playlist.identifier === params?.playlistId
  )

  useEffect(() => {
    if (sortingSettings?.sortBy === 'custom' || !sortingSettings?.sortBy) {
      setCurrentPlaylist(
        playlist.data?.playlist.songs?.toSorted(sortByLexoRankAsc) ?? []
      )
    } else {
      setCurrentPlaylist(
        orderBy(
          playlist.data?.playlist.songs,
          [
            sortingSettings?.sortBy === 'dateAdded'
              ? 'createdAt'
              : sortingSettings?.sortBy,
          ],
          [sortingSettings?.direction || 'desc']
        )
      )
    }
  }, [
    playlist.data?.playlist.songs,
    setCurrentPlaylist,
    sortingSettings?.direction,
    sortingSettings?.sortBy,
  ])

  const openModal = useModalStore((state) => state.openModal)
  const closeModal = useModalStore((state) => state.closeModal)

  const isRadio = playlist.data?.playlist.type === playlistType.RADIO

  const onImportFromUrl = useCallback(() => {
    openModal({
      content: (
        <ImportPlaylistModal
          playlistId={params?.playlistId ?? ''}
          onImportEnd={() => {
            toast.custom(() => <Toast message='✔ Playlist imported' />, {
              duration: 3000,
            })
            closeModal()
          }}
        />
      ),
      title: `Import playlist to ${playlist.data?.playlist.name}`,
    })
  }, [openModal, closeModal, params?.playlistId, playlist.data?.playlist?.name])

  const renderSongList = () => {
    if (playlist.isPending) {
      return (
        <div className='flex justify-center mt-[10%]'>
          <WavesLoader className='h-5' />
        </div>
      )
    }

    if (playlist.isError) {
      return (
        <div className='flex justify-center mt-[10%]'>
          <p>
            {getError(playlist.error as ClientError) || 'Something went wrong'}{' '}
          </p>
        </div>
      )
    }

    if (isEmpty(currentPlaylist)) {
      return (
        <div className='flex justify-center mt-[10%]'>
          <p className='text-neutral-300'>This playlist is empty</p>
        </div>
      )
    }

    return (
      <SongList
        isEditable={
          playlist.data.playlist.type === playlistType.PLAYLIST &&
          !!playlist.data.playlist.user?.id &&
          playlist.data.playlist.user.id === session.data?.user.id
        }
        onImportFromUrl={onImportFromUrl}
        identifier={params?.playlistId ?? ''}
        songs={currentPlaylist}
        showArtist
      />
    )
  }

  const playlistUser = playlist.data?.playlist?.user?.name

  const { theaterMode } = useLayoutState()

  return (
    <div className='container mx-auto w-full max-w-[1920px] flex flex-col min-h-full'>
      <Seo />
      {theaterMode ? (
        <TheaterMode />
      ) : (
        <>
          <div className='grid lg:grid-cols-3 relative bg-gradient-blend-primary bg-no-repeat bg-top'>
            <header className='col-span-2 flex h-48 md:h-72'>
              <div className='z-10 mt-auto flex w-full items-center gap-7 px-8 mb-16 flex-col md:flex-row'>
                <ArtistHeader
                  subtitle={
                    playlist.isPending
                      ? ''
                      : `${
                          isRadio ? `Made for 👤${playlistUser}` : playlistUser
                        } - ${playlist.data?.playlist?.songs?.length} songs`
                  }
                  title={playlist.data?.playlist?.name ?? ''}
                  externalUrls={{}}
                />
              </div>
            </header>
            <div className='flex justify-center lg:justify-end col-span-2 lg:col-span-1 z-10'>
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
  )
}

export default PlaylistPage
