import { LinkIcon } from '@heroicons/react/24/outline'
import { useMutation } from '@tanstack/react-query'
import { type ClientError } from 'graphql-request'
import { useSession } from 'next-auth/react'
import { useState } from 'react'
import { twMerge } from 'tailwind-merge'

import { importPlaylistMutation, queryClient } from '~/api'
import { getError } from '~/utils/get-error'

interface ImportPlaylistModalProps {
  playlistId?: string
  onImportEnd?: () => void
}

export const ImportPlaylistModal = (props: ImportPlaylistModalProps) => {
  const { playlistId, onImportEnd } = props
  const [importUrl, setImportUrl] = useState('')

  const importPlaylist = useMutation({
    mutationKey: ['importPlaylist'],
    mutationFn: () =>
      importPlaylistMutation({
        url: importUrl,
        playlistId: playlistId || null,
      }),
    onError: (err: ClientError) => err,
  })

  const session = useSession()

  const importFromUrl = async () => {
    try {
      if (!importUrl) {
        return
      }
      await importPlaylist.mutateAsync()

      await queryClient.invalidateQueries({
        queryKey: ['userPlaylists', session.data?.user?.id],
      })

      if (playlistId) {
        await queryClient.invalidateQueries({
          queryKey: ['userPlaylist', playlistId],
        })
      }

      onImportEnd?.()
    } catch {
      void 0
    }
  }

  return (
    <div className='w-96 md:w-[calc(100vw/2)] lg:w-[calc(100vw/3)] max-w-full p-8 pb-12'>
      <span className='text-sm mb-2 block'>
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
        <div className='flex items-center rounded-3xl bg-surface-800 px-4 shadow-2xl ring-surface-800/70 focus-within:ring-2 grow'>
          <input
            onChange={(e) => setImportUrl(e.target.value)}
            className='text-md border-0 bg-transparent w-full h-9 py-2 outline-none ring-0'
            value={importUrl}
            placeholder='https://open.spotify.com/playlist/...'
          />
          <LinkIcon className='h-4 w-4' />
        </div>
        <button
          className='h-9 text-center px-2 text-surface-950 bg-neutral-200 text-sm rounded-md shrink-0 font-medium disabled:opacity-80 disabled:cursor-default'
          disabled={importPlaylist.isPending || !importUrl}
          onClick={importFromUrl}
        >
          Import
        </button>
      </div>

      <span
        className={twMerge(
          'text-primary-500 text-sm invisible',
          importPlaylist.error && 'visible'
        )}
      >
        Error: {getError(importPlaylist.error)}
      </span>
    </div>
  )
}
