import { MagnifyingGlassIcon } from '@heroicons/react/24/solid'

interface Props {
  className?: string
  onClick?: () => void
}

export const SearchTrigger = (props: Props) => {
  return (
    <div
      className={`pointer-events-auto relative contents rounded-xl dark:bg-dark-400 `}
    >
      <button
        type="button"
        onClick={props.onClick}
        className={`flex items-center rounded-xl leading-6 text-gray-300/60 shadow-sm transition-all hover:ring-2 hover:ring-dark-700 dark:bg-dark-500 dark:hover:brightness-110 ${
          props.className || 'py-1.5 px-2'
        }`}
      >
        <span>Search artist...</span>
        <MagnifyingGlassIcon className="ml-auto h-6 w-6 flex-none" />
      </button>
    </div>
  )
}
