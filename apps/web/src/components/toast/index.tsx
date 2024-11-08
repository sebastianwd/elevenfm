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
        'bg-neutral-200 text-surface-700 font-semibold py-4 px-3 rounded-md shadow-md w-fit',
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
