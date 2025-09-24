import { DragOverlay } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { LinkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ListBulletIcon,
  PauseIcon,
  PlayIcon,
} from '@heroicons/react/24/solid'
import { sample } from 'es-toolkit'
import { find, isEmpty, size } from 'es-toolkit/compat'
import { AnimatePresence, motion } from 'framer-motion'
import isMobile from 'is-mobile'
import type { RefObject } from 'react'
import React, { useCallback, useMemo, useRef } from 'react'
import { isHotkeyPressed } from 'react-hotkeys-hook'
import { twMerge } from 'tailwind-merge'
import { useOnClickOutside } from 'usehooks-ts'
import { useShallow } from 'zustand/react/shallow'

import { usePlaySong } from '~/hooks/use-play-song'
import { useLayoutState } from '~/store/use-layout-state'
import {
  type PlaylistSortingSettings,
  useLocalSettings,
} from '~/store/use-local-settings'
import { usePlayerState } from '~/store/use-player'
import type { PlayableSong } from '~/types'

import { Button } from '../button'
import { RandomIcon } from '../icons'
import { Input } from '../input'
import { Skeleton } from '../skeleton/skeleton'
import { Song } from '../song'
import { Sortable } from '../sortable'

interface SongListHeaderProps {
  columns: {
    title: boolean
    playcount?: boolean
    artist?: boolean
    dateAdded?: boolean
  }
}

const SongListHeader = (props: SongListHeaderProps) => {
  const { columns } = props

  return (
    <div className='flex h-10 cursor-default items-center justify-between rounded pl-4 transition-colors'>
      <div className='@container/songs flex h-full grow'>
        <div className='flex h-full items-center @2xl/songs:basis-1/2'>
          <div className='w-3 shrink-0 text-sm font-medium text-gray-400'>
            <span>#</span>
          </div>
          <div className='flex h-full items-center'>
            <div className='ml-4'>
              <p className='line-clamp-1 text-left text-sm font-medium text-gray-400'>
                Title
              </p>
            </div>
          </div>
        </div>
        <div className='flex grow items-center'>
          {columns.playcount && (
            <div className='mr-8 hidden text-sm text-gray-400 @2xl/songs:inline-block'>
              Scrobbles
            </div>
          )}
          {columns.artist && (
            <div className='mr-8 hidden basis-1/2 text-sm text-gray-400 @2xl/songs:block'>
              Artist
            </div>
          )}
          {columns.dateAdded && (
            <div className='mr-8 hidden text-sm text-gray-400 @2xl/songs:block'>
              Date added
            </div>
          )}
        </div>
      </div>
      <div className='w-12' />
    </div>
  )
}

interface SongListProps {
  songs: PlayableSong[]
  showArtist?: boolean
  identifier?: string
  isEditable?: boolean
  isLoading?: boolean
  onImportFromUrl?: () => void
  emptyMessage?: string
}

const sortableProrpertiesLabels = {
  custom: 'Custom',
  title: 'Title',
  artist: 'Artist',
  dateAdded: 'Date added',
  default: 'Default',
  scrobbles: 'Scrobbles',
} as const satisfies Record<
  NonNullable<PlaylistSortingSettings['sortBy']>,
  string
>

const getNextSortingProperty = (
  currentSortingProperty: NonNullable<PlaylistSortingSettings['sortBy']>,
  sortableProrperties: NonNullable<PlaylistSortingSettings['sortBy']>[]
) => {
  const index = sortableProrperties.findIndex(
    (property) => property === currentSortingProperty
  )
  if (index === sortableProrperties.length - 1) {
    return sortableProrperties[0]
  }
  return sortableProrperties[index + 1]
}

const SongsDragOverlay = () => {
  const { draggingToPlaylistData } = useLayoutState(
    useShallow((state) => ({
      draggingToPlaylistData: state.draggingToPlaylistData,
    }))
  )

  if (!draggingToPlaylistData) return null

  const isDraggingMultiple = draggingToPlaylistData.items.length > 1

  const sample = draggingToPlaylistData.items[0]

  return (
    <div className='flex w-fit min-w-96 items-center gap-4 rounded border border-solid border-surface-300 bg-surface-900 px-4 py-2 opacity-85'>
      <div className={twMerge(!isDraggingMultiple && 'flex gap-4')}>
        <p className='line-clamp-1 text-left text-sm font-medium text-gray-300'>
          {sample?.title}
        </p>
        {sample?.artist && (
          <p className='block text-left text-sm text-gray-400 @2xl/songs:hidden'>
            {sample.artist}
          </p>
        )}
      </div>
      {isDraggingMultiple ? (
        <p className='text-sm text-gray-400'>
          and {size(draggingToPlaylistData.items) - 1} more items
        </p>
      ) : (
        ''
      )}
    </div>
  )
}

