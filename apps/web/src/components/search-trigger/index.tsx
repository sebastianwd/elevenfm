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
        className={`flex items-center rounded-xl leading-6 text-gray-300/80 shadow-sm transition-all ring-2 ring-surface-800 hover:ring-surface-700 bg-surface-950 hover:brightness-110 ${
          props.className || 'py-1.5 px-2'
        }`}
      >
        <span>Search artist...</span>
        <MagnifyingGlassIcon className='ml-auto h-6 w-6 flex-none' />
      </button>
    </div>
  )
}
