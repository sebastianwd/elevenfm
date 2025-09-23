import { LinkIcon } from '@heroicons/react/24/outline'
import { useSession } from '@repo/api/auth/auth.client'
import { orpc, queryClient } from '@repo/api/lib/orpc.client'
import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { twMerge } from 'tailwind-merge'

interface ImportPlaylistModalProps {
  playlistId?: string
  onImportEnd?: () => void
}

export const ImportPlaylistModal = (props: ImportPlaylistModalProps) => {
  const { playlistId, onImportEnd } = props
  const [importUrl, setImportUrl] = useState('')

  const importPlaylist = useMutation(orpc.playlist.import.mutationOptions())

  const session = useSession()

  const importFromUrl = async () => {
    try {
      if (!importUrl) {
        return
      }
      await importPlaylist.mutateAsync({
        url: importUrl,
        playlistId,
      })

      await queryClient.invalidateQueries({
        queryKey: orpc.playlist.list.queryKey({
          input: { userId: session.data?.user.id },
        }),
      })

      if (playlistId) {
        await queryClient.invalidateQueries({
          queryKey: orpc.playlist.get.queryKey({
            input: { playlistId },
          }),
        })
      }

      onImportEnd?.()
    } catch {
      void 0
    }
  }

  return (
    <div className='w-96 max-w-full p-8 pb-12 md:w-[calc(100vw/2)] lg:w-[calc(100vw/3)]'>
      <span className='mb-2 block text-sm'>
        Formats accepted:
        <ul className='list-disc pl-4 text-xs text-neutral-400'>
          <li>https://open.spotify.com/playlist/...</li>
          <li>https://open.spotify.com/track/...</li>
          <li>https://www.youtube.com/playlist?list=...</li>
          <li>https://www.youtube.com/watch?v=...</li>
          <li>
            https://soundcloud.com/...<span> (single track URL only)</span>
          </li>
        </ul>
      </span>
      <div className='flex gap-2'>
        <div className='flex grow items-center rounded-3xl bg-surface-800 px-4 shadow-2xl ring-surface-800/70 focus-within:ring-2'>
          <input
            onChange={(e) => setImportUrl(e.target.value)}
            className='h-9 w-full border-0 bg-transparent py-2 text-base ring-0 outline-none'
            value={importUrl}
            placeholder='https://open.spotify.com/playlist/...'
          />
          <LinkIcon className='size-4' />
        </div>
        <button
          type='button'
          className='h-9 shrink-0 rounded-md bg-neutral-200 px-2 text-center text-sm font-medium text-surface-950 disabled:cursor-default disabled:opacity-80'
          disabled={importPlaylist.isPending || !importUrl}
          onClick={importFromUrl}
        >
          Import
        </button>
      </div>

      <span
        className={twMerge(
          'invisible text-sm text-primary-500',
          importPlaylist.error && 'visible'
        )}
      >
        Error: {importPlaylist.error?.message}
      </span>
    </div>
  )
}