export const SongList = (props: SongListProps) => {
  const {
    songs,
    showArtist = false,
    identifier,
    isEditable = false,
    onImportFromUrl,
    isLoading,
    emptyMessage,
  } = props

  const [listSearchValue, setListSearchValue] = React.useState('')

  const [selectedSongIds, setSelectedSongIds] = React.useState<string[]>([])

  const { currentSong, toggleIsPlaying, isPlaying } = usePlayerState(
    useShallow((state) => ({
      currentSong: state.currentSong,
      toggleIsPlaying: state.toggleIsPlaying,
      isPlaying: state.isPlaying,
    }))
  )

  const {
    toggleShuffledPlaylist,
    isShuffled,
    sortedPlaylists,
    toggleSortedPlaylist,
  } = useLocalSettings(
    useShallow((state) => ({
      toggleShuffledPlaylist: state.toggleShuffledPlaylist,
      isShuffled: state.shuffledPlaylists.includes(identifier ?? ''),
      sortedPlaylists: state.sortedPlaylists,
      toggleSortedPlaylist: state.toggleSortedPlaylist,
    }))
  )

  const queueIdentifier = usePlayerState((state) => state.queueIdentifier)
  const setShuffle = usePlayerState((state) => state.setShuffle)

  const { onPlaySong } = usePlaySong({
    songs,
    songsIdentifier: identifier || '',
  })

  const onInputChange = (value: string) => {
    setListSearchValue(value)
  }

  const filteredSongs = React.useMemo(() => {
    if (!listSearchValue) {
      return songs
    }

    return songs.filter(
      (song) =>
        song.title.toLowerCase().includes(listSearchValue.toLowerCase()) ||
        song.artist.toLowerCase().includes(listSearchValue.toLowerCase())
    )
  }, [listSearchValue, songs])

  const onPlaylistShuffle = useCallback(() => {
    if (queueIdentifier === identifier) {
      setShuffle(!isShuffled)
    }

    toggleShuffledPlaylist(identifier ?? '')
  }, [
    queueIdentifier,
    identifier,
    toggleShuffledPlaylist,
    setShuffle,
    isShuffled,
  ])

  const { draggingToPlaylistData } = useLayoutState(
    useShallow((state) => ({
      draggingToPlaylistData: state.draggingToPlaylistData,
    }))
  )

  const sortingSettings = useMemo(
    () =>
      sortedPlaylists.find((playlist) => playlist.identifier === identifier),
    [sortedPlaylists, identifier]
  )

  const isCustomSorting =
    sortingSettings?.sortBy === 'custom' || !sortingSettings?.sortBy

  const isDefaultSorting =
    sortingSettings?.sortBy === 'default' || !sortingSettings?.sortBy

  const currentSortingProperty =
    sortingSettings?.sortBy || (isEditable ? 'custom' : 'default')

  const sortableProrperties = useMemo(() => {
    const hasScrobbles = find(songs, (song) => !!song.playcount)
    if (isEditable) {
      return ['custom', 'title', 'artist', 'dateAdded']
    }
    return hasScrobbles
      ? ['default', 'title', 'scrobbles']
      : ['default', 'title']
  }, [isEditable, songs]) satisfies NonNullable<
    PlaylistSortingSettings['sortBy']
  >[]

  const draggableData = useMemo(() => {
    if (selectedSongIds.length === 0) {
      return filteredSongs
    }

    return filteredSongs.filter((song) =>
      selectedSongIds.includes(song.id || `${song.title}-${song.artist}`)
    )
  }, [filteredSongs, selectedSongIds])

  const onClickOutside = useCallback(() => {
    if (selectedSongIds.length > 0) {
      setSelectedSongIds([])
    }
  }, [selectedSongIds])

  const ref = useRef<HTMLDivElement>(null)

  useOnClickOutside(ref as RefObject<HTMLDivElement>, onClickOutside)

  const onSelect = useCallback(
    (song: PlayableSong) => {
      const songIdentifier = song.id || `${song.title}-${song.artist}`

      if (selectedSongIds.includes(songIdentifier)) {
        setSelectedSongIds((prev) => prev.filter((id) => id !== songIdentifier))
        return
      }
      setSelectedSongIds((prev) => {
        if (isHotkeyPressed('shift') && prev.length > 0) {
          const lastSelectedSongIndex = filteredSongs.findIndex(
            (song) =>
              (song.id || `${song.title}-${song.artist}`) ===
              prev[prev.length - 1]
          )

          const currentSongIndex = filteredSongs.indexOf(song)
          const start = Math.min(lastSelectedSongIndex, currentSongIndex)

          const end = Math.max(lastSelectedSongIndex, currentSongIndex)

          const newSelectedSongs = filteredSongs
            .slice(start, end + 1)
            .map((song) => song.id || `${song.title}-${song.artist}`)

          return [...new Set([...prev, ...newSelectedSongs])]
        }

        return isHotkeyPressed('ctrl')
          ? [...prev, songIdentifier]
          : [songIdentifier]
      })
    },
    [filteredSongs, selectedSongIds]
  )

  const renderSongList = () => {
    if (isLoading) {
      return Array.from({ length: 16 }).map((_, i) => (
        <div key={i} className='mb-2 h-[3.25rem] rounded pl-4'>
          <Skeleton className='size-full overflow-hidden' />
        </div>
      ))
    }

    if (isEmpty(filteredSongs)) {
      return (
        <div className='mt-[10%] flex justify-center rounded pl-4'>
          <p className='text-neutral-300'>{emptyMessage || 'No songs found'}</p>
        </div>
      )
    }

    return filteredSongs.map((song, index) => {
      const songIdentifier = song.id || `${song.title}-${song.artist}`

      const hasOtherSelectedSongs =
        selectedSongIds.length > 0 && !selectedSongIds.includes(songIdentifier)

      const dndData = {
        items:
          selectedSongIds.length === 0 || hasOtherSelectedSongs
            ? [
                {
                  title: song.title,
                  artist: song.artist,
                  id: song.id,
                  songUrl: song.songUrl,
                },
              ]
            : draggableData,
      } as const

      return (
        <Sortable
          id={songIdentifier}
          disabled={isMobile()}
          data={dndData}
          key={songIdentifier}
        >
          <Song
            isSortHighlight={
              !!song.id && song.id === draggingToPlaylistData?.id
            }
            position={index + 1}
            isPlaying={
              currentSong?.title === song.title &&
              currentSong.artist === song.artist
            }
            onClick={() => onPlaySong(song)}
            song={song.title}
            playcount={song.playcount ? Number(song.playcount) : undefined}
            artist={song.artist}
            showArtist={showArtist}
            isEditable={isEditable}
            playlistId={isEditable ? identifier : undefined}
            dateAdded={song.createdAt}
            songId={song.id}
            songUrl={song.songUrl}
            onSelect={() => onSelect(song)}
            isSelected={selectedSongIds.includes(songIdentifier)}
          />
        </Sortable>
      )
    })
  }

  return (
    <>
      <div className='flex flex-wrap justify-center gap-2 p-2 pt-4'>
        <div className='flex grow justify-center gap-2 md:justify-start'>
          <Button
            onClick={async () => {
              if (queueIdentifier === identifier) {
                toggleIsPlaying()
                return
              }

              if (isShuffled) {
                const randomSong = sample(filteredSongs)
                await onPlaySong(randomSong)
                return
              }

              const firstSong = filteredSongs[0]

              if (firstSong) {
                await onPlaySong(firstSong)
              }
            }}
            title='Play all'
            variant='primary'
            className='p-2'
            disabled={!filteredSongs.length || isLoading}
          >
            {queueIdentifier === identifier && isPlaying ? (
              <PauseIcon className='size-5' />
            ) : (
              <PlayIcon className='size-5' />
            )}
          </Button>
          <Input
            className='mt-auto w-48 lg:min-w-96'
            icon={<MagnifyingGlassIcon className='size-4' />}
            onChange={(e) => onInputChange(e.target.value)}
            value={listSearchValue}
          />
          {onImportFromUrl && isEditable && (
            <Button
              onClick={onImportFromUrl}
              title='Import from URL'
              variant='secondary'
              className='p-2'
            >
              <LinkIcon className='size-5' />
            </Button>
          )}
          {identifier && (
            <Button
              onClick={onPlaylistShuffle}
              title='Shuffle songs'
              variant='secondary'
              className={twMerge('p-2', isShuffled && 'text-primary-500')}
              disabled={isLoading}
            >
              <RandomIcon className='size-5' />
            </Button>
          )}
        </div>
        <div className='flex min-w-40'>
          <Button
            title='Sort by:'
            variant='ghost'
            className='ml-auto p-2 font-normal text-neutral-300'
            onClick={() => {
              toggleSortedPlaylist({
                identifier: identifier ?? '',
                sortBy: getNextSortingProperty(
                  currentSortingProperty,
                  sortableProrperties
                ),
              })
            }}
            disabled={isLoading}
          >
            <ListBulletIcon className='h-5 shrink-0' />
            <span className='my-auto ml-1 text-sm'>
              {sortableProrpertiesLabels[currentSortingProperty]}
            </span>
          </Button>
          <div
            className={
              isCustomSorting || isDefaultSorting ? 'cursor-not-allowed' : ''
            }
          >
            <Button
              variant='ghost'
              className='p-2 font-light text-neutral-300'
              disabled={isCustomSorting || isDefaultSorting || isLoading}
              onClick={() => {
                if (!sortingSettings?.direction) {
                  toggleSortedPlaylist({
                    identifier: identifier ?? '',
                    direction: 'asc',
                  })
                }

                toggleSortedPlaylist({
                  identifier: identifier ?? '',
                  direction:
                    sortingSettings?.direction === 'asc' ? 'desc' : 'asc',
                })
              }}
            >
              {sortingSettings?.direction === 'asc' ? (
                <ArrowUpIcon className='h-5 shrink-0' />
              ) : (
                <ArrowDownIcon className='h-5 shrink-0' />
              )}
            </Button>
          </div>
        </div>
      </div>
      <SongListHeader
        columns={{
          title: true,
          playcount: !!find(songs, (song) => song.playcount),
          artist: showArtist,
          dateAdded: !!find(songs, (song) => song.createdAt),
        }}
      />
      <PresenceWrapper isLoading={isLoading}>
        <div ref={ref}>
          <SortableContext
            items={
              isEditable && isCustomSorting && selectedSongIds.length <= 1
                ? filteredSongs.map((song) => ({
                    id: song.id || `${song.title}-${song.artist}`,
                  }))
                : []
            }
            strategy={verticalListSortingStrategy}
          >
            {renderSongList()}
          </SortableContext>
        </div>
      </PresenceWrapper>
      <DragOverlay
        dropAnimation={null}
        className='w-fit min-w-96 cursor-grabbing select-none'
      >
        <SongsDragOverlay />
      </DragOverlay>
    </>
  )
}

export const SongList2 = (props: SongListProps) => {
  const { isLoading, ...rest } = props

  return (
    <PresenceWrapper isLoading={isLoading}>
      <SongList {...rest} isLoading={isLoading} />
    </PresenceWrapper>
  )
}

interface PresenceWrapperProps {
  isLoading?: boolean
  children: React.ReactNode
}

const PresenceWrapper = (props: PresenceWrapperProps) => {
  const { isLoading, children } = props
  return (
    <AnimatePresence mode='popLayout'>
      {isLoading ? (
        <motion.div
          className='pointer-events-none'
          key='loading'
          initial={{
            opacity: 0,
            y: 10,
          }}
          transition={{
            duration: 0.4,
            delay: 0.2,
            ease: 'easeOut',
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          exit={{
            opacity: 0,
          }}
        >
          {children}
        </motion.div>
      ) : (
        <motion.div
          initial={{
            opacity: 0,
          }}
          animate={{ opacity: 1 }}
          transition={{
            ease: [0.445, 0.05, 0.55, 0.95],
            duration: 0.2,
          }}
          exit={{
            opacity: 0,
            y: 10,
            z: -200,
          }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
