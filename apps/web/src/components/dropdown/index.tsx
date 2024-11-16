import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Transition,
} from '@headlessui/react'
import { map } from 'lodash'
import { Fragment, useEffect, useState } from 'react'
import { twMerge } from 'tailwind-merge'

export interface MenuItem {
  label: string
  icon?: JSX.Element
  onClick: () => void
  hidden?: boolean
}

interface DropdownProps {
  menuLabel: JSX.Element
  menuItems: MenuItem[]
  direction?: 'left' | 'right'
  className?: string
  triggerClassName?: string
}

export default function Dropdown(props: DropdownProps) {
  const {
    menuLabel,
    menuItems,
    direction = 'left',
    triggerClassName,
    className,
  } = props

  const [dropdownRefState, setDropdownRefState] = useState<HTMLElement | null>(
    null
  )
  const [initialOpenUpwards, setInitialOpenUpwards] = useState(false)

  useEffect(() => {
    if (dropdownRefState) {
      const bottom = dropdownRefState.getBoundingClientRect().bottom
      if (bottom > window.innerHeight) {
        setInitialOpenUpwards(true)
      }
    }
  }, [dropdownRefState])

  return (
    <Menu
      as='div'
      className={twMerge('relative inline-block text-left', className)}
    >
      <MenuButton className={triggerClassName}>{menuLabel}</MenuButton>
      <Transition
        as={Fragment}
        enter='ease-out duration-100'
        enterFrom='opacity-0 scale-95'
        enterTo='opacity-100 scale-100'
        leave='ease-in duration-75'
        leaveFrom='opacity-100 scale-100'
        leaveTo='opacity-0 scale-95'
      >
        <MenuItems
          ref={(el) => setDropdownRefState(el)}
          className={twMerge(
            'absolute w-56 origin-top-right transition divide-y divide-surface-900 rounded-md bg-surface-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50 bottom-12 md:bottom-auto',
            direction === 'right' ? 'left-0' : 'right-0',
            initialOpenUpwards ? 'md:bottom-full' : ''
          )}
          anchor={{
            to: 'bottom start',
          }}
        >
          {map(menuItems, (item, index) => {
            if (item.hidden) return null

            return (
              <MenuItem key={item.label + index} as={Fragment}>
                {({ focus }) => (
                  <button
                    className={`${
                      focus ? 'bg-surface-950' : ''
                    } group flex w-full items-center rounded-md p-4 text-sm transition-colors`}
                    onClick={() => {
                      item.onClick()
                    }}
                    type='button'
                  >
                    {focus ? (
                      <div className='text-primary-500'>{item.icon}</div>
                    ) : (
                      item.icon
                    )}
                    {item.label}
                  </button>
                )}
              </MenuItem>
            )
          })}
        </MenuItems>
      </Transition>
    </Menu>
  )
}
