import { Slider as SliderPrimitive } from 'radix-ui'
import * as React from 'react'
import { cn } from '../utils/cn'

interface SliderProps
  extends Omit<React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>, 'value' | 'onValueChange'> {
  value?: number
  onValueChange?: (value: number) => void
  dragToChange?: boolean
}

const Slider = React.forwardRef<React.ComponentRef<typeof SliderPrimitive.Root>, SliderProps>(
  (
    { className, max = 100, min = 0, step = 1, value, onValueChange, onValueCommit, dragToChange = true, ...props },
    ref
  ) => {
    const [isUsingPointer, setIsUsingPointer] = React.useState(false)

    const [internalValue, setInternalValue] = React.useState(value ?? min)

    React.useEffect(() => {
      setInternalValue(value ?? min)
    }, [value, min])

    const [startingValues, setStartingValues] = React.useState({
      clientX: 0,
      internalValue
    })

    const getValueAtPointer = (e: React.PointerEvent<HTMLDivElement>) => {
      const range = max - min
      const diffInPixels = e.clientX - startingValues.clientX

      const sliderWidth = e.currentTarget.clientWidth

      // how many pixels correspond to one unit
      const pixelsPerUnit = range / sliderWidth

      // convert the amount of pixels to slider units
      const diffInUnits = diffInPixels * pixelsPerUnit

      const clampedValue = clamp(startingValues.internalValue + diffInUnits, min, max)

      const steppedValue = Math.round(clampedValue / step) * step

      if (steppedValue === internalValue) return null

      return steppedValue
    }

    return (
      <SliderPrimitive.Root
        value={[internalValue]}
        ref={ref}
        onValueChange={([value]) => {
          if (!dragToChange) {
            setInternalValue(value || min)
          }
          onValueChange?.(value || min)
        }}
        onValueCommit={([value]) => {
          setInternalValue(value || min)
          onValueCommit?.([value || min])
        }}
        className={cn(
          'group/slider relative flex h-7 grow items-center py-3 transition-[height] duration-300 hover:h-8 hover:cursor-grabbing active:cursor-grabbing',
          'data-[orientation=vertical]:h-32 data-[orientation=vertical]:w-7 data-[orientation=vertical]:flex-col',
          className
        )}
        // manual pointer to prevent focus-visible when clicking on slider
        onPointerDown={(e) => {
          setStartingValues({
            clientX: e.clientX,
            internalValue: internalValue
          })
          setIsUsingPointer(true)
        }}
        onPointerMove={(e) => {
          if (!dragToChange) {
            return
          }

          if (e.buttons > 0) {
            const valueAtPointer = getValueAtPointer(e)
            if (valueAtPointer === null) {
              return
            }

            setInternalValue(valueAtPointer)
          }
        }}
        onBlur={() => setIsUsingPointer(false)}
        max={max}
        min={min}
        {...props}
      >
        <SliderPrimitive.Track
          className={cn(
            'relative h-full grow overflow-hidden rounded-full bg-gray-700',
            'data-[orientation=vertical]:w-1',
            !isUsingPointer &&
              'group-has-[:focus-visible]/slider:outline group-has-[:focus-visible]/slider:outline-offset-2 group-has-[:focus-visible]/slider:outline-primary-500'
          )}
        >
          <SliderPrimitive.Range className='absolute h-full bg-primary-500 transition group-hover/slider:bg-white data-[orientation=vertical]:w-full'>
            <div className='absolute inset-0 group-has-[:focus-visible]/slider:bg-white' />
          </SliderPrimitive.Range>
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb className='block size-0 rounded-full bg-gray-200 shadow-sm transition-all group-hover/slider:size-3' />
      </SliderPrimitive.Root>
    )
  }
)
Slider.displayName = SliderPrimitive.Root.displayName

const clamp = (value: number, min: number, max: number) => {
  return Math.min(Math.max(value, min), max)
}

export { Slider }
