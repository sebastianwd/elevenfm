import { Combobox, Dialog } from '@headlessui/react'
import { CheckIcon, MagnifyingGlassIcon } from '@heroicons/react/24/solid'
import React, { Fragment } from 'react'

import { SpinnerIcon } from '../icons'

interface CommandPaletteProps {
  commands: string[]
  isOpen: boolean
  isLoading?: boolean
  onClose: () => void
  onInputChange: (value: string) => void
  onSelect: (value: string) => void
  value: string
}

export const CommandPalette = ({
  commands,
  isOpen = false,
  onClose,
  isLoading,
  onInputChange,
  onSelect,
  value,
}: CommandPaletteProps) => {
  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className='fixed inset-0 z-50 overflow-y-auto p-4 pt-[15vh]'
    >
      <Dialog.Overlay className='fixed inset-0 bg-dark-600/75' />
      <Combobox
        as='div'
        value={value}
        className='relative mx-auto max-w-xl'
        onChange={(command: string) => {
          onSelect(command)
        }}
      >
        <div className='flex items-center rounded-xl bg-dark-500 px-4 shadow-2xl ring-dark-500/70 focus-within:ring-2'>
          <Combobox.Input
            onChange={(e) => onInputChange(e.target.value)}
            className=' text-md w-full border-0 bg-transparent py-4 outline-none ring-0'
            placeholder='Search...'
          />
          {isLoading ? (
            <SpinnerIcon />
          ) : (
            <MagnifyingGlassIcon className='h-6 w-6' />
          )}
        </div>
        <Combobox.Options className='absolute mt-1 max-h-64 w-full overflow-auto rounded-md'>
          {commands.map((command) => (
            <Combobox.Option key={command} value={command} as={Fragment}>
              {({ active, selected }) => (
                <li
                  className={`relative cursor-pointer select-none  px-4 py-2 ${
                    active ? 'bg-dark-800 text-white' : 'bg-dark-500'
                  }`}
                >
                  {selected && <CheckIcon />}
                  {command}
                </li>
              )}
            </Combobox.Option>
          ))}
        </Combobox.Options>
      </Combobox>
    </Dialog>
  )
}
