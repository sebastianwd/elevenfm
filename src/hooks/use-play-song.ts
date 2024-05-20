import { head, isNil } from 'lodash'
import { useCallback } from 'react'

import { getVideoInfoQuery, queryClient } from '~/api'
import { usePlayerState } from '~/store/use-player'
import { useLocalSettings } from '~/store/user-local-settings'
import { PlayableSong } from '~/types'

interface UsePlaySongOptions {
  songs: PlayableSong[]
  songsIdentifier: string
}

export const usePlaySong = (options: UsePlaySongOptions) => {
  const { songs, songsIdentifier: identifier } = options

  const { isShuffled } = useLocalSettings((state) => ({
    toggleShuffledPlaylist: state.toggleShuffledPlaylist,
    isShuffled: state.shuffledPlaylists.includes(identifier ?? ''),
  }))

  const { setShuffle, setQueueIdentifier } = usePlayerState((state) => ({
    setQueueIdentifier: state.setQueueIdentifier,
    setShuffle: state.setShuffle,
  }))

  const { setIsPlaying, setCurrentSong, setQueue } = usePlayerState()

  const onPlaySong = useCallback(
    async (song: PlayableSong) => {
      const { artist, title, songUrl } = song

      if (!isNil(isShuffled)) {
        setShuffle(isShuffled)
      }
      setQueueIdentifier(identifier ?? '')

      if (!songUrl) {
        const data = await queryClient.fetchQuery({
          queryKey: ['getVideoInfo', `${artist} - ${title}`],
          queryFn: () => getVideoInfoQuery({ query: `${artist} - ${title}` }),
          staleTime: Infinity,
          gcTime: Infinity,
        })

        const urls = data?.getVideoInfo.map((video) => video.videoUrl)

        setCurrentSong({
          artist,
          title,
          urls,
          videoThumbnailUrl: head(data.getVideoInfo)?.thumbnailUrl,
        })
      } else {
        setCurrentSong({
          artist,
          title,
          urls: [songUrl],
        })
      }

      setQueue(
        songs.map((song) => ({
          artist: song.artist,
          title: song.title,
          urls: song.songUrl ? [song.songUrl] : undefined,
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

  return {
    onPlaySong,
  }
}
