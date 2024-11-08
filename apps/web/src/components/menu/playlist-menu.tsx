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
import type { ClientError } from 'graphql-request'
import { head, isEmpty } from 'lodash'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useRouter } from 'next/router'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import { twMerge } from 'tailwind-merge'

import {
  createPlaylistMutation,
  deletePlaylistMutation,
  userPlaylistsQuery,
} from '~/api'
import { useModalStore } from '~/store/use-modal'

import { WavesLoader } from '../loader'
import { EditPlaylistDetailsModal } from '../modals/edit-playlist-details-modal'
import { ImportPlaylistModal } from '../modals/import-playlist-modal'
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

  const isActive = pathname === `/playlist/${playlist.id}`

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
        isOver &&
          'text-primary-500 bg-surface-900 outline-primary-500 outline outline-1'
      )}
      ref={setNodeRef}
    >
      <Link className='grow px-3 py-1' href={`/playlist/${playlist.id}`}>
        <p>{playlist.name}</p>
        <p className='mt-0.5 text-xs text-gray-400'>
          {format(new Date(Number(playlist.createdAt!)), 'MM/dd/yyyy')}
        </p>
      </Link>
      <DynamicDropdown
        direction='right'
        className='ml-auto self-stretch '
        triggerClassName={twMerge(
          'hover:text-primary-500 h-full transition-colors px-3',
          isActive && 'text-primary-500'
        )}
        menuLabel={<EllipsisHorizontalIcon className='h-5 shrink-0' />}
        menuItems={[
          {
            label: 'Edit details',
            icon: <PencilIcon className='mr-2 h-3.5 shrink-0' />,
            onClick: () => {
              openModal({
                content: (
                  <EditPlaylistDetailsModal
                    playlistId={playlist.id}
                    playlistName={playlist.name}
                    onActionEnd={() => {
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
            icon: <LinkIcon className='mr-2 h-3.5 shrink-0' />,
            onClick: () => {
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
            icon: <TrashIcon className='mr-2 h-3.5 shrink-0' />,
            onClick: async () => {
              await deletePlaylist.mutateAsync(playlist.id)
              const updatedPlaylists = await userPlaylists.refetch()

              toast.custom(() => <Toast message='✔ Playlist deleted' />, {
                duration: 3000,
              })

              if (isActive) {
                if (!isEmpty(updatedPlaylists.data?.userPlaylists)) {
                  await router.replace(
                    `/playlist/${head(updatedPlaylists.data?.userPlaylists)?.id}`,
                    undefined,
                    { shallow: true }
                  )
                } else {
                  await router.replace('/', undefined, { shallow: true })
                }
              }
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
        <div className='flex h-full items-center'>
          <p className='text-balance text-center text-sm text-gray-300'>
            Sign in to see your playlists
          </p>
        </div>
      )
    }

    if (userPlaylists.isLoading) {
      return (
        <div className='flex h-full items-center justify-center'>
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
      <div className='flex h-full items-center'>
        <p className='text-balance text-center text-sm text-gray-300'>
          You have no playlists. Create one!
        </p>
      </div>
    )
  }

  return (
    <div className='h-full px-4 py-7'>
      <div className='flex justify-between'>
        <h1 className='text-xl font-semibold text-gray-300'>Your playlists</h1>
        {session.status === 'authenticated' && (
          <DynamicDropdown
            direction='right'
            menuLabel={
              <PlusIcon className='size-6 shrink-0 transition-colors hover:text-primary-500' />
            }
            menuItems={[
              {
                label: 'Create playlist',
                icon: <PlusIcon className='mr-2 h-3.5 shrink-0' />,
                onClick: async () => {
                  await createPlaylistMutation()
                  await userPlaylists.refetch()
                },
              },
              {
                label: 'Import from URL',
                icon: <LinkIcon className='mr-2 h-3.5 shrink-0' />,
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
        )}
      </div>
      {renderPlaylists()}
    </div>
  )
}
