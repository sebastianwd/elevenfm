'use client'

import { Icon } from '@iconify/react'
import type React from 'react'
import { forwardRef, useRef } from 'react'
import { twMerge } from 'tailwind-merge'

import { AnimatedBeam as AnimatedBeamBase } from '~/components/magicui/animated-beam'

const Circle = forwardRef<
  HTMLDivElement,
  { className?: string; children?: React.ReactNode }
>(({ className, children }, ref) => {
  return (
    <div
      ref={ref}
      className={twMerge(
        'bg-surface-800 z-10 flex size-16 items-center justify-center rounded-full p-3 shadow-[0_0_20px_-12px_rgba(0,0,0,0.8)]',
        className
      )}
    >
      {children}
    </div>
  )
})

Circle.displayName = 'Circle'

export function AnimatedBeam({ className }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const div1Ref = useRef<HTMLDivElement | null>(null)
  const div2Ref = useRef<HTMLDivElement | null>(null)
  const div3Ref = useRef<HTMLDivElement | null>(null)
  const div6Ref = useRef<HTMLDivElement | null>(null)

  return (
    <div
      className={twMerge(
        'relative flex w-2/3 items-center justify-center rounded-lg md:w-1/2',
        className
      )}
      ref={containerRef}
    >
      <div className='flex size-full max-w-lg flex-row items-stretch justify-between gap-10'>
        <div className='flex flex-col justify-center gap-2'>
          <Circle ref={div1Ref}>
            <Icon icon='ri:soundcloud-line' className='size-12' />
          </Circle>
          <Circle ref={div2Ref}>
            <Icon icon='streamline:spotify-solid' className='size-12' />
          </Circle>
          <Circle ref={div3Ref}>
            <Icon icon='basil:youtube-solid' className='size-12' />
          </Circle>
        </div>
        <div className='relative flex flex-col justify-center'>
          <Circle ref={div6Ref} className='bg-primary-500/70 size-16'>
            <Icon icon='entypo:folder-music' className='size-14' />
          </Circle>
        </div>
      </div>

      <AnimatedBeamBase
        containerRef={containerRef}
        fromRef={div1Ref}
        toRef={div6Ref}
      />
      <AnimatedBeamBase
        containerRef={containerRef}
        fromRef={div2Ref}
        toRef={div6Ref}
      />
      <AnimatedBeamBase
        containerRef={containerRef}
        fromRef={div3Ref}
        toRef={div6Ref}
      />
    </div>
  )
}
