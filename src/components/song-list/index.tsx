import { LinkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { PlayIcon } from '@heroicons/react/24/solid'
import { head, isNil } from 'lodash'
import React, { useCallback } from 'react'
import { twMerge } from 'tailwind-merge'

import { getVideoInfoQuery, queryClient } from '~/api'
import { usePlayerState } from '~/store/use-player'
import { useLocalSettings } from '~/store/user-local-settings'

import { Button } from '../button'
import { MenuItem } from '../dropdown'
import { RandomIcon } from '../icons'
import { Input } from '../input'
import { Song } from '../song'

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

  const { setIsPlaying, currentSong, setCurrentSong, setQueue } =
    usePlayerState()

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

      console.log(
        ' head(data.getVideoInfo)?.thumbnailUrl',
        head(data.getVideoInfo)?.thumbnailUrl
      )

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

  return (
    <>
      <div className='grid grid-cols-5 lg:grid-cols-3 px-4 py-2 gap-2'>
        <div className='col-span-1 flex gap-2'>
          <Button
            onClick={() =>
              onPlaySong(filteredSongs[0].title, filteredSongs[0].artist)
            }
            title='Play all'
            variant='primary'
            className='p-2  ml-auto'
            disabled={!filteredSongs.length}
          >
            <PlayIcon className='h-5 w-5' />
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
      {filteredSongs?.map((song, index) => (
        <Song
          key={index}
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
      ))}
    </>
  )
}
