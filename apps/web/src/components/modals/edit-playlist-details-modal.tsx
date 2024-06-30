import { LinkIcon } from '@heroicons/react/24/outline'
import { useMutation } from '@tanstack/react-query'
import { PlaylistQueryQuery, UserPlaylistsQueryQuery } from 'elevenfm-shared'
import { type ClientError } from 'graphql-request'
import { useSession } from 'next-auth/react'
import { useState } from 'react'
import { twMerge } from 'tailwind-merge'

import { queryClient, updatePlaylistMutation } from '~/api'
import { getError } from '~/utils/get-error'

interface EditPlaylistDetailsModalProps {
  playlistId: string
  playlistName: string
  onActionEnd?: () => void
}

export const EditPlaylistDetailsModal = (
  props: EditPlaylistDetailsModalProps
) => {
  const { playlistId, onActionEnd, playlistName } = props
  const [newName, setNewName] = useState(playlistName)

  const updatePlaylist = useMutation({
    mutationKey: ['updatePlaylist'],
    mutationFn: () =>
      updatePlaylistMutation({
        name: newName,
        playlistId,
      }),
    onError: (err: ClientError) => err,
  })

  const session = useSession()

  const confirmUpdatePlaylist = async () => {
    try {
      await updatePlaylist.mutateAsync()

      await queryClient.setQueryData<UserPlaylistsQueryQuery>(
        ['userPlaylists', session.data?.user?.id],
        (data) => {
          if (!data) return undefined
          return {
            ...data,
            userPlaylists: data.userPlaylists.map((playlist) =>
              playlist.id === playlistId
                ? { ...playlist, name: newName }
                : playlist
            ),
          }
        }
      )
      await queryClient.setQueryData<PlaylistQueryQuery>(
        ['userPlaylist', playlistId],
        (data) => {
          if (!data) return undefined
          return {
            ...data,
            playlist: { ...data.playlist, name: newName },
          }
        }
      )

      onActionEnd?.()
    } catch {
      void 0
    }
  }

  return (
    <div className='w-96 md:w-[calc(100vw/2)] lg:w-[calc(100vw/3)] max-w-full p-8 pb-12'>
      <span className='text-sm mb-2 block'>Playlist name</span>
      <div className='flex gap-2'>
        <div className='flex items-center rounded-3xl bg-surface-800 px-4 shadow-2xl ring-surface-800/70 focus-within:ring-2 grow'>
          <input
            onChange={(e) => setNewName(e.target.value)}
            className='text-md border-0 bg-transparent w-full h-9 py-2 outline-none ring-0'
            value={newName}
            placeholder={playlistName}
          />
          <LinkIcon className='h-4 w-4' />
        </div>
        <button
          className='h-9 text-center px-2 text-surface-950 bg-neutral-200 text-sm rounded-md shrink-0 font-medium disabled:opacity-80 disabled:cursor-default'
          disabled={
            updatePlaylist.isPending || !newName || newName === playlistName
          }
          onClick={confirmUpdatePlaylist}
        >
          Save
        </button>
      </div>

      <span
        className={twMerge(
          'text-primary-500 text-sm invisible',
          updatePlaylist.error && 'visible'
        )}
      >
        Error: {getError(updatePlaylist.error)}
      </span>
    </div>
  )
}
