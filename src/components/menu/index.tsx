import { MusicalNoteIcon, UserIcon } from '@heroicons/react/24/outline'
import { HomeIcon, MagnifyingGlassIcon } from '@heroicons/react/24/solid'
import { AnimatePresence, motion, Variants } from 'framer-motion'
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
