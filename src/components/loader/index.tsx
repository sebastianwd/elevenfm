import React from 'react'
import { twMerge } from 'tailwind-merge'

const delayClasses = {
  2: 'animation-delay-100',
  3: 'animation-delay-200',
  4: 'animation-delay-300',
  5: 'animation-delay-[0.4s]',
  6: 'animation-delay-500',
  7: 'animation-delay-[0.6s]',
  8: 'animation-delay-700',
  9: 'animation-delay-[0.8s]',
  10: 'animation-delay-[0.9s]',
} as const

export const WavesLoader = () => {
  return (
    <div className='flex justify-center items-center'>
      {Array(10)
        .fill(null)
        .map((_, index) => (
          <div
            key={index}
            className={twMerge(
              `w-0.5 h-10 bg-gradient-to-br from-primary-500 to-primary-500 mx-2 animate-waves rounded-xl grow shrink-0 opacity-0`,
              delayClasses[(index + 1) as keyof typeof delayClasses]
            )}
          ></div>
        ))}
    </div>
  )
}
