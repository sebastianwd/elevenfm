import { useDroppable } from '@dnd-kit/core'
import {
  EllipsisHorizontalIcon,
  LinkIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline'
import { PlusIcon } from '@heroicons/react/24/solid'
import { useMutation, useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { ClientError } from 'graphql-request'
import { head, isEmpty } from 'lodash'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useRouter } from 'next/router'
import { useSession } from 'next-auth/react'
import React from 'react'
import { toast } from 'sonner'
import { twMerge } from 'tailwind-merge'

import {
  createPlaylistMutation,
  deletePlaylistMutation,
  userPlaylistsQuery,
} from '~/api'
import { useModalStore } from '~/store/use-modal'

import { EditPlaylistDetailsModal } from '../edit-playlist-details-modal'
import { ImportPlaylistModal } from '../import-playlist-modal'
import { WavesLoader } from '../loader'
import { Toast } from '../toast'

const DynamicDropdown = dynamic(() => import('../dropdown'), {
  ssr: false,
})

interface PlaylistMenuItemProps {
  playlist: {
    id: string
    name: string
    createdAt?: string | null
  }
}

export const PlaylistMenuItem = (props: PlaylistMenuItemProps) => {
  const { playlist } = props

  const { isOver, setNodeRef } = useDroppable({
    id: playlist.id,
    data: {
      name: playlist.name,
      id: playlist.id,
    },
  })

  const session = useSession()

  const userPlaylists = useQuery({
    queryKey: ['userPlaylists', session.data?.user?.id],
    queryFn: () => userPlaylistsQuery(),
    enabled: false,
    staleTime: Infinity,
  })

  const pathname = usePathname()
  const router = useRouter()

  const deletePlaylist = useMutation({
    mutationKey: ['deletePlaylist'],
    mutationFn: (playlistId: string) => deletePlaylistMutation({ playlistId }),
    onError: (err: ClientError) => err,
  })

  const openModal = useModalStore((state) => state.openModal)
  const closeModal = useModalStore((state) => state.closeModal)

  return (
    <div
      key={playlist.id}
      className={twMerge(
        `bg-surface-800 rounded-lg text-left flex items-center transition-colors`,
        isOver && 'text-primary-500 bg-surface-900'
      )}
      ref={setNodeRef}
    >
      <Link className='py-1 px-3 grow' href={`/playlist/${playlist.id}`}>
        <p>{playlist.name}</p>
        <p className='text-xs text-gray-400 mt-0.5'>
          {format(new Date(Number(playlist.createdAt!)), 'MM/dd/yyyy')}
        </p>
      </Link>
      <DynamicDropdown
        direction='right'
        className='ml-auto self-stretch'
        triggerClassName='hover:text-primary-500 h-full transition-colors px-3'
        menuLabel={<EllipsisHorizontalIcon className='h-5 shrink-0' />}
        menuItems={[
          {
            label: 'Edit details',
            icon: <PencilIcon className='h-3.5 mr-2 shrink-0' />,
            onClick: () => {
              openModal({
                content: (
                  <EditPlaylistDetailsModal
                    playlistId={playlist.id}
                    playlistName={playlist.name}
                    onActionEnd={async () => {
                      toast.custom(
                        () => <Toast message='✔ Playlist updated' />,
                        { duration: 3000 }
                      )
                      closeModal()
                    }}
                  />
                ),
                title: 'Edit playlist',
              })
            },
          },
          {
            label: 'Import into playlist',
            icon: <LinkIcon className='h-3.5 mr-2 shrink-0' />,
            onClick: async () => {
              openModal({
                content: (
                  <ImportPlaylistModal
                    playlistId={playlist.id}
                    onImportEnd={() => {
                      toast.custom(
                        () => <Toast message='✔ Playlist imported' />,
                        { duration: 3000 }
                      )
                      closeModal()
                    }}
                  />
                ),
                title: `Import into ${playlist.name}`,
              })
            },
          },
          {
            label: 'Delete',
            icon: <TrashIcon className='h-3.5 mr-2 shrink-0' />,
            onClick: async () => {
              await deletePlaylist.mutateAsync(playlist.id)
              const updatedPlaylists = await userPlaylists.refetch()

              if (pathname === `/playlist/${playlist.id}`) {
                if (!isEmpty(updatedPlaylists.data?.userPlaylists)) {
                  router.replace(
                    `/playlist/${head(updatedPlaylists.data?.userPlaylists)?.id}`,
                    undefined,
                    { shallow: true }
                  )
                } else {
                  router.replace('/', undefined, { shallow: true })
                }
              }

              toast.custom(() => <Toast message='✔ Playlist deleted' />, {
                duration: 3000,
              })
            },
          },
        ]}
      />
    </div>
  )
}

export const PlaylistMenu = () => {
  const session = useSession()

  const userPlaylists = useQuery({
    queryKey: ['userPlaylists', session.data?.user?.id],
    queryFn: () => userPlaylistsQuery(),
    enabled: !!session.data?.user?.id,
    staleTime: Infinity,
  })

  const openModal = useModalStore((state) => state.openModal)
  const closeModal = useModalStore((state) => state.closeModal)

  const hasPlaylists = !isEmpty(userPlaylists.data?.userPlaylists)

  const renderPlaylists = () => {
    if (session.status !== 'authenticated') {
      return (
        <div className='flex items-center h-full'>
          <p className='text-sm text-gray-300 text-balance text-center'>
            Sign in to see your playlists
          </p>
        </div>
      )
    }

    if (userPlaylists.isLoading) {
      return (
        <div className='flex items-center justify-center h-full'>
          <WavesLoader className='h-5' />
        </div>
      )
    }

    if (hasPlaylists) {
      return (
        <div className='mt-12 flex flex-col gap-2'>
          {userPlaylists.data?.userPlaylists.map((playlist) => (
            <PlaylistMenuItem key={playlist.id} playlist={playlist} />
          ))}
        </div>
      )
    }

    return (
      <div className='flex items-center h-full'>
        <p className='text-sm text-gray-300 text-balance text-center'>
          You have no playlists. Create one!
        </p>
      </div>
    )
  }

  return (
    <div className='px-4 py-7 h-full'>
      <div className='flex justify-between'>
        <h1 className='text-gray-300 font-semibold text-xl'>Your playlists</h1>
        <DynamicDropdown
          direction='right'
          menuLabel={
            <PlusIcon className='size-6 shrink-0 hover:text-primary-500 transition-colors' />
          }
          menuItems={[
            {
              label: 'Create playlist',
              icon: <PlusIcon className='h-3.5 mr-2 shrink-0' />,
              onClick: async () => {
                await createPlaylistMutation()
                await userPlaylists.refetch()
              },
            },
            {
              label: 'Import from URL',
              icon: <LinkIcon className='h-3.5 mr-2 shrink-0' />,
              onClick: () => {
                openModal({
                  content: (
                    <ImportPlaylistModal
                      onImportEnd={() => {
                        toast.custom(
                          () => <Toast message='✔ Playlist imported' />,
                          { duration: 3000 }
                        )
                        closeModal()
                      }}
                    />
                  ),
                  title: 'Import playlist',
                })
              },
            },
          ]}
        />
      </div>
      {renderPlaylists()}
    </div>
  )
}
