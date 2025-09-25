import { Slider } from '@repo/ui/components/slider'
import { cn } from '@repo/ui/utils/cn'
import type { ComponentProps } from 'react'

interface RangeSliderProps extends ComponentProps<typeof Slider> {
  maxLabel?: string
  minLabel?: string
}

export const RangeSlider = (props: RangeSliderProps) => {
  const { maxLabel, minLabel, className, ...rest } = props

  return (
    <div className={cn(`flex items-center gap-1`, className)}>
      {minLabel ? (
        <span className='block w-6 text-xs text-gray-400'>{minLabel}</span>
      ) : null}
      <Slider {...rest} />
      {maxLabel ? (
        <span className='block w-6 text-xs text-gray-400'>{maxLabel}</span>
      ) : null}
    </div>
  )
}
