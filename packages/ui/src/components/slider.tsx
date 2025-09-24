import { Slider as SliderPrimitive } from 'radix-ui'
import { cn } from '../utils/cn'
import { Volume2, VolumeOff } from 'lucide-react'
import { useState } from 'react'

const clamp = (value: number, min: number, max: number) => {
  return Math.min(Math.max(value, min), max)
}

export const Slider = (props: SliderPrimitive.SliderProps) => {
  const { className, max = 100, min = 0, step = 1, value = [50], onValueChange, ...rest } = props
  const [isUsingPointer, setIsUsingPointer] = useState(false)
  const [internalValue, setInternalValue] = useState(value[0] ?? min)

  const [stashValues, setStashValues] = useState<{
    startingInternalValue: number
    startingClientX: number
  }>({
    startingInternalValue: internalValue,
    startingClientX: 0
  })

  const updateValue = (value: number) => {
    setInternalValue(value)
    onValueChange?.([value])
  }

  return (
    <div>
      <div className='group flex touch-none items-center gap-3 transition-[margin] duration-300 select-none *:duration-300 hover:-mx-3 hover:cursor-grab active:cursor-grabbing'>
        <VolumeOff className='size-5 transition group-hover:scale-125 group-hover:text-white' />
        <SliderPrimitive.Root
          value={[internalValue]}
          onValueCommit={([value]) => {
            if (!isUsingPointer) {
              updateValue(value ?? 0)
            }
          }}
          className={cn('relative flex h-1.5 grow items-center transition-[height] group-hover:h-4', props.className)}
          onPointerDown={(e) => {
            setStashValues({
              startingInternalValue: internalValue,
              startingClientX: e.clientX
            })
            setIsUsingPointer(true)
          }}
          onPointerMove={(e) => {
            if (e.buttons > 0) {
              const diffInPixels = e.clientX - stashValues.startingClientX
              const sliderWidth = e.currentTarget.clientWidth
              const pixelsPerUnit = (max - min) / sliderWidth
              const diffInUnits = diffInPixels * pixelsPerUnit

              const newValue = stashValues.startingInternalValue + diffInUnits
              updateValue(Math.round(clamp(newValue, min, max) / step) * step)
            }
          }}
          onBlur={() => setIsUsingPointer(false)}
          {...rest}
        >
          <SliderPrimitive.Track
            className={cn(
              'relative h-full grow overflow-hidden rounded-full bg-gray-700',
              !isUsingPointer &&
                'group-has-[:focus-visible]:outline-2 group-has-[:focus-visible]:outline-offset-2 group-has-[:focus-visible]:outline-sky-500'
            )}
          >
            <SliderPrimitive.Range className='absolute h-full bg-gray-300 transition group-hover:bg-white'>
              <div className='absolute inset-0 group-has-[:focus-visible]:bg-white' />
            </SliderPrimitive.Range>
          </SliderPrimitive.Track>
          <SliderPrimitive.Thumb />
        </SliderPrimitive.Root>
        <Volume2 className='size-5 transition group-hover:scale-125 group-hover:text-white' />
      </div>
      <p className='mt-4 text-sm'>Value: {internalValue}</p>
    </div>
  )
}
