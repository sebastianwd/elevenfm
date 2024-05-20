import {
  Popover as HeadlessPopover,
  PopoverButton,
  PopoverPanel,
  Transition,
} from '@headlessui/react'

export interface PopoverItem {
  label: string
  icon?: JSX.Element
  onClick: React.ComponentProps<'button'>['onClick']
}

interface PopoverProps {
  menuLabel: (open: boolean) => JSX.Element
  menuItems: PopoverItem[]
  direction?: React.ComponentProps<typeof PopoverPanel>['anchor']
  className?: string
  triggerClassName?: string
}

export const Popover = (props: PopoverProps) => {
  const {
    menuLabel,
    menuItems = [],
    direction = 'bottom',
    triggerClassName,
    className,
  } = props
  return (
    <HeadlessPopover className={className}>
      {({ open }) => (
        <>
          <PopoverButton className={triggerClassName}>
            {menuLabel(open)}
          </PopoverButton>
          <Transition
            enter='transition ease-out duration-200'
            enterFrom='opacity-0 translate-y-1'
            enterTo='opacity-100 translate-y-0'
            leave='transition ease-in duration-150'
            leaveFrom='opacity-100 translate-y-0'
            leaveTo='opacity-0 translate-y-1'
          >
            <PopoverPanel
              anchor={direction}
              className='divide-y z-40 divide-surface-900 rounded-xl min-w-48 p-1 bg-surface-600 bg-opacity-75'
            >
              {menuItems.map((item, index) => {
                return (
                  <button
                    key={index}
                    className={`hover:bg-surface-950 bg-surface-800 group flex w-full items-center rounded-md px-4 py-4 text-sm transition-colors  group`}
                    onClick={item.onClick}
                  >
                    <span className='block group-hover:text-primary-500 shrink-0'>
                      {item.icon}
                    </span>
                    {item.label}
                  </button>
                )
              })}
            </PopoverPanel>
          </Transition>
        </>
      )}
    </HeadlessPopover>
  )
}
