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

interface WavesLoaderProps {
  className?: string
}

export const WavesLoader = (props: WavesLoaderProps) => {
  return (
    <div
      className={twMerge('flex items-center justify-center', props.className)}
    >
      {Array(10)
        .fill(null)
        .map((_, index) => (
          <div
            key={index}
            className={twMerge(
              `mx-2 h-10 max-h-full w-0.5 shrink-0 grow animate-waves rounded-xl bg-gradient-to-br from-primary-500 to-primary-500 opacity-0`,
              delayClasses[(index + 1) as keyof typeof delayClasses]
            )}
          ></div>
        ))}
    </div>
  )
}
