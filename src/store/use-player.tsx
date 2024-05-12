import { head, isEmpty, random, sortBy } from 'lodash'
import { createRef } from 'react'
import type ReactPlayer from 'react-player'
import { toast } from 'sonner'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

import { getAlbumBySongQuery, getVideoInfoQuery, queryClient } from '~/api'
import { Toast } from '~/components/toast'

export type Song = {
  title: string
  artist: string
  albumCoverUrl?: string
  videoThumbnailUrl?: string
  duration?: number
  urls?: string[]
}

interface PlayerProgressState {
  progress: {
    playedSeconds: number
    played: number
  }
  setProgress: (progress: { playedSeconds: number; played: number }) => void
}

interface PlayerState {
  isPlaying: boolean
  setIsPlaying: (isPlaying: boolean) => void
  currentSong: Song | null
  setCurrentSong: (song: Song) => Promise<void>
  duration: number
  setDuration: (duration: number) => void
  queue: Song[]
  queueIdentifier: string
  setQueueIdentifier: (identifier: string) => void
  shuffledQueue: Song[]
  setQueue: (queue: Song[]) => void
  playNext: (options?: { isUserAction: boolean }) => void
  playPrevious: () => void
  isShuffled: boolean
  setShuffle: (random: boolean) => void
  addToQueue: (song: Song) => void
  repeatMode: 'none' | 'one' | 'all'
  setRepeatMode: (mode: 'none' | 'one' | 'all') => void
  toggleIsPlaying: () => void
}

interface PlayerInstanceState {
  instance: React.MutableRefObject<Omit<ReactPlayer, 'refs'> | null>
}

const getAlbum = async (song: Song) => {
  if (song.albumCoverUrl) {
    return
  }

  const data = await queryClient.fetchQuery({
    queryKey: ['album', `${song.artist} - ${song.title}`],
    queryFn: () =>
      getAlbumBySongQuery({ artist: song.artist, song: song.title }),
    gcTime: Infinity,
    staleTime: Infinity,
  })

  return data.getAlbumBySong
}

const getVideoInfo = async (song: Song) => {
  const data = await queryClient.fetchQuery({
    queryKey: ['videoInfo', `${song.artist} - ${song.title}`],
    queryFn: () =>
      getVideoInfoQuery({ query: `${song.artist} - ${song.title}` }),
    gcTime: Infinity,
    staleTime: Infinity,
  })

  return data.getVideoInfo
}

