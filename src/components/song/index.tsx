import {
  EllipsisHorizontalIcon,
  MusicalNoteIcon,
  PlayIcon,
  PlusIcon,
} from '@heroicons/react/24/solid'
import { useMutation } from '@tanstack/react-query'
import { format } from 'date-fns'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useCallback, useMemo } from 'react'

import { createSongRadioMutation } from '~/api'
import { usePlayerState } from '~/store/use-player'

import { MenuItem } from '../dropdown'

interface SongProps {
  song: string
  artist: string
  isPlaying: boolean
  position?: number
  playcount?: number
  isFavorited?: boolean
  onClick: React.ComponentProps<'button'>['onClick']
  showArtist?: boolean
  onShowLyrics?: () => void
  menuOptions?: MenuItem[]
  dateAdded?: string
  songId?: string
}

const DynamicDropdown = dynamic(() => import('../dropdown'), {
  ssr: false,
})

export const Song = (props: SongProps) => {
  const { showArtist = true } = props

  const addToQueueAction = usePlayerState((state) => state.addToQueue)

  const router = useRouter()

  const addToQueue = useCallback(async () => {
    await addToQueueAction({ artist: props.artist, title: props.song })
  }, [props.artist, props.song, addToQueueAction])

  const createSongRadio = useMutation({
    mutationFn: createSongRadioMutation,
    mutationKey: ['createSongRadio'],
  })

  const defaultOptions = useMemo(
    () => [
      {
        label: 'Add to queue',
        icon: <PlusIcon className='h-5 mr-2 shrink-0' />,
        onClick: addToQueue,
      },
      {
        label: 'Go to song radio',
        icon: <MusicalNoteIcon className='h-5 mr-2 shrink-0' />,
        onClick: async () => {
          const response = await createSongRadio.mutateAsync({
            songArtist: props.artist,
            songTitle: props.song,
            songId: props.songId || null,
          })

          if (response.createSongRadio) {
            router.push(`/playlist/${response.createSongRadio.id}`)
          }
        },
      },
    ],
    [
      addToQueue,
      createSongRadio,
      props.artist,
      props.song,
      props.songId,
      router,
    ]
  )

  const options = props.menuOptions
    ? [...defaultOptions, ...props.menuOptions]
    : defaultOptions

  return (
    <div className='flex cursor-default items-center justify-between rounded pl-4 transition-colors hover:bg-surface-700 h-[3.25rem]'>
      <div className='@container/songs flex grow h-full'>
        <div className='flex items-center @2xl/songs:basis-1/2 h-full'>
          {props.position && (
            <div className='text-sm font-medium text-gray-400 w-3 shrink-0'>
              <span>{props.position}</span>
            </div>
          )}
          <button
            onClick={props.onClick}
            className='flex items-center h-full hover:text-primary-500'
          >
            <PlayIcon
              className={`h-4 ml-5 transition-colors shrink-0 ${
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
                <p className='text-sm text-gray-400 text-left @2xl/songs:hidden block'>
                  {props.artist}
                </p>
              )}
            </div>
          </button>
        </div>
        <div className='flex items-center grow'>
          {props.playcount && (
            <div className='text-sm text-gray-400 mr-8 hidden md:inline-block'>
              {props.playcount}
            </div>
          )}
          {props.artist && showArtist && (
            <div className='mr-8 @2xl/songs:block hidden basis-1/2 text-gray-400 truncate'>
              {props.artist.split(',').map((artist, index, artists) => (
                <Link
                  key={artist}
                  href={`/artist/${artist.trim()}`}
                  className='text-sm  hover:underline'
                >
                  {artist}
                  {index < artists.length - 1 ? ', ' : ''}
                </Link>
              ))}
            </div>
          )}
          {props.dateAdded && (
            <div className='mr-8 @2xl/songs:block hidden'>
              <p className='text-sm text-gray-400'>
                {format(new Date(Number(props.dateAdded)), 'MMM d, yyyy')}
              </p>
            </div>
          )}
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
        </div>
      </div>
      <DynamicDropdown
        className='ml-auto h-full'
        triggerClassName='h-full hover:text-primary-500 px-3'
        menuLabel={
          <EllipsisHorizontalIcon className='h-5 shrink-0 transition-colors' />
        }
        menuItems={options}
      />
    </div>
  )
}
