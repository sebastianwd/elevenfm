import {
  EllipsisHorizontalIcon,
  PlayIcon,
  PlusIcon,
} from '@heroicons/react/24/solid'
import dynamic from 'next/dynamic'
import { useCallback } from 'react'

import { usePlayerState } from '~/store/use-player'

interface SongProps {
  song: string
  artist: string
  isPlaying: boolean
  position?: number
  playcount?: number
  isFavorited?: boolean
  onClick: () => void
  showArtist?: boolean
  onShowLyrics?: () => void
}

const DynamicDropdown = dynamic(() => import('../dropdown'), {
  ssr: false,
})

export const Song = (props: SongProps) => {
  const { showArtist = true } = props

  const addToQueueAction = usePlayerState((state) => state.addToQueue)

  const addToQueue = useCallback(async () => {
    await addToQueueAction({ artist: props.artist, title: props.song })
  }, [props.artist, props.song, addToQueueAction])

  return (
    <div className='flex cursor-default items-center justify-between rounded px-4 py-3 transition-colors hover:bg-dark-500'>
      <div className='flex items-center'>
        {props.position && (
          <div className='text-sm font-medium text-gray-400 w-3 shrink-0'>
            <span>{props.position}</span>
          </div>
        )}
        <button onClick={props.onClick} className='flex items-center'>
          <PlayIcon
            className={`h-4 ml-5  hover:text-primary-500 transition-colors shrink-0 ${
              props.isPlaying ? 'text-primary-500' : ''
            } `}
          />
          <div className='ml-4'>
            <p
              className={`text-sm font-medium text-gray-300 line-clamp-1 text-left ${
                props.isPlaying ? 'text-primary-500' : ''
              } `}
            >
              {props.song}
            </p>
            {props.artist && showArtist && (
              <p className='text-sm text-gray-400 text-left'>{props.artist}</p>
            )}
          </div>
        </button>
      </div>
      <div className='flex items-center'>
        <div className='text-sm text-gray-400 mr-8 hidden md:inline-block'>
          {props.playcount}
        </div>
        {/* 
        {props.isFavorited ? (
          <HeartIconSolid className='cursor-pointer h-5 ml-5 text-primary-500 grow' />
        ) : (
          <HeartIconOutline className='h-5 ml-5 shrink-0 hover:text-primary-500 transition-colors' />
        )}
        <button className='ml-5'>
          <FolderPlusIcon className='h-5 shrink-0 hover:text-primary-500 transition-colors' />
        </button>
        */}
        <DynamicDropdown
          menuLabel={
            <EllipsisHorizontalIcon className='h-5 ml-5 shrink-0 hover:text-primary-500 transition-colors' />
          }
          menuItems={[
            {
              label: 'Add to queue',
              icon: <PlusIcon className='h-5 mr-2 shrink-0' />,
              onClick: addToQueue,
            },
          ]}
        />
      </div>
    </div>
  )
}