export const usePlayerState = create<PlayerState>()(
  devtools(
    immer((set, get) => ({
      isPlaying: false,
      setIsPlaying: (isPlaying: boolean) =>
        set((state) => {
          state.isPlaying = isPlaying
        }),
      currentSong: null,
      duration: 0,
      queue: [],
      shuffledQueue: [],
      setShuffle: (isShuffled: boolean) =>
        set((state) => {
          const activeQueue = state.isShuffled
            ? state.shuffledQueue
            : state.queue

          state.isShuffled = isShuffled

          if (activeQueue.length === 0) {
            return
          }

          const currentSong = state.currentSong

          if (!currentSong) {
            return
          }

          const songsWithoutCurrent = activeQueue.filter(
            (song) =>
              song.title !== currentSong.title ||
              (song.title === currentSong.title &&
                song.artist !== currentSong.artist)
          )

          const shuffledSongs = sortBy(songsWithoutCurrent, () => random(true))

          state.shuffledQueue = [currentSong, ...shuffledSongs]
        }),
      isShuffled: false,
      setQueue: (queue: Song[]) =>
        set((state) => {
          state.queue = queue

          const currentSong = state.currentSong

          console.log(currentSong)

          if (currentSong) {
            const songsWithoutCurrent = queue.filter(
              (song) =>
                song.title !== currentSong.title ||
                (song.title === currentSong.title &&
                  song.artist !== currentSong.artist)
            )

            const shuffledSongs = sortBy(songsWithoutCurrent, () =>
              random(true)
            )

            state.shuffledQueue = [currentSong, ...shuffledSongs]
          }
        }),
      playNext: async (options = { isUserAction: true }) => {
        const state = get()

        const activeQueue = state.isShuffled ? state.shuffledQueue : state.queue

        const currentSongIndex = activeQueue.findIndex(
          (song) =>
            song.title === state.currentSong?.title &&
            song.artist === state.currentSong?.artist
        )

        const getNextSong = () => {
          if (!options.isUserAction) {
            if (state.repeatMode === 'one') return activeQueue[currentSongIndex]
          }

          if (state.repeatMode === 'all')
            return activeQueue[currentSongIndex + 1] || activeQueue[0]

          return activeQueue[currentSongIndex + 1]
        }

        const nextSong = getNextSong()

        const isSameAsCurrent =
          nextSong?.title === state.currentSong?.title &&
          nextSong?.artist === state.currentSong?.artist

        if (nextSong) {
          if (isSameAsCurrent) {
            instanceRef.current?.seekTo(0)
            return
          }

          const getVideoData = async () => {
            const data = await getVideoInfo(nextSong)

            return {
              thumbnailUrl: head(data)?.thumbnailUrl,
              videoUrls: data.map((item) => item?.videoUrl),
            }
          }

          const videoData = isEmpty(nextSong.urls)
            ? await getVideoData()
            : {
                thumbnailUrl: nextSong.videoThumbnailUrl,
                videoUrls: nextSong.urls,
              }

          await state.setCurrentSong({
            artist: nextSong.artist,
            title: nextSong.title,
            urls: videoData.videoUrls,
            videoThumbnailUrl: videoData.thumbnailUrl,
          })
        }
      },
      playPrevious: async () => {
        const state = get()

        const activeQueue = state.isShuffled ? state.shuffledQueue : state.queue

        const currentSongIndex = activeQueue.findIndex(
          (song) =>
            song.title === state.currentSong?.title &&
            song.artist === state.currentSong?.artist
        )

        const previousSong = state.isShuffled
          ? state.shuffledQueue[currentSongIndex - 1]
          : state.queue[currentSongIndex - 1]

        if (previousSong) {
          const getVideoData = async () => {
            const data = await getVideoInfo(previousSong)

            return {
              thumbnailUrl: head(data)?.thumbnailUrl,
              videoUrls: data.map((item) => item?.videoUrl),
            }
          }

          const videoData = isEmpty(previousSong.urls)
            ? await getVideoData()
            : {
                thumbnailUrl: previousSong.videoThumbnailUrl,
                videoUrls: previousSong.urls,
              }

          await state.setCurrentSong({
            artist: previousSong.artist,
            title: previousSong.title,
            urls: videoData.videoUrls,
            videoThumbnailUrl: videoData.thumbnailUrl,
          })
        }
      },
      setDuration: (duration: number) =>
        set((state) => {
          state.duration = duration
        }),
      setCurrentSong: async (song: Song) => {
        set((state) => {
          state.duration = 0
          state.currentSong = song
        })

        const coverUrl = song.albumCoverUrl || (await getAlbum(song))?.coverUrl

        set((state) => {
          state.currentSong = {
            artist: song.artist,
            title: song.title,
            duration: song.duration,
            urls: song.urls,
            albumCoverUrl: coverUrl || song.videoThumbnailUrl,
          }
        })
      },
      addToQueue: async (song: Song) => {
        const state = get()

        const activeQueue = state.isShuffled ? state.shuffledQueue : state.queue

        const currentSongIndex = activeQueue.findIndex(
          (song) =>
            song.title === state.currentSong?.title &&
            song.artist === state.currentSong?.artist
        )

        const isSameAsCurrentSong =
          song.title === state.currentSong?.title &&
          song.artist === state.currentSong?.artist

        if (isSameAsCurrentSong) {
          toast.custom(() => <Toast message='❌ Song is already playing' />, {
            duration: 2500,
          })
          return
        }

        const newQueue = [...activeQueue]

        newQueue.splice(currentSongIndex + 1, 0, song)

        set((state) => {
          state.queue = newQueue
        })

        const shuffledQueue = [...state.shuffledQueue]

        shuffledQueue.splice(currentSongIndex + 1, 0, song)

        set((state) => {
          state.shuffledQueue = shuffledQueue
        })
      },

      queueIdentifier: '',
      setQueueIdentifier: (identifier: string) =>
        set((state) => {
          state.queueIdentifier = identifier
        }),
      repeatMode: 'none',
      setRepeatMode: (mode: 'none' | 'one' | 'all') =>
        set((state) => {
          state.repeatMode = mode
        }),
      toggleIsPlaying: () =>
        set((state) => {
          state.isPlaying = !state.isPlaying
        }),
    }))
  )
)

export const usePlayerProgressState = create<PlayerProgressState>()(
  devtools(
    immer((set) => ({
      progress: {
        playedSeconds: 0,
        played: 0,
      },
      setProgress: (progress) =>
        set((state) => {
          state.progress = progress
        }),
    }))
  )
)

const instanceRef = createRef<Omit<
  ReactPlayer,
  'refs'
> | null>() as React.MutableRefObject<Omit<ReactPlayer, 'refs'> | null>
instanceRef.current = null

export const usePlayerInstance = create<PlayerInstanceState>()(
  devtools(() => ({
    instance: instanceRef,
  }))
)
