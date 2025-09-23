import { toast } from 'sonner'
import { twMerge } from 'tailwind-merge'

interface ToastProps {
  message: string
  className?: string
}

export const Toast = (props: ToastProps) => {
  return (
    <div
      className={twMerge(
        'w-fit rounded-md bg-neutral-200 px-3 py-4 font-semibold text-surface-700 shadow-md',
        props.className
      )}
      onClick={() => {
        toast.dismiss()
      }}
      onKeyDown={() => {
        toast.dismiss()
      }}
      role='button'
      tabIndex={0}
    >
      {props.message}
    </div>
  )
}
