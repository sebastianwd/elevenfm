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
import isMobile from 'is-mobile'
import { find, sample } from 'lodash'
import React, { useCallback, useMemo } from 'react'
import { twMerge } from 'tailwind-merge'
import { useShallow } from 'zustand/react/shallow'

import { usePlaySong } from '~/hooks/use-play-song'
import { useLayoutState } from '~/store/use-layout-state'
import {
  type PlaylistSortingSettings,
  useLocalSettings,
} from '~/store/use-local-settings'
import { usePlayerState } from '~/store/use-player'
import { PlayableSong } from '~/types'

import { Button } from '../button'
import { RandomIcon } from '../icons'
import { Input } from '../input'
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
    <div className='flex cursor-default items-center justify-between rounded pl-4 transition-colors h-10'>
      <div className='@container/songs flex grow h-full'>
        <div className='flex items-center @2xl/songs:basis-1/2 h-full'>
          <div className='text-sm font-medium text-gray-400 w-3 shrink-0'>
            <span>#</span>
          </div>
          <button className='flex items-center h-full'>
            <div className='ml-4'>
              <p
                className={`text-sm font-medium text-gray-400 line-clamp-1 text-left`}
              >
                Title
              </p>
            </div>
          </button>
        </div>
        <div className='flex items-center grow'>
          {columns.playcount && (
            <div className='text-sm text-gray-400 mr-8 hidden @2xl/songs:inline-block'>
              Scrobbles
            </div>
          )}
          {columns.artist && (
            <div className='mr-8 @2xl/songs:block basis-1/2 hidden text-sm text-gray-400'>
              Artist
            </div>
          )}
          {columns.dateAdded && (
            <div className='mr-8 @2xl/songs:block hidden text-sm text-gray-400'>
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
  onImportFromUrl?: () => void
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

export const SongList = (props: SongListProps) => {
  const {
    songs,
    showArtist = false,
    identifier,
    isEditable = false,
    onImportFromUrl,
  } = props

  const [listSearchValue, setListSearchValue] = React.useState('')

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

    return songs.filter((song) =>
      song.title.toLowerCase().includes(listSearchValue.toLowerCase())
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

  return (
    <>
      <div className='flex px-2 py-2 flex-wrap justify-center gap-2'>
        <div className='flex gap-2 grow justify-center'>
          <Button
            onClick={() => {
              if (queueIdentifier === identifier) {
                toggleIsPlaying()
                return
              }

              if (isShuffled) {
                const randomSong = sample(filteredSongs)
                if (randomSong) {
                  onPlaySong(randomSong)
                  return
                }
              }

              onPlaySong(filteredSongs[0])
            }}
            title='Play all'
            variant='primary'
            className='p-2'
            disabled={!filteredSongs.length}
          >
            {queueIdentifier === identifier && isPlaying ? (
              <PauseIcon className='h-5 w-5' />
            ) : (
              <PlayIcon className='h-5 w-5' />
            )}
          </Button>
          <Input
            className='mt-auto lg:min-w-96 w-48'
            icon={<MagnifyingGlassIcon className='h-4 w-4' />}
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
              <LinkIcon className='h-5 w-5' />
            </Button>
          )}
          {identifier && (
            <Button
              onClick={onPlaylistShuffle}
              title='Shuffle songs'
              variant='secondary'
              className={twMerge('p-2', isShuffled && 'text-primary-500')}
            >
              <RandomIcon className='h-5 w-5' />
            </Button>
          )}
        </div>
        <div className='flex min-w-40'>
          <Button
            title='Sort by:'
            variant='ghost'
            className='p-2 font-normal text-neutral-300 ml-auto'
            onClick={() => {
              toggleSortedPlaylist({
                identifier: identifier ?? '',
                sortBy: getNextSortingProperty(
                  currentSortingProperty,
                  sortableProrperties
                ),
              })
            }}
          >
            <ListBulletIcon className='shrink-0 h-5' />
            <span className='text-sm ml-1 my-auto '>
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
              disabled={isCustomSorting || isDefaultSorting}
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
                <ArrowUpIcon className='shrink-0 h-5' />
              ) : (
                <ArrowDownIcon className='shrink-0 h-5' />
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
      <SortableContext
        items={
          isEditable && isCustomSorting
            ? filteredSongs.map((song) => ({
                id: song.id || `${song.title}-${song.artist}`,
              }))
            : []
        }
        strategy={verticalListSortingStrategy}
      >
        {filteredSongs?.map((song, index) => (
          <Sortable
            id={song.id || `${song.title}-${song.artist}`}
            disabled={isMobile()}
            data={{
              title: song.title,
              artist: song.artist,
              id: song.id,
              songUrl: song.songUrl,
            }}
            key={song.id || `${song.title}-${song.artist}`}
          >
            <Song
              isSortHighlight={
                !!song.id && song.id === draggingToPlaylistData?.id
              }
              position={index + 1}
              isPlaying={
                currentSong?.title === song.title &&
                currentSong?.artist === song.artist
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
            />
          </Sortable>
        ))}
      </SortableContext>
      <DragOverlay
        dropAnimation={null}
        className='w-fit min-w-96 select-none cursor-grabbing'
      >
        {draggingToPlaylistData ? (
          <div className='px-4 py-2 bg-surface-900 w-fit min-w-96 flex gap-4 opacity-85 border-solid border border-surface-300 rounded'>
            <p
              className={`text-sm font-medium text-gray-300 line-clamp-1 text-left`}
            >
              {draggingToPlaylistData.title}
            </p>
            {draggingToPlaylistData.artist && (
              <p className='text-sm text-gray-400 text-left @2xl/songs:hidden block'>
                {draggingToPlaylistData.artist}
              </p>
            )}
          </div>
        ) : null}
      </DragOverlay>
    </>
  )
}
