import { useMutation, useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { type ClientError } from 'graphql-request'
import { useSession } from 'next-auth/react'
import SimpleBar from 'simplebar-react'
import { twMerge } from 'tailwind-merge'

import { addToPlaylistMutation, queryClient, userPlaylistsQuery } from '~/api'
import { PlayableSong } from '~/types'
import { getError } from '~/utils/get-error'

import { Button } from '../button'

interface AddToPlaylistModalProps {
  song: PlayableSong
  onActionEnd?: (data: { playlistName: string; playlistId: string }) => void
}

export const AddToPlaylistModal = (props: AddToPlaylistModalProps) => {
  const { onActionEnd, song } = props

  const session = useSession()

  const userPlaylists = useQuery({
    queryKey: ['userPlaylists', session.data?.user?.id],
    queryFn: () => userPlaylistsQuery(),
    enabled: !!session.data?.user?.id,
    staleTime: Infinity,
  })

  const addToPlaylist = useMutation({
    mutationKey: ['addToPlaylist'],
    mutationFn: addToPlaylistMutation,
    onError: (err: ClientError) => err,
  })

  const confirmAddToPlaylist = async ({
    playlistId,
    playlistName,
  }: {
    playlistId: string
    playlistName: string
  }) => {
    try {
      await addToPlaylist.mutateAsync({
        playlistId: playlistId,
        songIds: song.id ? [song.id] : null,
        songs: song.id
          ? null
          : [
              {
                album: '',
                artist: song.artist,
                title: song.title,
                songUrl: song.songUrl || null,
              },
            ],
      })

      await queryClient.invalidateQueries({
        queryKey: ['userPlaylist', playlistId],
      })

      onActionEnd?.({ playlistName, playlistId })
    } catch {
      void 0
    }
  }

  return (
    <div className='w-96 max-w-full p-8'>
      <div className='gap-2 flex flex-col'>
        <p className='text-base text-center mb-2'>
          {song.artist} - {song.title}
        </p>
        <p className='text-sm text-neutral-400'>
          Click on a playlist to add the song
        </p>
        <SimpleBar
          className='max-h-[50svh] overflow-y-auto px-3 -mx-3'
          classNames={{
            contentEl: 'flex flex-col gap-2',
            scrollbar: 'bg-primary-500 w-1 rounded',
          }}
        >
          {userPlaylists.data?.userPlaylists.map((playlist) => (
            <Button
              key={playlist.id}
              onClick={() =>
                confirmAddToPlaylist({
                  playlistId: playlist.id,
                  playlistName: playlist.name,
                })
              }
              className='py-1 px-3 grow bg-surface-800 rounded-lg text-left  transition-colors flex flex-col w-full gap-1'
              variant='ghost'
            >
              <p className='text-base'>{playlist.name}</p>
              <p className='text-xs text-gray-400 mt-0.5'>
                {format(new Date(Number(playlist.createdAt!)), 'MM/dd/yyyy')}
              </p>
            </Button>
          ))}
        </SimpleBar>
      </div>
      <span
        className={twMerge(
          'text-primary-500 text-sm invisible',
          addToPlaylist.error && 'visible'
        )}
      >
        Error: {getError(addToPlaylist.error)}
      </span>
    </div>
  )
}
