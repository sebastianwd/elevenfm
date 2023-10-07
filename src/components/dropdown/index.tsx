import { Menu, Transition } from '@headlessui/react'
import { Fragment } from 'react'

interface MenuItem {
  label: string
  icon?: JSX.Element
  onClick: () => void
}

interface DropdownProps {
  menuLabel: JSX.Element
  menuItems: MenuItem[]
}

export default function Dropdown(props: DropdownProps) {
  const { menuLabel, menuItems = [] } = props

  return (
    <Menu as='div' className='relative inline-block text-left'>
      <Menu.Button className=''>{menuLabel}</Menu.Button>
      <Transition
        as={Fragment}
        enter='transition ease-out duration-100'
        enterFrom='transform opacity-0 scale-95'
        enterTo='transform opacity-100 scale-100'
        leave='transition ease-in duration-75'
        leaveFrom='transform opacity-100 scale-100'
        leaveTo='transform opacity-0 scale-95'
      >
        <Menu.Items className='absolute right-0 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-dark-500 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10'>
          {menuItems.map((item, index) => {
            return (
              <Menu.Item key={index}>
                {({ active }) => (
                  <button
                    className={`${
                      active ? 'bg-dark-800' : ''
                    } group flex w-full items-center rounded-md px-4 py-4 text-sm transition-colors`}
                    onClick={item.onClick}
                  >
                    {active ? (
                      <div className='text-primary-500'>{item.icon}</div>
                    ) : (
                      item.icon
                    )}
                    {item.label}
                  </button>
                )}
              </Menu.Item>
            )
          })}
        </Menu.Items>
      </Transition>
    </Menu>
  )
}
