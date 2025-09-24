import {
  Combobox,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
  Dialog,
  DialogPanel,
} from '@headlessui/react'
import { CheckIcon, MagnifyingGlassIcon } from '@heroicons/react/24/solid'
import { Icon } from '@iconify/react'

import { SpinnerIcon } from '../icons'

interface CommandPaletteProps {
  commands: string[]
  isOpen: boolean
  isLoading?: boolean
  hasSearched?: boolean
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
  hasSearched = false,
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
      className='fixed inset-0 z-50 overflow-y-auto p-4 pt-[20vh] transition data-[closed]:opacity-0'
    >
      <div
        className='fixed inset-0 w-screen overflow-y-auto bg-black/60 backdrop-blur-md'
        aria-hidden='true'
      />
      <DialogPanel>
        <Combobox
          as='div'
          value={value}
          className='relative mx-auto max-w-2xl'
          onChange={(command) => {
            onSelect(command ?? '')
          }}
        >
          <div className='relative overflow-hidden rounded-2xl bg-gradient-to-br from-surface-800 via-surface-900 to-surface-950 px-6 py-5 shadow-2xl ring-1 ring-surface-700 focus-within:ring-2 focus-within:ring-surface-600'>
            <div className='absolute inset-0 bg-gradient-to-r from-surface-700/10 to-surface-600/10' />
            <div className='relative flex items-center space-x-4'>
              <div className='flex h-10 w-10 items-center justify-center rounded-full bg-surface-700/20'>
                <MagnifyingGlassIcon className='h-5 w-5 text-surface-400' />
              </div>
              <ComboboxInput
                // eslint-disable-next-line jsx-a11y/no-autofocus
                autoFocus
                onChange={(e) => {
                  onInputChange(e.target.value)
                }}
                className='flex-1 border-0 bg-transparent text-lg font-medium text-white ring-0 outline-none placeholder:text-gray-400'
                placeholder='Search for artists...'
              />
              {isLoading && (
                <div className='flex h-8 w-8 items-center justify-center'>
                  <SpinnerIcon className='h-5 w-5 text-surface-400' />
                </div>
              )}
            </div>
          </div>

          <ComboboxOptions className='absolute mt-3 max-h-80 w-full overflow-auto rounded-xl bg-surface-900 shadow-2xl ring-1 ring-surface-700'>
            {commands.length === 0 &&
            value.length >= 3 &&
            !isLoading &&
            hasSearched ? (
              <div className='px-6 py-8 text-center'>
                <div className='mb-3 flex justify-center'>
                  <Icon
                    icon='mdi:music-note-off'
                    className='h-12 w-12 text-gray-500'
                  />
                </div>
                <p className='text-gray-400'>No artists found</p>
                <p className='text-sm text-gray-500'>
                  Try a different search term
                </p>
              </div>
            ) : commands.length === 0 && value.length < 3 ? (
              <div className='px-6 py-8 text-center'>
                <div className='mb-3 flex justify-center'>
                  <Icon
                    icon='mdi:magnify'
                    className='h-12 w-12 text-gray-500'
                  />
                </div>
                <p className='text-gray-400'>Start typing to search</p>
                <p className='text-sm text-gray-500'>
                  Enter at least 3 characters
                </p>
              </div>
            ) : (
              commands.map((command) => (
                <ComboboxOption key={command} value={command} as='ul'>
                  {({ focus, selected }) => (
                    <li
                      className={`relative cursor-pointer px-6 py-3 transition-colors ${
                        focus
                          ? 'bg-surface-700/20 text-white'
                          : 'text-gray-300 hover:bg-surface-800'
                      } ${selected ? 'bg-surface-700/30 text-surface-300' : ''}`}
                    >
                      <div className='flex items-center justify-between'>
                        <span className='font-medium'>{command}</span>
                        {selected && (
                          <CheckIcon className='h-5 w-5 text-surface-300' />
                        )}
                      </div>
                    </li>
                  )}
                </ComboboxOption>
              ))
            )}
          </ComboboxOptions>
        </Combobox>
      </DialogPanel>
    </Dialog>
  )
}
