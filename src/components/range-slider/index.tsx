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
      <span className='text-xs text-gray-400 block w-6'>{minLabel}</span>
      <input
        className='grow h-1 accent-primary-500 py-2'
        {...rest}
        type='range'
      />
      <span className='text-xs text-gray-400 block w-6'>{maxLabel}</span>
    </div>
  )
}
