import { MagnifyingGlassIcon } from '@heroicons/react/24/solid'

interface Props {
  className?: string
  onClick?: () => void
}

export const SearchTrigger = (props: Props) => {
  return (
    <div className='pointer-events-auto relative contents rounded-xl'>
      <button
        type='button'
        onClick={props.onClick}
        className={`flex items-center rounded-xl leading-6 text-gray-300/60 shadow-sm transition-all hover:ring-2 hover:ring-surface-900 bg-surface-800 hover:brightness-110 ${
          props.className || 'py-1.5 px-2'
        }`}
      >
        <span>Search artist...</span>
        <MagnifyingGlassIcon className='ml-auto h-6 w-6 flex-none' />
      </button>
    </div>
  )
}
