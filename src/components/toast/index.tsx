import { toast } from 'sonner'

interface ToastProps {
  message: string
}

export const Toast = (props: ToastProps) => {
  return (
    <div
      className='bg-dark-200 text-dark-700 font-semibold py-4 px-3 rounded-md shadow-md w-fit'
      onClick={() => {
        toast.dismiss()
      }}
    >
      {props.message}
    </div>
  )
}
