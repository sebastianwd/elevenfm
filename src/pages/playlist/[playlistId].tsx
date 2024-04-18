import { XMarkIcon } from '@heroicons/react/24/outline'
import { useMutation, useQuery } from '@tanstack/react-query'
import { isEmpty } from 'lodash'
import { NextPage } from 'next'
import { useParams } from 'next/navigation'
import { toast } from 'sonner'

import { playlistQuery, removeFromPlaylistMutation } from '~/api'
import { ArtistHeader } from '~/components/artist-header'
import { WavesLoader } from '~/components/loader'
import { SongList } from '~/components/song-list'
import { Toast } from '~/components/toast'
import { VideoPlayerPortalContainer } from '~/components/video-player'

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
          <p>Something went wrong</p>
        </div>
      )
    }

    if (isEmpty(playlist.data?.playlist.songs)) {
      return (
        <div className='flex justify-center mt-[10%]'>
          <p className='text-gray-300'>This playlist is empty</p>
        </div>
      )
    }

    return (
      <SongList
        menuOptions={(song) => [
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
        ]}
        songs={playlist.data?.playlist.songs || []}
        showArtist
      />
    )
  }

  return (
    <div className='container mx-auto w-full max-w-[1920px] flex flex-col min-h-full'>
      <div className='grid lg:grid-cols-3'>
        <header className='bg-gradient-blend-primary relative col-span-2 flex h-80 w-auto flex-col bg-no-repeat bg-top'>
          <div className='z-10 mt-auto flex w-full items-center gap-7 px-8 mb-16 flex-col md:flex-row'>
            <ArtistHeader
              subtitle={playlist.data?.playlist?.user?.name ?? ''}
              title={playlist.data?.playlist?.name ?? ''}
              externalUrls={{}}
            />
          </div>
        </header>
        <div className='flex justify-center col-span-2 lg:col-span-1'>
          <VideoPlayerPortalContainer
            position='playlist-page'
            className='aspect-video max-w-full'
          />
        </div>
      </div>
      <div className='grid lg:grid-cols-3'>
        <div className='md:pl-8 lg:col-span-2'>{renderSongList()}</div>
      </div>
    </div>
  )
}

export default PlaylistPage
