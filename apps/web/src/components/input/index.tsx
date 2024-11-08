import { forwardRef } from 'react'
import { twMerge } from 'tailwind-merge'

interface InputProps extends React.ComponentProps<'input'> {
  icon?: React.ReactNode
  iconDirection?: 'left' | 'right'
  className?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  const { icon, iconDirection = 'right', className, error, ...rest } = props

  return (
    <>
      <div
        className={twMerge(
          'flex items-center rounded-3xl bg-surface-800 px-4 shadow-2xl ring-surface-800/70 focus-within:ring-2 h-9',
          error && 'border-red-500 border border-solid',
          className
        )}
      >
        {iconDirection === 'left' && icon}
        <input
          ref={ref}
          className='size-full border-0 bg-transparent py-2 text-base outline-none ring-0'
          {...rest}
        />
        {iconDirection === 'right' && icon}
      </div>
      {error ? (
        <p className='min-h-4 text-wrap text-xs text-red-500'>{error}</p>
      ) : null}
    </>
  )
})

Input.displayName = 'Input'
