import { Dialog, Transition } from '@headlessui/react'
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
          <Transition.Child
            as={Fragment}
            enter='ease-out duration-300'
            enterFrom='opacity-0'
            enterTo='opacity-100'
            leave='ease-in duration-200'
            leaveFrom='opacity-100'
            leaveTo='opacity-0'
          >
            <div className='fixed inset-0 bg-black bg-opacity-40' />
          </Transition.Child>
          <div className='fixed inset-0'>
            <div className='flex min-h-full items-center justify-center p-4 text-center '>
              <Transition.Child
                as={Fragment}
                enter='ease-out duration-300'
                enterFrom='opacity-0 scale-95'
                enterTo='opacity-100 scale-100'
                leave='ease-in duration-200'
                leaveFrom='opacity-100 scale-100'
                leaveTo='opacity-0 scale-95'
              >
                <Dialog.Panel className='w-fit transform overflow-y-auto overflow-x-clip rounded-2xl text-left align-middle shadow-xl transition-all max-h-[80svh] bg-surface-900 border border-solid border-zinc-900'>
                  <Dialog.Title
                    as='h3'
                    className='text-lg font-medium leading-6 sticky top-0 bg-surface-700 p-4 rounded-t-2xl flex justify-between items-center bg-opacity-30'
                  >
                    <span>{content.title}</span>
                    <Button
                      type='button'
                      variant='ghost'
                      className='inline-flex text-gray-300'
                      onClick={closeModal}
                    >
                      <XMarkIcon className='h-6 w-6' />
                    </Button>
                  </Dialog.Title>
                  {content.content}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  )
}
