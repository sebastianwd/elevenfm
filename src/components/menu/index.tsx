import { HomeIcon, MagnifyingGlassIcon } from '@heroicons/react/24/solid'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React from 'react'

import { useGlobalSearchStore } from '~/store/use-global-search'
import { useLayoutState } from '~/store/use-layout-state'

interface MenuItemProps {
  children: React.ReactNode
  icon: JSX.Element
  href?: string
  onClick?: () => void
}

const MenuItem = ({ children, icon, href, onClick }: MenuItemProps) => {
  const router = useRouter()

  const active = router.pathname === href

  const activeClassname = active ? `stroke-primary-500 text-primary-500` : ''

  const Wrapper = href ? Link : 'button'

  return (
    <li
      className={`group py-2 hover:bg-dark-700 ${
        active && 'bg-dark-600'
      } rounded-[24px] transition-colors duration-300`}
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

export const Menu = () => {
  const setIsOpen = useGlobalSearchStore((state) => state.setIsOpen)

  const theaterMode = useLayoutState((state) => state.theaterMode)

  if (theaterMode) {
    return null
  }

  return (
    <>
      <div className='flex-shrink-0 md:w-36'></div>
      <div className='sticky top-0 h-full w-full px-4 md:fixed md:w-36 md:px-0 z-40 md:z-0'>
        <div className='sticky top-0 flex h-full flex-grow justify-center rounded-[40px] bg-dark-800 p-4 md:px-0 md:pb-24'>
          <ul className='flex overflow-hidden md:flex-col md:py-10 md:[&>*]:mb-4'>
            <MenuItem href='/' icon={<HomeIcon />}>
              Home
            </MenuItem>
            <MenuItem
              onClick={() => setIsOpen(true)}
              icon={<MagnifyingGlassIcon />}
            >
              Search
            </MenuItem>
          </ul>
        </div>
      </div>
    </>
  )
}
