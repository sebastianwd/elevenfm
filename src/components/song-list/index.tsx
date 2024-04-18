import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import React from 'react'

import { getVideoInfoQuery, queryClient } from '~/api'
import { usePlayerState } from '~/store/use-player'

import { MenuItem } from '../dropdown'
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
  const { songs, showArtist = false, menuOptions } = props

  const [listSearchValue, setListSearchValue] = React.useState('')

  const { setIsPlaying, currentSong, setCurrentSong, setQueue } =
    usePlayerState()

  const onPlaySong = React.useCallback(
    async (song: string, artist: string) => {
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
      })

      setQueue(
        songs.map((song) => ({
          artist: song.artist,
          title: song.title,
        })) || []
      )

      setIsPlaying(true)
    },
    [setCurrentSong, setIsPlaying, setQueue, songs]
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

  return (
    <>
      <div className='grid grid-cols-3 px-4 py-2'>
        <Input
          className='col-span-full lg:col-start-2 lg:col-span-1'
          icon={<MagnifyingGlassIcon className='h-4 w-4' />}
          onChange={(e) => onInputChange(e.target.value)}
          value={listSearchValue}
        />
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
