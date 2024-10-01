import { cva, type VariantProps } from 'class-variance-authority'
import React, { forwardRef } from 'react'
import { twMerge } from 'tailwind-merge'

const buttonVariants = cva(
  [
    'text-center flex items-center disabled:cursor-default disabled:opacity-80 disabled:pointer-events-none',
    'transform active:scale-95 active:opacity-90',
    'hover:brightness-105',
    'rounded-md shrink-0 font-medium text-center px-2 text-sm w-fit h-fit transition-all flex',
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
