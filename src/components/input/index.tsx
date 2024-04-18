import { forwardRef } from 'react'
import { twMerge } from 'tailwind-merge'

interface InputProps extends React.ComponentProps<'input'> {
  icon?: React.ReactNode
  iconDirection?: 'left' | 'right'
  className?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  const { icon, iconDirection = 'right', className, ...rest } = props

  return (
    <div
      className={twMerge(
        'flex items-center rounded-3xl bg-dark-500 px-4 shadow-2xl ring-dark-500/70 focus-within:ring-2 h-9',
        className
      )}
    >
      {iconDirection === 'left' && icon}
      <input
        ref={ref}
        className='text-md border-0 bg-transparent w-full h-full py-2 outline-none ring-0'
        {...rest}
      />
      {iconDirection === 'right' && icon}
    </div>
  )
})

Input.displayName = 'Input'
