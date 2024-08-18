import {
  ArrowLeftStartOnRectangleIcon,
  MusicalNoteIcon,
  UserIcon,
} from '@heroicons/react/24/outline'
import { HomeIcon, MagnifyingGlassIcon } from '@heroicons/react/24/solid'
import { AnimatePresence, motion, Variants } from 'framer-motion'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { signOut, useSession } from 'next-auth/react'
import React from 'react'
import { twMerge } from 'tailwind-merge'

import { useGlobalSearchStore } from '~/store/use-global-search'
import { useLayoutState } from '~/store/use-layout-state'
import { useModalStore } from '~/store/use-modal'

import { AuthModal } from '../auth/auth-modal'
import { PlaylistMenu } from './playlist-menu'

interface MenuItemProps {
  children: React.ReactNode
  icon: JSX.Element
  href?: string
  onClick?: () => void
  className?: string
  active?: boolean
  loading?: boolean
  tag?: 'button' | 'a' | 'div'
}

const MenuItem = ({
  children,
  icon,
  href,
  onClick,
  className,
  active,
  loading,
  tag = 'button',
}: MenuItemProps) => {
  const router = useRouter()

  const activeClassname =
    active ?? router.pathname === href
      ? `stroke-primary-500 text-primary-500`
      : ''

  const Wrapper = href ? Link : tag

  return (
    <li
      className={twMerge(
        `group hover:bg-surface-900 rounded-3xl transition-colors duration-300`,
        (active ?? router.pathname === href) && 'bg-surface-900',
        className
      )}
    >
      <Wrapper
        href={href || '#'}
        className={twMerge(
          'block truncate md:w-full md:px-8 md:py-5 py-2',
          loading && 'cursor-wait'
        )}
        onClick={onClick}
      >
        <span className='flex md:flex-col md:items-center'>
          {React.cloneElement<HTMLElement>(icon, {
            className: `w-7 md:mx-2 mx-4 inline transition-colors ${activeClassname}`,
          })}
          <span
            className={`hidden text-sm md:inline transition-colors ${activeClassname}`}
          >
            {children}
          </span>
        </span>
      </Wrapper>
    </li>
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

const DynamicPopover = dynamic(
  async () => (await import('../popover')).Popover,
  {
    ssr: false,
  }
)

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
        <div className='sticky top-0 flex h-full flex-grow md:rounded-none rounded-[40px] bg-surface-950 p-4 md:p-0 md:px-0 md:pb-28'>
          <div className='flex relative w-full'>
            <ul className='flex md:flex-col md:py-10 md:gap-4 w-full items-center z-10 bg-surface-950 justify-between'>
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
              {session.status === 'authenticated' ? (
                <DynamicPopover
                  className='mt-auto'
                  direction='top start'
                  menuLabel={(open) => (
                    <MenuItem icon={<UserIcon />} tag='div' active={open}>
                      Account
                    </MenuItem>
                  )}
                  menuItems={[
                    {
                      label: 'Sign Out',
                      onClick: () => {
                        if (session.status === 'authenticated') {
                          signOut({ redirect: false })
                          return
                        }
                      },
                      icon: (
                        <ArrowLeftStartOnRectangleIcon className='h-5 mr-2 shrink-0' />
                      ),
                    },
                  ]}
                />
              ) : (
                <MenuItem
                  className='mt-auto'
                  loading={session.status === 'loading'}
                  onClick={() => {
                    openModal({
                      content: <AuthModal onClose={closeModal} />,
                      title: 'Sign In',
                    })
                  }}
                  icon={<UserIcon />}
                >
                  Sign In
                </MenuItem>
              )}
            </ul>
            <AnimatePresence>
              {isPlaylistMenuOpen && (
                <motion.div
                  className='bg-surface-950 absolute -left-8 md:left-auto md:-right-64 top-16 md:-top-0 w-64 md:h-full rounded-r-3xl h-[calc(100svh-12.25rem)] md:max-h-full'
                  initial='hidden'
                  exit='hidden'
                  animate='show'
                  variants={navAnim}
                >
                  <PlaylistMenu />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </>
  )
}
