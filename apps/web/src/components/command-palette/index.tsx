import {
  Combobox,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
  Dialog,
  DialogPanel,
} from '@headlessui/react'
import { CheckIcon, MagnifyingGlassIcon } from '@heroicons/react/24/solid'
import { Fragment } from 'react'

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
      onClose={onClose}
      as='div'
      open={isOpen}
      transition
      className='fixed inset-0 z-50 overflow-y-auto p-4 pt-[15vh] transition data-[closed]:opacity-0'
    >
      <div
        className='fixed inset-0 w-screen overflow-y-auto bg-surface-900/75'
        aria-hidden='true'
      />
      <DialogPanel>
        <Combobox
          as='div'
          value={value}
          className='relative mx-auto max-w-xl'
          onChange={(command: string) => {
            onSelect(command)
          }}
        >
          <div className='flex items-center rounded-xl bg-surface-800 px-4 shadow-2xl ring-surface-800/70 focus-within:ring-2'>
            <ComboboxInput
              // eslint-disable-next-line jsx-a11y/no-autofocus
              autoFocus
              onChange={(e) => {
                onInputChange(e.target.value)
              }}
              className='w-full border-0 bg-transparent py-4 text-base outline-none ring-0'
              placeholder='Search...'
            />
            {isLoading ? (
              <SpinnerIcon />
            ) : (
              <MagnifyingGlassIcon className='size-6' />
            )}
          </div>
          <ComboboxOptions className='absolute mt-1 max-h-64 w-full overflow-auto rounded-md'>
            {commands.map((command) => (
              <ComboboxOption key={command} value={command} as={Fragment}>
                {({ focus, selected }) => (
                  <li
                    className={`relative cursor-pointer select-none list-none px-4 py-2 ${
                      focus ? 'bg-surface-950 text-white' : 'bg-surface-800'
                    }`}
                  >
                    {selected && <CheckIcon />}
                    {command}
                  </li>
                )}
              </ComboboxOption>
            ))}
          </ComboboxOptions>
        </Combobox>
      </DialogPanel>
    </Dialog>
  )
}
