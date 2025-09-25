import { cva, type VariantProps } from 'class-variance-authority'
import type React from 'react'
import { forwardRef } from 'react'
import { twMerge } from 'tailwind-merge'

const buttonVariants = cva(
  [
    'flex items-center text-center disabled:cursor-not-allowed disabled:opacity-80',
    'active:enabled:scale-95 active:enabled:opacity-90',
    'hover:enabled:brightness-105',
    'flex size-fit shrink-0 rounded-md px-2 text-center text-sm font-medium transition-all',
  ],
  {
    variants: {
      variant: {
        primary: ['bg-neutral-200 text-surface-900'],
        secondary: ['bg-surface-800 text-neutral-200'],
        ghost: ['bg-transparent'],
      },
    },
    defaultVariants: {
      variant: 'primary',
    },
  }
)

export interface ButtonProps
  extends React.ComponentProps<'button'>,
    VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => {
    const { className, variant, ...rest } = props

    return (
      <button
        type='button'
        className={twMerge(buttonVariants({ variant, className }))}
        ref={ref}
        {...rest}
      />
    )
  }
)

Button.displayName = 'Button'
