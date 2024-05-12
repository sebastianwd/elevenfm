import { XMarkIcon } from '@heroicons/react/24/outline'
import { useMutation, useQuery } from '@tanstack/react-query'
import { ClientError } from 'graphql-request'
import { isEmpty } from 'lodash'
import { NextPage } from 'next'
import { useParams } from 'next/navigation'
import { toast } from 'sonner'

import { playlistQuery, removeFromPlaylistMutation } from '~/api'
import { ArtistHeader } from '~/components/artist-header'
import { ImportPlaylistModal } from '~/components/import-playlist-modal'
import { WavesLoader } from '~/components/loader'
import { SongList } from '~/components/song-list'
import { Toast } from '~/components/toast'
import { VideoPlayerPortalContainer } from '~/components/video-player'
import { playlistType } from '~/constants'
import { useModalStore } from '~/store/use-modal'
import { getError } from '~/utils/get-error'

const PlaylistPage: NextPage = () => {
  const params = useParams<{ playlistId: string }>()

  const playlist = useQuery({
    queryKey: ['userPlaylist', params?.playlistId],
    queryFn: () => playlistQuery({ playlistId: params?.playlistId ?? '' }),
    staleTime: Infinity,
    enabled: !!params?.playlistId,
  })

  const removeFromPlaylist = useMutation({
    mutationKey: ['removeFromPlaylist', params?.playlistId],
    mutationFn: ({
      playlistId,
      songId,
    }: {
      playlistId: string
      songId: string
    }) =>
      removeFromPlaylistMutation({
        playlistId: playlistId,
        songId: songId,
      }),
  })

  const openModal = useModalStore((state) => state.openModal)
  const closeModal = useModalStore((state) => state.closeModal)

  const isRadio = playlist.data?.playlist.type === playlistType.RADIO

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

    if (isEmpty(playlist.data?.playlist.songs)) {
      return (
        <div className='flex justify-center mt-[10%]'>
          <p className='text-neutral-300'>This playlist is empty</p>
        </div>
      )
    }

    return (
      <SongList
        isRadio={playlist.data.playlist.type === playlistType.RADIO}
        onImportFromUrl={() => {
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
        }}
        identifier={params?.playlistId ?? ''}
        menuOptions={
          playlist.data.playlist.type === playlistType.RADIO
            ? undefined
            : (song) => [
                {
                  label: 'Remove from playlist',
                  icon: <XMarkIcon className='h-5 mr-2 shrink-0' />,
                  onClick: async () => {
                    await removeFromPlaylist.mutateAsync({
                      playlistId: params?.playlistId ?? '',
                      songId: song.id ?? '',
                    })
                    toast.custom(
                      () => <Toast message='✔ Song removed from playlist' />,
                      { duration: 2000 }
                    )
                    await playlist.refetch()
                  },
                },
              ]
        }
        songs={playlist.data?.playlist.songs || []}
        showArtist
      />
    )
  }

  return (
    <div className='container mx-auto w-full max-w-[1920px] flex flex-col min-h-full'>
      <div className='grid lg:grid-cols-3 relative bg-gradient-blend-primary bg-no-repeat bg-top'>
        <header className='col-span-2 flex h-72'>
          <div className='z-10 mt-auto flex w-full items-center gap-7 px-8 mb-16 flex-col md:flex-row'>
            <ArtistHeader
              subtitle={`${
                isRadio
                  ? `Made for 👤${playlist.data?.playlist?.user?.name}`
                  : playlist.data?.playlist?.user?.name
              } - ${playlist.data?.playlist?.songs?.length} songs`}
              title={playlist.data?.playlist?.name ?? ''}
              externalUrls={{}}
            />
          </div>
        </header>
        <div className='flex justify-end col-span-2 lg:col-span-1 z-10'>
          <VideoPlayerPortalContainer
            position='playlist-page'
            className='aspect-video max-w-full [&_iframe]:rounded-2xl'
          />
        </div>
      </div>
      <div className='grid'>
        <div className='md:px-8'>{renderSongList()}</div>
      </div>
    </div>
  )
}

export default PlaylistPage
