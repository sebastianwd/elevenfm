import { useDroppable } from '@dnd-kit/core'
import {
  EllipsisHorizontalIcon,
  LinkIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline'
import { PlusIcon } from '@heroicons/react/24/solid'
import { useSession } from '@repo/api/auth/auth.client'
import { orpc } from '@repo/api/lib/orpc.client'
import { useMutation, useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { head } from 'es-toolkit'
import { isEmpty } from 'es-toolkit/compat'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useRouter } from 'next/navigation'
import SimpleBar from 'simplebar-react'
import { toast } from 'sonner'
import { twMerge } from 'tailwind-merge'

import { Dropdown } from '~/components/dropdown'
import { useModalStore } from '~/store/use-modal'

import { WavesLoader } from '../loader'
import { EditPlaylistDetailsModal } from '../modals/edit-playlist-details-modal'
import { ImportPlaylistModal } from '../modals/import-playlist-modal'
import { Toast } from '../toast'

interface PlaylistMenuItemProps {
  playlist: {
    id: string
    name: string
    createdAt?: Date | null
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

  const userPlaylists = useQuery(
    orpc.playlist.list.queryOptions({
      input: { userId: session.data?.user.id },
      staleTime: Infinity,
      enabled: false,
    })
  )

  const pathname = usePathname()
  const router = useRouter()

  const isActive = pathname === `/playlist/${playlist.id}`

  const deletePlaylist = useMutation(orpc.playlist.delete.mutationOptions())

  const openModal = useModalStore((state) => state.openModal)
  const closeModal = useModalStore((state) => state.closeModal)

  return (
    <div
      key={playlist.id}
      className={twMerge(
        `flex items-center rounded-lg bg-surface-800 text-left transition-colors`,
        isOver &&
          'border border-solid border-primary-500 bg-surface-900 text-primary-500'
      )}
      ref={setNodeRef}
    >
      <Link
        className='relative grow px-3 py-1'
        href={`/playlist/${playlist.id}`}
      >
        {isActive ? (
          <div className='absolute top-0 left-0 h-full w-1 rounded-l-lg bg-primary-500' />
        ) : null}
        <p>{playlist.name}</p>
        <p className='mt-0.5 text-xs text-gray-400'>
          {format(new Date(Number(playlist.createdAt!)), 'MM/dd/yyyy')}
        </p>
      </Link>
      <Dropdown
        direction='right'
        className='ml-auto self-stretch'
        triggerClassName={twMerge(
          'h-full px-3 transition-colors hover:text-primary-500',
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
              await deletePlaylist.mutateAsync({ playlistId: playlist.id })
              const updatedPlaylists = await userPlaylists.refetch()

              toast.custom(() => <Toast message='✔ Playlist deleted' />, {
                duration: 3000,
              })

              if (isActive) {
                if (!isEmpty(updatedPlaylists.data)) {
                  router.replace(
                    `/playlist/${head(updatedPlaylists.data!)?.id}`
                  )
                } else {
                  router.replace('/')
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

  const userPlaylists = useQuery(
    orpc.playlist.list.queryOptions({
      input: { userId: session.data?.user.id },
      staleTime: Infinity,
      enabled: !!session.data?.user.id,
    })
  )

  const openModal = useModalStore((state) => state.openModal)
  const closeModal = useModalStore((state) => state.closeModal)

  const hasPlaylists = !isEmpty(userPlaylists.data)

  const createPlaylist = useMutation(orpc.playlist.create.mutationOptions())

  const renderPlaylists = () => {
    if (!session.data?.user.id) {
      return (
        <div className='flex h-full items-center'>
          <p className='text-center text-sm text-balance text-gray-300'>
            Sign in to see your playlists
          </p>
        </div>
      )
    }

    if (userPlaylists.isPending) {
      return (
        <div className='flex h-full items-center justify-center'>
          <WavesLoader className='h-5' />
        </div>
      )
    }

    if (hasPlaylists) {
      return (
        <SimpleBar
          className={twMerge(
            `mt-8 h-full overflow-auto [&.simplebar-scrollable-y]:pr-4`
          )}
          classNames={{
            scrollbar: 'bg-primary-500 w-1 rounded',
          }}
        >
          <div className='flex flex-col gap-2'>
            {userPlaylists.data?.map((playlist) => (
              <PlaylistMenuItem key={playlist.id} playlist={playlist} />
            ))}
          </div>
        </SimpleBar>
      )
    }

    return (
      <div className='flex h-full items-center'>
        <p className='text-center text-sm text-balance text-gray-300'>
          You have no playlists. Create one!
        </p>
      </div>
    )
  }

  return (
    <div className='flex h-full flex-col px-4 py-7'>
      <div className='flex justify-between'>
        <h1 className='text-xl font-semibold text-gray-300'>Your playlists</h1>
        {session.data?.user.id && (
          <Dropdown
            direction='right'
            menuLabel={
              <PlusIcon className='size-6 shrink-0 transition-colors hover:text-primary-500' />
            }
            menuItems={[
              {
                label: 'Create playlist',
                icon: <PlusIcon className='mr-2 h-3.5 shrink-0' />,
                onClick: async () => {
                  await createPlaylist.mutateAsync({
                    name: undefined,
                  })
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
