'use client'
import { Icon } from '@iconify/react'

import { useLayoutState } from '~/store/use-layout-state'

export const Attribution = () => {
  const theaterMode = useLayoutState((state) => state.theaterMode)

  if (theaterMode) return null

  const currentYear = new Date().getFullYear()

  return (
    <div className='mx-auto flex w-fit items-center gap-1 py-4'>
      <p className='text-xs text-gray-400'>
        Made with ❤️ for music | {currentYear} ElevenFM |
      </p>
      <a
        href='https://github.com/sebastianwd/elevenfm'
        target='_blank'
        rel='noreferrer noopener'
        className='transition-colors hover:text-primary-500'
      >
        <Icon icon='mdi:github' className='size-4 shrink-0' />
      </a>
    </div>
  )
}
