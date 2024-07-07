import { MinusCircleIcon, SquaresPlusIcon } from '@heroicons/react/24/outline'
import {
  EllipsisHorizontalIcon,
  MusicalNoteIcon,
  PlayIcon,
  PlusIcon,
  XMarkIcon,
} from '@heroicons/react/24/solid'
import { useMutation } from '@tanstack/react-query'
import { format } from 'date-fns'
import { ClientError } from 'graphql-request'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { Fragment, useCallback, useMemo } from 'react'
import { toast } from 'sonner'
import { twMerge } from 'tailwind-merge'

import {
  createSongRadioMutation,
  queryClient,
  removeFromPlaylistMutation,
} from '~/api'
import { useModalStore } from '~/store/use-modal'
import { usePlayerState } from '~/store/use-player'
import { getError } from '~/utils/get-error'
import { splitArtist } from '~/utils/song-title-utils'

import { AddToPlaylistModal } from '../modals/add-to-playlist-modal'
import { Toast } from '../toast'

interface SongProps {
  song: string
  songUrl?: string | null
  artist: string
  isPlaying: boolean
  position?: number
  playcount?: number
  isFavorited?: boolean
  onClick: React.ComponentProps<'button'>['onClick']
  showArtist?: boolean
  onShowLyrics?: () => void
  isEditable?: boolean
  isQueue?: boolean
  dateAdded?: string | null
  songId?: string
  playlistId?: string
  isSortHighlight?: boolean
}

const DynamicDropdown = dynamic(() => import('../dropdown'), {
  ssr: false,
})

export const Song = (props: SongProps) => {
  const { showArtist = true, isSortHighlight = false } = props

  const addToQueueAction = usePlayerState((state) => state.addToQueue)
  const removeFromQueueAction = usePlayerState((state) => state.removeFromQueue)

  const router = useRouter()

  const openModal = useModalStore((state) => state.openModal)
  const closeModal = useModalStore((state) => state.closeModal)

  const addToQueue = useCallback(() => {
    addToQueueAction({
      artist: props.artist,
      title: props.song,
      urls: props.songUrl ? [props.songUrl] : [],
    })
  }, [addToQueueAction, props.artist, props.song, props.songUrl])

  const removeFromQueue = useCallback(() => {
    removeFromQueueAction({
      artist: props.artist,
      title: props.song,
    })
  }, [props.artist, props.song, removeFromQueueAction])

  const createSongRadio = useMutation({
    mutationFn: createSongRadioMutation,
    mutationKey: ['createSongRadio'],
  })

  const openAddToPlaylistModal = useCallback(() => {
    openModal({
      content: (
        <AddToPlaylistModal
          song={{
            artist: props.artist,
            title: props.song,
          }}
          onActionEnd={(playlist) => {
            toast.custom(
              () => <Toast message={`✔ Added to ${playlist.playlistName}`} />,
              {
                duration: 3000,
              }
            )
            closeModal()
          }}
        />
      ),
      title: 'Add to playlist',
    })
  }, [openModal, props.artist, props.song, closeModal])

  const removeFromPlaylist = useMutation({
    mutationKey: ['removeFromPlaylist', props.playlistId],
    mutationFn: removeFromPlaylistMutation,
  })

  const menuOptions: React.ComponentProps<typeof DynamicDropdown>['menuItems'] =
    useMemo(
      () => [
        {
          label: 'Remove from queue',
          icon: <MinusCircleIcon className='h-5 mr-2 shrink-0' />,
          hidden: !props.isQueue,
          onClick: removeFromQueue,
        },
        {
          label: 'Remove from playlist',
          icon: <XMarkIcon className='h-5 mr-2 shrink-0' />,
          hidden: !props.isEditable,
          onClick: async () => {
            await removeFromPlaylist.mutateAsync({
              playlistId: props.playlistId ?? '',
              songId: props.songId ?? '',
            })

            toast.custom(
              () => <Toast message='✔ Song removed from playlist' />,
              { duration: 2000 }
            )
            await queryClient.invalidateQueries({
              queryKey: ['userPlaylist', props.playlistId],
            })
          },
        },
        {
          label: 'Add to playlist',
          icon: <SquaresPlusIcon className='h-5 mr-2 shrink-0' />,
          onClick: openAddToPlaylistModal,
        },
        {
          label: 'Add to queue',
          icon: <PlusIcon className='h-5 mr-2 shrink-0' />,
          hidden: props.isQueue,
          onClick: addToQueue,
        },

        {
          label: 'Go to song radio',
          icon: <MusicalNoteIcon className='h-5 mr-2 shrink-0' />,
          onClick: async () => {
            try {
              const response = await createSongRadio.mutateAsync({
                songArtist: props.artist,
                songTitle: props.song,
                songId: props.songId || null,
              })

              if (response.createSongRadio) {
                router.push(`/playlist/${response.createSongRadio.id}`)
              }
            } catch (error) {
              console.error(error)
              if (error instanceof ClientError) {
                toast.custom(
                  () => <Toast message={`❌ ${getError(error)}`} />,
                  {
                    duration: 3500,
                  }
                )

                return
              }
            }
          },
        },
      ],
      [
        props.isQueue,
        props.isEditable,
        props.playlistId,
        props.songId,
        props.artist,
        props.song,
        openAddToPlaylistModal,
        addToQueue,
        removeFromQueue,
        removeFromPlaylist,
        createSongRadio,
        router,
      ]
    )

  return (
    <div
      className={twMerge(
        'flex cursor-default items-center justify-between rounded pl-4 transition-colors hover:bg-surface-700 h-[3.25rem]',
        isSortHighlight && 'border border-solid border-primary-500 opacity-80'
      )}
    >
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
            <div className='mr-8 @2xl/songs:block hidden basis-1/2 text-gray-400 truncate text-sm'>
              {splitArtist(props.artist).map((artist, index, artists) => (
                <Fragment key={artist}>
                  <Link
                    key={artist}
                    href={`/artist/${artist.trim()}`}
                    className='hover:underline'
                  >
                    {artist.trim()}
                  </Link>
                  {index < artists.length - 1 ? ',\u00a0' : ''}
                </Fragment>
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
        menuItems={menuOptions}
      />
    </div>
  )
}
