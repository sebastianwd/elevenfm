import { DragOverlay } from '@dnd-kit/core'
import {} from '@dnd-kit/modifiers'
import { LinkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { PauseIcon, PlayIcon } from '@heroicons/react/24/solid'
import { find, head, isNil, sample } from 'lodash'
import React, { useCallback } from 'react'
import { twMerge } from 'tailwind-merge'

import { getVideoInfoQuery, queryClient } from '~/api'
import { useLayoutState } from '~/store/use-layout-state'
import { usePlayerState } from '~/store/use-player'
import { useLocalSettings } from '~/store/user-local-settings'

import { Button } from '../button'
import { Draggable } from '../draggable'
import { MenuItem } from '../dropdown'
import { RandomIcon } from '../icons'
import { Input } from '../input'
import { Song } from '../song'

interface SongListHeaderProps {
  columns: {
    title: boolean
    playcount?: boolean
    artist?: boolean
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
            <div className='text-sm text-gray-400 mr-8 hidden md:inline-block'>
              Scrobbles
            </div>
          )}
          {columns.artist && (
            <div className='mr-8 @2xl/songs:block hidden text-sm text-gray-400'>
              Artist
            </div>
          )}
        </div>
      </div>
      <div className='w-12' />
    </div>
  )
}

interface SongListProps {
  songs: {
    title: string
    playcount?: string | null
    artist: string
    id?: string
  }[]
  showArtist?: boolean
  identifier?: string
  onImportFromUrl?: () => void
  menuOptions?: (
    song: {
      title: string
      playcount?: string | null
      artist: string
      id?: string
    },
    artist: string
  ) => MenuItem[]
}

export const SongList = (props: SongListProps) => {
  const {
    songs,
    showArtist = false,
    menuOptions,
    identifier,
    onImportFromUrl,
  } = props

  const [listSearchValue, setListSearchValue] = React.useState('')

  const {
    setIsPlaying,
    currentSong,
    setCurrentSong,
    setQueue,
    toggleIsPlaying,
    isPlaying,
  } = usePlayerState()

  const { toggleShuffledPlaylist, isShuffled } = useLocalSettings((state) => ({
    toggleShuffledPlaylist: state.toggleShuffledPlaylist,
    isShuffled: state.shuffledPlaylists.includes(identifier ?? ''),
  }))

  const { queueIdentifier, setShuffle, setQueueIdentifier } = usePlayerState(
    (state) => ({
      queueIdentifier: state.queueIdentifier,
      setQueueIdentifier: state.setQueueIdentifier,
      setShuffle: state.setShuffle,
    })
  )

  const onPlaySong = React.useCallback(
    async (song: string, artist: string) => {
      if (!isNil(isShuffled)) {
        setShuffle(isShuffled)
      }
      setQueueIdentifier(identifier ?? '')

      const data = await queryClient.fetchQuery({
        queryKey: ['getVideoInfo', `${artist} - ${song}`],
        queryFn: () => getVideoInfoQuery({ query: `${artist} - ${song}` }),
        staleTime: Infinity,
        gcTime: Infinity,
      })

      const urls = data?.getVideoInfo.map((video) => video.videoId)

      setCurrentSong({
        artist,
        title: song,
        urls,
        videoThumbnailUrl: head(data.getVideoInfo)?.thumbnailUrl,
      })

      setQueue(
        songs.map((song) => ({
          artist: song.artist,
          title: song.title,
        })) || []
      )

      setIsPlaying(true)
    },
    [
      identifier,
      isShuffled,
      setCurrentSong,
      setIsPlaying,
      setQueue,
      setQueueIdentifier,
      setShuffle,
      songs,
    ]
  )

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

  const { draggingToPlaylistData } = useLayoutState((state) => ({
    draggingToPlaylistData: state.draggingToPlaylistData,
  }))

  return (
    <>
      <div className='grid grid-cols-5 lg:grid-cols-3 px-4 py-2 gap-2'>
        <div className='col-span-1 flex gap-2'>
          <Button
            onClick={() => {
              if (queueIdentifier === identifier) {
                toggleIsPlaying()
                return
              }

              if (isShuffled) {
                const randomSong = sample(filteredSongs)
                if (randomSong) {
                  onPlaySong(randomSong.title, randomSong.artist)
                  return
                }
              }

              onPlaySong(filteredSongs[0].title, filteredSongs[0].artist)
            }}
            title='Play all'
            variant='primary'
            className='p-2  ml-auto'
            disabled={!filteredSongs.length}
          >
            {queueIdentifier === identifier && isPlaying ? (
              <PauseIcon className='h-5 w-5' />
            ) : (
              <PlayIcon className='h-5 w-5' />
            )}
          </Button>
        </div>
        <Input
          className='col-span-3 lg:col-span-1 mt-auto'
          icon={<MagnifyingGlassIcon className='h-4 w-4' />}
          onChange={(e) => onInputChange(e.target.value)}
          value={listSearchValue}
        />
        <div className='col-span-1 flex gap-2'>
          {onImportFromUrl && (
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
      </div>
      <SongListHeader
        columns={{
          title: true,
          playcount: !!find(songs, (song) => song.playcount),
          artist: showArtist,
        }}
      />
      {filteredSongs?.map((song, index) => (
        <Draggable
          key={song.id || `${song.title}-${song.artist}`}
          id={song.id || `${song.title}-${song.artist}`}
          data={{ title: song.title, artist: song.artist, id: song.id }}
        >
          <Song
            position={index + 1}
            isPlaying={
              currentSong?.title === song.title &&
              currentSong?.artist === song.artist
            }
            onClick={() => onPlaySong(song.title, song.artist)}
            song={song.title}
            playcount={song.playcount ? Number(song.playcount) : undefined}
            artist={song.artist}
            showArtist={showArtist}
            menuOptions={menuOptions?.(song, song.artist)}
          />
        </Draggable>
      ))}
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
