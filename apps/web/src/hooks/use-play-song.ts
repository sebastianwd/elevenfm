import { orpc, queryClient } from '@repo/api/lib/orpc.client'
import { useMutation } from '@tanstack/react-query'
import { head } from 'es-toolkit'
import { isNil } from 'es-toolkit/compat'
import { useCallback } from 'react'

import { useLocalSettings } from '~/store/use-local-settings'
import { usePlayerState } from '~/store/use-player'
import type { PlayableSong } from '~/types'
import { isR2FileKey } from '~/utils/r2-utils'
import { getMainArtist } from '~/utils/song-title-utils'

interface UsePlaySongOptions {
  songs: PlayableSong[]
  songsIdentifier: string
}

export const usePlaySong = (options: UsePlaySongOptions) => {
  const { songs, songsIdentifier: identifier } = options

  const isShuffled = useLocalSettings((state) =>
    state.shuffledPlaylists.includes(identifier || '')
  )

  const setQueueIdentifier = usePlayerState((state) => state.setQueueIdentifier)
  const setShuffle = usePlayerState((state) => state.setShuffle)

  const { setIsPlaying, setCurrentSong, setQueue } = usePlayerState()

  const { mutateAsync: generatePlaybackUrl } = useMutation(
    orpc.playlist.generatePlaybackUrl.mutationOptions()
  )

  const onPlaySong = useCallback(
    async (song: PlayableSong) => {
      const { artist, title, songUrl } = song

      if (identifier) {
        if (!isNil(isShuffled)) {
          setShuffle(isShuffled)
        }
        setQueueIdentifier(identifier || '')
      }

      if (!songUrl) {
        const videoSearchQuery = `${getMainArtist(artist)} - ${title}`

        const data = await queryClient.fetchQuery(
          orpc.song.videoInfo.queryOptions({
            input: { query: videoSearchQuery },
            staleTime: Infinity,
            gcTime: Infinity,
          })
        )

        const urls = data.map((video) => video.videoUrl)

        setCurrentSong({
          artist,
          title,
          urls,
          videoThumbnailUrl: head(data)?.thumbnailUrl,
          albumCoverUrl: song.albumCoverUrl || undefined,
        }).catch((err) => console.error('Error setting current song', err))
      } else {
        // Check if it's an R2 file key and generate presigned URL
        if (isR2FileKey(songUrl)) {
          try {
            const response = await generatePlaybackUrl({
              fileKey: songUrl,
            })
            setCurrentSong({
              artist,
              title,
              urls: [response.playbackUrl],
            }).catch((err) => console.error('Error setting current song', err))
          } catch (error) {
            console.error('Error generating R2 playback URL:', error)
            // Fallback to original URL (will likely fail but prevents crash)
            setCurrentSong({
              artist,
              title,
              urls: [songUrl],
            }).catch((err) => console.error('Error setting current song', err))
          }
        } else {
          setCurrentSong({
            artist,
            title,
            urls: [songUrl],
          }).catch((err) => console.error('Error setting current song', err))
        }
      }

      if (identifier) {
        setQueue(
          songs.map((song) => ({
            artist: song.artist,
            title: song.title,
            urls: song.songUrl ? [song.songUrl] : undefined,
          }))
        )
      }

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
      generatePlaybackUrl,
    ]
  )

  return {
    onPlaySong,
  }
}
