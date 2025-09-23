import { LinkIcon } from '@heroicons/react/24/outline'
import { useSession } from '@repo/api/auth/auth.client'
import { orpc, queryClient } from '@repo/api/lib/orpc.client'
import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { twMerge } from 'tailwind-merge'

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

  const updatePlaylist = useMutation(orpc.playlist.update.mutationOptions())

  const session = useSession()

  const confirmUpdatePlaylist = async () => {
    try {
      await updatePlaylist.mutateAsync({
        playlistId,
        name: newName,
      })

      queryClient.setQueryData(
        orpc.playlist.list.queryKey({
          input: { userId: session.data?.user.id },
        }),
        (data) => {
          if (!data) return undefined
          return {
            ...data,
            userPlaylists: data.map((playlist) =>
              playlist.id === playlistId
                ? { ...playlist, name: newName }
                : playlist
            ),
          }
        }
      )
      queryClient.setQueryData(
        orpc.playlist.get.queryKey({
          input: { playlistId },
        }),
        (data) => {
          if (!data) return undefined
          return {
            ...data,
            playlist: { ...data, name: newName },
          }
        }
      )

      onActionEnd?.()
    } catch {
      void 0
    }
  }

  return (
    <div className='w-96 max-w-full p-8 pb-12 md:w-[calc(100vw/2)] lg:w-[calc(100vw/3)]'>
      <span className='mb-2 block text-sm'>Playlist name</span>
      <div className='flex gap-2'>
        <div className='flex grow items-center rounded-3xl bg-surface-800 px-4 shadow-2xl ring-surface-800/70 focus-within:ring-2'>
          <input
            onChange={(e) => setNewName(e.target.value)}
            className='h-9 w-full border-0 bg-transparent py-2 text-base ring-0 outline-none'
            value={newName}
            placeholder={playlistName}
          />
          <LinkIcon className='size-4' />
        </div>
        <button
          type='button'
          className='h-9 shrink-0 rounded-md bg-neutral-200 px-2 text-center text-sm font-medium text-surface-950 disabled:cursor-default disabled:opacity-80'
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
          'invisible text-sm text-primary-500',
          updatePlaylist.error && 'visible'
        )}
      >
        Error: {updatePlaylist.error?.message}
      </span>
    </div>
  )
}
