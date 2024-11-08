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
        className={`flex items-center rounded-xl bg-surface-950 leading-6 text-gray-300/80 shadow-sm ring-2 ring-surface-800 transition-all hover:ring-surface-700 hover:brightness-110 ${
          props.className || 'px-2 py-1.5'
        }`}
      >
        <span>Search artist...</span>
        <MagnifyingGlassIcon className='ml-auto size-6 flex-none' />
      </button>
    </div>
  )
}
