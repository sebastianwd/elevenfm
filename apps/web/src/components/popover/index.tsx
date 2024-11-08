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
              className='z-40 min-w-48 divide-y divide-surface-900 rounded-xl bg-surface-600/75 p-1'
            >
              {menuItems.map((item, index) => {
                return (
                  <button
                    type='button'
                    key={index}
                    className={`group flex w-full items-center rounded-md bg-surface-800 p-4 text-sm transition-colors hover:bg-surface-950`}
                    onClick={item.onClick}
                  >
                    <span className='block shrink-0 group-hover:text-primary-500'>
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
