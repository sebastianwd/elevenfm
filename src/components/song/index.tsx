import { HeartIcon as HeartIconOutline } from '@heroicons/react/24/outline'
import {
  EllipsisHorizontalIcon,
  FolderPlusIcon,
  HeartIcon as HeartIconSolid,
  PlayIcon,
} from '@heroicons/react/24/solid'
import dynamic from 'next/dynamic'
import { useCallback } from 'react'

import { getLyricsQuery, queryClient } from '~/api'

interface SongProps {
  song: string
  artist?: string
  isPlaying: boolean
  position?: number
  playcount?: number
  isFavorited?: boolean
  onClick: () => void
  showArtist?: boolean
}

const DynamicDropdown = dynamic(() => import('../dropdown'), {
  ssr: false,
})

export const Song = (props: SongProps) => {
  const { showArtist = true } = props

  const showLyrics = useCallback(async () => {
    const data = await queryClient.fetchQuery(
      ['getLyricsQuery', `${props.artist} - ${props.song}`],
      () => getLyricsQuery({ artist: props.artist || '', song: props.song }),
      { cacheTime: Infinity, staleTime: Infinity }
    )

    console.log(data)
  }, [props.artist, props.song])

  return (
    <div className='flex cursor-default items-center justify-between rounded px-4 py-3 transition-colors hover:bg-dark-500'>
      <div className='flex items-center'>
        {props.position && (
          <div className='text-sm font-medium text-gray-400 w-3 shrink-0'>
            <span>{props.position}</span>
          </div>
        )}
        <PlayIcon
          className={`h-4 ml-5  hover:text-primary-500 transition-colors shrink-0 ${
            props.isPlaying ? 'text-primary-500' : ''
          } `}
          onClick={props.onClick}
        />
        <div className='ml-4'>
          <div
            className={`text-sm font-medium text-gray-300 line-clamp-1 ${
              props.isPlaying ? 'text-primary-500' : ''
            } `}
          >
            {props.song}
          </div>
          {props.artist && showArtist && (
            <div className='text-sm text-gray-400'>{props.artist}</div>
          )}
        </div>
      </div>
      <div className='flex items-center'>
        <div className='text-sm text-gray-400 mr-8 hidden md:inline-block'>
          {props.playcount}
        </div>
        {props.isFavorited ? (
          <HeartIconSolid className='cursor-pointer h-5 ml-5 text-primary-500 grow' />
        ) : (
          <HeartIconOutline className='h-5 ml-5 shrink-0 hover:text-primary-500 transition-colors' />
        )}
        <button className='ml-5'>
          <FolderPlusIcon className='h-5 shrink-0 hover:text-primary-500 transition-colors' />
        </button>
        <DynamicDropdown
          menuLabel={
            <EllipsisHorizontalIcon className='h-5 ml-5 shrink-0 hover:text-primary-500 transition-colors' />
          }
          menuItems={[
            {
              label: 'Show lyrics',
              icon: <PlayIcon className='h-5 mr-2 shrink-0' />,
              onClick: showLyrics,
            },
          ]}
        />
      </div>
    </div>
  )
}
