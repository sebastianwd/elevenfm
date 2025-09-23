import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/solid'
import { Fragment } from 'react'

import { useModalStore } from '~/store/use-modal'

import { Button } from '../button'

export function Modal() {
  const isOpen = useModalStore((state) => state.isOpen)
  const content = useModalStore((state) => state.content)
  const closeModal = useModalStore((state) => state.closeModal)

  return (
    <>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as='div' className='relative z-50' onClose={closeModal}>
          <TransitionChild
            as={Fragment}
            enter='ease-out duration-300'
            enterFrom='opacity-0'
            enterTo='opacity-100'
            leave='ease-in duration-200'
            leaveFrom='opacity-100'
            leaveTo='opacity-0'
          >
            <div className='fixed inset-0 bg-black/40' />
          </TransitionChild>
          <div className='fixed inset-0'>
            <div className='flex min-h-full items-center justify-center p-4 text-center'>
              <TransitionChild
                as={Fragment}
                enter='ease-out duration-300'
                enterFrom='opacity-0 scale-95'
                enterTo='opacity-100 scale-100'
                leave='ease-in duration-200'
                leaveFrom='opacity-100 scale-100'
                leaveTo='opacity-0 scale-95'
              >
                <DialogPanel className='max-h-[80svh] w-fit overflow-x-clip overflow-y-auto rounded-2xl border border-solid border-zinc-900 bg-surface-900 text-left align-middle shadow-xl transition-all'>
                  <DialogTitle
                    as='h3'
                    className='sticky top-0 flex items-center justify-between rounded-t-2xl bg-surface-700/30 p-4 text-lg leading-6 font-medium'
                  >
                    <span>{content.title}</span>
                    <Button
                      type='button'
                      variant='ghost'
                      className='inline-flex text-gray-300'
                      onClick={closeModal}
                    >
                      <XMarkIcon className='size-6' />
                    </Button>
                  </DialogTitle>
                  {content.content}
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  )
}
