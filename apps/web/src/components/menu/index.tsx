'use client'

import {
  ArrowLeftStartOnRectangleIcon,
  MusicalNoteIcon,
  UserIcon,
} from '@heroicons/react/24/outline'
import { HomeIcon, MagnifyingGlassIcon } from '@heroicons/react/24/solid'
import { signOut, useSession } from '@repo/api/auth/auth.client'
import type { Variants } from 'framer-motion'
import { AnimatePresence, motion } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cloneElement } from 'react'
import { twMerge } from 'tailwind-merge'

import { Popover } from '~/components/popover'
import { useGlobalSearchStore } from '~/store/use-global-search'
import { useLayoutState } from '~/store/use-layout-state'
import { useModalStore } from '~/store/use-modal'

import { AuthModal } from '../auth/auth-modal'
import { MyAccountModal } from '../modals/my-account-modal'
import { Skeleton } from '../skeleton/skeleton'
import { PlaylistMenu } from './playlist-menu'

interface MenuItemProps {
  children: React.ReactNode
  icon: React.ReactNode
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
  const pathname = usePathname()

  const activeClassname =
    (active ?? pathname === href) ? `stroke-primary-500 text-primary-500` : ''

  const Wrapper = href ? Link : tag

  return (
    <li
      className={twMerge(
        `group rounded-3xl transition-colors duration-300 hover:bg-surface-900`,
        (active ?? pathname === href) && 'bg-surface-900',
        className
      )}
    >
      <Wrapper
        href={href || '#'}
        className={twMerge(
          'block truncate py-2 md:w-full md:px-8 md:py-5',
          loading && 'cursor-wait'
        )}
        onClick={onClick}
      >
        <span className='flex md:flex-col md:items-center'>
          {cloneElement(icon as React.ReactElement<HTMLElement>, {
            className: `w-7 md:mx-2 mx-4 inline transition-colors ${activeClassname}`,
          })}
          <span
            className={`hidden text-sm transition-colors md:inline ${activeClassname}`}
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

export const Menu = () => {
  const setIsOpen = useGlobalSearchStore((state) => state.setIsOpen)
  const openModal = useModalStore((state) => state.openModal)
  const closeModal = useModalStore((state) => state.closeModal)
  const theaterMode = useLayoutState((state) => state.theaterMode)

  const isPlaylistMenuOpen = useLayoutState((state) => state.playlistMenuOpen)
  const setIsPlaylistMenuOpen = useLayoutState(
    (state) => state.setPlaylistMenuOpen
  )

  const session = useSession()

  if (theaterMode) {
    return null
  }

  const renderAccountOption = () => {
    if (session.isPending) {
      return (
        <MenuItem className='mt-auto' loading icon={<UserIcon />}>
          <Skeleton className='mt-1 h-4 w-14' />
        </MenuItem>
      )
    }

    if (session.data?.user)
      return (
        <Popover
          className='mt-auto'
          direction='top start'
          menuLabel={(open) => (
            <MenuItem icon={<UserIcon />} tag='div' active={open}>
              Account
            </MenuItem>
          )}
          menuItems={[
            {
              label: 'My Account',
              onClick: () => {
                openModal({
                  content: <MyAccountModal onClose={closeModal} />,
                  title: 'My Account',
                })
              },
              icon: <UserIcon className='mr-2 h-5 shrink-0' />,
            },
            {
              label: 'Sign Out',
              onClick: async () => {
                await signOut()
                return
              },
              icon: (
                <ArrowLeftStartOnRectangleIcon className='mr-2 h-5 shrink-0' />
              ),
            },
          ]}
        />
      )

    return (
      <MenuItem
        className='mt-auto'
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
    )
  }

  return (
    <>
      <div className='shrink-0 md:w-36'></div>
      <AnimatePresence>
        {isPlaylistMenuOpen && (
          <motion.div
            className='hidden xl:block'
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
      <div className='sticky top-0 z-40 size-full px-4 md:fixed md:z-20 md:w-36 md:px-0'>
        <div className='sticky top-0 flex h-full grow rounded-[40px] bg-surface-950 p-4 md:rounded-none md:p-0 md:pb-28'>
          <div className='relative flex w-full'>
            <ul className='z-10 flex w-full items-center justify-between bg-surface-950 md:flex-col md:gap-4 md:py-10'>
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
                onClick={() => setIsPlaylistMenuOpen(!isPlaylistMenuOpen)}
                icon={<MusicalNoteIcon />}
                active={isPlaylistMenuOpen}
              >
                Playlists
              </MenuItem>
              {renderAccountOption()}
            </ul>
            <AnimatePresence>
              {isPlaylistMenuOpen && (
                <motion.div
                  className='absolute top-16 -left-8 h-[calc(100svh-12.25rem)] w-64 rounded-r-3xl bg-surface-950 md:-top-0 md:-right-64 md:left-auto md:h-full md:max-h-full'
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
