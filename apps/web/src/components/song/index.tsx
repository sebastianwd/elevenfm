import {
  MinusCircleIcon,
  SquaresPlusIcon,
  UserIcon,
} from '@heroicons/react/24/outline'
import {
  EllipsisHorizontalIcon,
  MusicalNoteIcon,
  PlayIcon,
  PlusIcon,
  XMarkIcon,
} from '@heroicons/react/24/solid'
import { Icon } from '@iconify/react'
import { orpc, queryClient } from '@repo/api/lib/orpc.client'
import { useMutation, useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type React from 'react'
import { Fragment, useCallback, useMemo } from 'react'
import { toast } from 'sonner'
import { twMerge } from 'tailwind-merge'

import { useModalStore } from '~/store/use-modal'
import { usePlayerState } from '~/store/use-player'
import { getMainArtist, splitArtist } from '~/utils/song-title-utils'

import { Dropdown as DynamicDropdown } from '../dropdown'
import { AudioWave } from '../icons'
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
  dateAdded?: Date | null
  songId?: string
  playlistId?: string
  isSortHighlight?: boolean
  onSelect?: React.ComponentProps<'div'>['onClick']
  isSelected?: boolean
}

interface SongStatusIconProps {
  artist: string
  song: string
  isPlaying?: boolean
}

const SongStatusIcon = (props: SongStatusIconProps) => {
  const videoSearchQuery = `${getMainArtist(props.artist)} - ${props.song}`
  const videoInfoQuery = useQuery({
    ...orpc.song.videoInfo.queryOptions({
      input: { query: videoSearchQuery },
      staleTime: Infinity,
      gcTime: Infinity,
      enabled: false,
    }),
  })

  if (videoInfoQuery.isLoading) {
    return (
      <Icon icon='line-md:loading-twotone-loop' className='text-primary-500' />
    )
  }

  return !props.isPlaying ? (
    <PlayIcon className='h-4 transition-colors' />
  ) : (
    <AudioWave className='h-4 text-primary-500' />
  )
}

export const Song = (props: SongProps) => {
  const {
    showArtist = true,
    isSortHighlight = false,
    onSelect,
    isSelected = false,
  } = props

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

  const { mutateAsync: createSongRadio } = useMutation(
    orpc.playlist.createRadio.mutationOptions()
  )

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

  const { mutateAsync: removeFromPlaylist } = useMutation(
    orpc.playlist.removeSong.mutationOptions()
  )

  const menuOptions: React.ComponentProps<typeof DynamicDropdown>['menuItems'] =
    useMemo(
      () => [
        {
          label: 'Remove from queue',
          icon: <MinusCircleIcon className='mr-2 h-5 shrink-0' />,
          hidden: !props.isQueue,
          onClick: removeFromQueue,
        },
        {
          label: 'Remove from playlist',
          icon: <XMarkIcon className='mr-2 h-5 shrink-0' />,
          hidden: !props.isEditable,
          onClick: async () => {
            await removeFromPlaylist({
              playlistId: props.playlistId ?? '',
              songId: props.songId ?? '',
            })

            toast.custom(
              () => <Toast message='✔ Song removed from playlist' />,
              { duration: 2000 }
            )
            await queryClient.invalidateQueries({
              queryKey: orpc.playlist.get.queryKey({
                input: { playlistId: props.playlistId ?? '' },
              }),
            })
          },
        },
        {
          label: 'Add to playlist',
          icon: <SquaresPlusIcon className='mr-2 h-5 shrink-0' />,
          onClick: openAddToPlaylistModal,
        },
        {
          label: 'Add to queue',
          icon: <PlusIcon className='mr-2 h-5 shrink-0' />,
          hidden: props.isQueue,
          onClick: addToQueue,
        },

        {
          label: 'Go to artist',
          icon: <UserIcon className='mr-2 h-5 shrink-0' />,
          onClick: () => {
            const mainArtist = getMainArtist(props.artist)
            router.push(`/artist/${mainArtist}`)
          },
        },
        {
          label: 'Go to song radio',
          icon: <MusicalNoteIcon className='mr-2 h-5 shrink-0' />,
          onClick: async () => {
            try {
              const response = await createSongRadio({
                songArtist: props.artist,
                songTitle: props.song,
                songId: props.songId,
              })

              if (response.id) {
                router.push(`/playlist/${response.id}`)
              }
            } catch (error) {
              console.error(error)
              if (error instanceof Error) {
                toast.custom(() => <Toast message={`❌ ${error.message}`} />, {
                  duration: 3500,
                })

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
        removeFromQueue,
        openAddToPlaylistModal,
        addToQueue,
        removeFromPlaylist,
        createSongRadio,
        router,
      ]
    )

  return (
    <div
      className={twMerge(
        'flex h-[3.25rem] cursor-default items-center justify-between rounded pl-4 transition-colors hover:bg-surface-700',
        isSortHighlight && 'border border-solid border-primary-500 opacity-80',
        isSelected && 'bg-surface-600 hover:bg-surface-600'
      )}
      role='row'
      onClick={onSelect}
      onKeyDown={() => {}}
      aria-selected={isSelected}
      tabIndex={0}
    >
      <div className='@container/songs flex h-full grow'>
        <div className='flex h-full items-center @2xl/songs:basis-1/2'>
          {props.position && (
            <div className='w-3 shrink-0 text-sm font-medium text-gray-400'>
              <span>{props.position}</span>
            </div>
          )}
          <button
            type='button'
            onClick={(e) => {
              e.stopPropagation()
              props.onClick?.(e)
            }}
            className='flex h-full items-center hover:text-primary-500'
          >
            <div
              className={twMerge(
                'ml-5 flex w-5 shrink-0 transition-[width]',
                !props.isPlaying && 'w-4'
              )}
            >
              <SongStatusIcon
                artist={props.artist}
                song={props.song}
                isPlaying={props.isPlaying}
              />
            </div>
            <div className='ml-4'>
              <p
                className={`line-clamp-1 text-left text-sm font-medium text-gray-300 ${
                  props.isPlaying ? 'text-primary-500' : ''
                }`}
              >
                {props.song}
              </p>
              {props.artist && showArtist && (
                <p className='block text-left text-sm text-gray-400 @2xl/songs:hidden'>
                  {props.artist}
                </p>
              )}
            </div>
          </button>
        </div>
        <div className='flex grow items-center'>
          {props.playcount && (
            <div className='mr-8 hidden text-sm text-gray-400 @2xl/songs:inline-block'>
              {props.playcount}
            </div>
          )}
          {props.artist && showArtist && (
            <div className='mr-8 hidden basis-1/2 truncate text-sm text-gray-400 @2xl/songs:block'>
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
            <div className='mr-8 hidden @2xl/songs:block'>
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
