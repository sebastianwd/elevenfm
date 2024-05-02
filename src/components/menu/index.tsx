import {
  EllipsisHorizontalIcon,
  LinkIcon,
  MusicalNoteIcon,
  PlusIcon,
  UserIcon,
} from '@heroicons/react/24/outline'
import { HomeIcon, MagnifyingGlassIcon } from '@heroicons/react/24/solid'
import { useMutation, useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { AnimatePresence, motion, Variants } from 'framer-motion'
import { ClientError } from 'graphql-request'
import { head, isEmpty } from 'lodash'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useRouter } from 'next/router'
import { signOut, useSession } from 'next-auth/react'
import React from 'react'
import { toast } from 'sonner'
import { twMerge } from 'tailwind-merge'

import {
  createPlaylistMutation,
  deletePlaylistMutation,
  userPlaylistsQuery,
} from '~/api'
import { useGlobalSearchStore } from '~/store/use-global-search'
import { useLayoutState } from '~/store/use-layout-state'
import { useModalStore } from '~/store/use-modal'

import { AuthModal } from '../auth/auth-modal'
import { EditPlaylistDetailsModal } from '../edit-playlist-details-modal'
import { ImportPlaylistModal } from '../import-playlist-modal'
import { WavesLoader } from '../loader'
import { Toast } from '../toast'

interface MenuItemProps {
  children: React.ReactNode
  icon: JSX.Element
  href?: string
  onClick?: () => void
  className?: string
  active?: boolean
}

const MenuItem = ({
  children,
  icon,
  href,
  onClick,
  className,
  active,
}: MenuItemProps) => {
  const router = useRouter()

  const activeClassname =
    active ?? router.pathname === href
      ? `stroke-primary-500 text-primary-500`
      : ''

  const Wrapper = href ? Link : 'button'

  return (
    <li
      className={twMerge(
        `group py-2 hover:bg-dark-700 rounded-3xl transition-colors duration-300`,
        (active ?? router.pathname === href) && 'bg-dark-600',
        className
      )}
    >
      <Wrapper
        href={href || '#'}
        className='block truncate md:w-full md:px-8 md:py-3'
        onClick={onClick}
      >
        <span className='flex md:flex-col md:items-center'>
          {React.cloneElement<HTMLElement>(icon, {
            className: `w-7 md:mx-2 mx-4 inline ${activeClassname}`,
          })}
          <span className={`hidden text-sm md:inline ${activeClassname}`}>
            {children}
          </span>
        </span>
      </Wrapper>
    </li>
  )
}

const DynamicDropdown = dynamic(() => import('../dropdown'), {
  ssr: false,
})

const UserPlaylists = () => {
  const session = useSession()

  const userPlaylists = useQuery({
    queryKey: ['userPlaylists', session.data?.user?.id],
    queryFn: () => userPlaylistsQuery(),
    enabled: !!session.data?.user?.id,
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
            <div
              key={playlist.id}
              className='bg-dark-500 rounded-xl text-left flex items-center'
            >
              <Link
                className='py-1 px-3 grow'
                href={`/playlist/${playlist.id}`}
              >
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

                      toast.custom(
                        () => <Toast message='✔ Playlist deleted' />,
                        { duration: 3000 }
                      )
                    },
                  },
                ]}
              />
            </div>
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
              icon: <PlusIcon className='h-5 mr-2 shrink-0' />,
              onClick: async () => {
                await createPlaylistMutation()
                await userPlaylists.refetch()
              },
            },
            {
              label: 'Import from URL',
              icon: <LinkIcon className='h-5 mr-2 shrink-0' />,
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
      {/*       {importPlaylist.data?.importPlaylist.songs?.map((song) => (
        <div key={song.title}>
          {song.title} - {song.artist}
        </div>
      ))} */}
      {renderPlaylists()}
    </div>
  )
}

const navAnim: Variants = {
  hidden: {
    x: '-100%',
    opacity: 0,
  },
  show: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.2,
    },
  },
}

export const Menu = () => {
  const setIsOpen = useGlobalSearchStore((state) => state.setIsOpen)
  const openModal = useModalStore((state) => state.openModal)
  const closeModal = useModalStore((state) => state.closeModal)
  const theaterMode = useLayoutState((state) => state.theaterMode)

  const [isPlaylistMenuOpen, setIsPlaylistMenuOpen] = React.useState(false)

  const session = useSession()

  if (theaterMode) {
    return null
  }

  return (
    <>
      <div className='flex-shrink-0 md:w-36'></div>
      <AnimatePresence>
        {isPlaylistMenuOpen && (
          <motion.div
            className='xl:block hidden'
            initial='hidden'
            exit='hidden'
            animate='show'
            variants={{
              hidden: {
                marginRight: 0,
                opacity: 0,
              },
              show: {
                opacity: 1,
                marginRight: '16rem',
                transition: {
                  duration: 0.2,
                },
              },
            }}
          />
        )}
      </AnimatePresence>
      <div className='sticky top-0 h-full w-full px-4 md:fixed md:w-36 md:px-0 z-40 md:z-20'>
        <div className='sticky top-0 flex h-full flex-grow rounded-[40px] bg-dark-800 p-4 md:px-0 md:pb-24'>
          <div className='flex relative w-full'>
            <ul className='flex overflow-hidden md:flex-col md:py-10 md:gap-4 w-full items-center z-10 bg-dark-800'>
              <MenuItem href='/' icon={<HomeIcon />}>
                Home
              </MenuItem>
              <MenuItem
                onClick={() => setIsOpen(true)}
                icon={<MagnifyingGlassIcon />}
              >
                Search
              </MenuItem>
              <MenuItem
                onClick={() => setIsPlaylistMenuOpen((prev) => !prev)}
                icon={<MusicalNoteIcon />}
                active={isPlaylistMenuOpen}
              >
                Playlists
              </MenuItem>
              <MenuItem
                className='mt-auto'
                onClick={() => {
                  if (session.status === 'authenticated') {
                    signOut({ redirect: false })
                    return
                  }

                  openModal({
                    content: <AuthModal onClose={closeModal} />,
                    title: 'Sign In',
                  })
                }}
                icon={<UserIcon />}
              >
                {session.status === 'authenticated' ? 'Sign Out' : 'Sign In'}
              </MenuItem>
            </ul>
            <AnimatePresence>
              {isPlaylistMenuOpen && (
                <motion.div
                  className='bg-dark-800 absolute -right-64 -top-4 w-64 h-full'
                  initial='hidden'
                  exit='hidden'
                  animate='show'
                  variants={navAnim}
                >
                  <UserPlaylists />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </>
  )
}
