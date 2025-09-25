import { useSession } from '@repo/api/auth/auth.client'
import { orpc, queryClient } from '@repo/api/lib/orpc.client'
import { Button } from '@repo/ui/components/button'
import { useMutation, useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import SimpleBar from 'simplebar-react'
import { twMerge } from 'tailwind-merge'

import type { PlayableSong } from '~/types'

interface AddToPlaylistModalProps {
  song: PlayableSong
  onActionEnd?: (data: { playlistName: string; playlistId: string }) => void
}

export const AddToPlaylistModal = (props: AddToPlaylistModalProps) => {
  const { onActionEnd, song } = props

  const session = useSession()

  const userPlaylists = useQuery(
    orpc.playlist.list.queryOptions({
      input: { userId: session.data?.user.id },
      staleTime: Infinity,
      enabled: !!session.data?.user.id,
    })
  )

  const addToPlaylist = useMutation(orpc.playlist.addSong.mutationOptions())

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
        songIds: song.id ? [song.id] : undefined,
        songs: song.id
          ? undefined
          : [
              {
                album: '',
                artist: song.artist,
                title: song.title,
                url: song.songUrl || undefined,
              },
            ],
      })

      await queryClient.invalidateQueries({
        queryKey: orpc.playlist.list.queryKey({
          input: { userId: session.data?.user.id },
        }),
      })

      onActionEnd?.({ playlistName, playlistId })
    } catch {
      void 0
    }
  }

  return (
    <div className='w-96 max-w-full p-8'>
      <div className='flex flex-col gap-2'>
        <p className='mb-2 text-center text-base'>
          {song.artist} - {song.title}
        </p>
        <p className='text-sm text-neutral-400'>
          Click on a playlist to add the song
        </p>
        <SimpleBar
          className='-mx-3 max-h-[50svh] overflow-y-auto px-3'
          classNames={{
            contentEl: 'flex flex-col gap-2',
            scrollbar: 'bg-primary-500 w-1 rounded',
          }}
        >
          {userPlaylists.data?.map((playlist) => (
            <Button
              key={playlist.id}
              onClick={() =>
                confirmAddToPlaylist({
                  playlistId: playlist.id,
                  playlistName: playlist.name,
                })
              }
              className='flex w-full grow flex-col gap-1 rounded-lg bg-surface-800 px-3 py-1 text-left transition-colors'
              variant='ghost'
            >
              <p className='text-base'>{playlist.name}</p>
              <p className='mt-0.5 text-xs text-gray-400'>
                {format(new Date(Number(playlist.createdAt)), 'MM/dd/yyyy')}
              </p>
            </Button>
          ))}
        </SimpleBar>
      </div>
      <span
        className={twMerge(
          'invisible text-sm text-primary-500',
          addToPlaylist.error && 'visible'
        )}
      >
        Error: {addToPlaylist.error?.message}
      </span>
    </div>
  )
}
