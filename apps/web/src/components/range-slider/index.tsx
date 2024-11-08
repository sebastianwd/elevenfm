import { twMerge } from 'tailwind-merge'

interface RangeSliderProps extends React.InputHTMLAttributes<HTMLInputElement> {
  maxLabel?: string
  minLabel?: string
  min: number
  max: number
}

export const RangeSlider = (props: RangeSliderProps) => {
  const { maxLabel, minLabel, className, ...rest } = props

  return (
    <div className={twMerge(`flex items-center gap-1`, className)}>
      <span className='block w-6 text-xs text-gray-400'>{minLabel}</span>
      <input
        className='h-1 grow py-2 accent-primary-500'
        {...rest}
        type='range'
      />
      <span className='block w-6 text-xs text-gray-400'>{maxLabel}</span>
    </div>
  )
}
