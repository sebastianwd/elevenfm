import { orpc, queryClient } from '@repo/api/lib/orpc.client'
import { getMainArtist } from '@repo/utils/song-title-utils'
import { head, shuffle } from 'es-toolkit'
import { isEmpty } from 'es-toolkit/compat'
import { createRef } from 'react'
import type ReactPlayer from 'react-player'
import { toast } from 'sonner'
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

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
  removeFromQueue: (song: Song) => void
  repeatMode: 'none' | 'one' | 'all'
  setRepeatMode: (mode: 'none' | 'one' | 'all') => void
  toggleIsPlaying: () => void
  volume: number
  setVolume: (volume: number) => void
  toggleMute: () => void
}

interface PlayerInstanceState {
  instance: React.RefObject<Omit<ReactPlayer, 'refs'> | null>
}

const getAlbum = async (song: Song) => {
  if (song.albumCoverUrl) {
    return
  }

  const data = await queryClient.fetchQuery(
    orpc.song.album.queryOptions({
      input: { artist: song.artist, song: song.title },
      gcTime: Infinity,
      staleTime: Infinity,
    })
  )

  return data
}

const getVideoInfo = async (song: Song) => {
  const videoSearchQuery = `${getMainArtist(song.artist)} - ${song.title}`

  const data = await queryClient.fetchQuery(
    orpc.song.videoInfo.queryOptions({
      input: { query: videoSearchQuery },
      retry: 2,
      staleTime: Infinity,
      gcTime: Infinity,
    })
  )

  return data
}

export const usePlayerState = create<PlayerState>()(
  devtools(
    immer(
      persist(
        (set, get) => ({
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

              const shuffledSongs = shuffle(songsWithoutCurrent)

              state.shuffledQueue = [currentSong, ...shuffledSongs]
            }),
          isShuffled: false,
          setQueue: (queue: Song[]) =>
            set((state) => {
              state.queue = queue

              const currentSong = state.currentSong

              if (currentSong) {
                const songsWithoutCurrent = queue.filter(
                  (song) =>
                    song.title !== currentSong.title ||
                    (song.title === currentSong.title &&
                      song.artist !== currentSong.artist)
                )

                const shuffledSongs = shuffle(songsWithoutCurrent)

                state.shuffledQueue = [currentSong, ...shuffledSongs]
              }
            }),
          playNext: async (options = { isUserAction: true }) => {
            const state = get()

            const activeQueue = state.isShuffled
              ? state.shuffledQueue
              : state.queue

            const currentSongIndex = activeQueue.findIndex(
              (song) =>
                song.title === state.currentSong?.title &&
                song.artist === state.currentSong.artist
            )

            const getNextSong = () => {
              if (!options.isUserAction) {
                if (state.repeatMode === 'one')
                  return activeQueue[currentSongIndex]
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
                  videoUrls: data.map((item) => item.videoUrl),
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

            const activeQueue = state.isShuffled
              ? state.shuffledQueue
              : state.queue

            const currentSongIndex = activeQueue.findIndex(
              (song) =>
                song.title === state.currentSong?.title &&
                song.artist === state.currentSong.artist
            )

            const previousSong = state.isShuffled
              ? state.shuffledQueue[currentSongIndex - 1]
              : state.queue[currentSongIndex - 1]

            if (previousSong) {
              const getVideoData = async () => {
                const data = await getVideoInfo(previousSong)

                return {
                  thumbnailUrl: head(data)?.thumbnailUrl,
                  videoUrls: data.map((item) => item.videoUrl),
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

            const coverUrl =
              song.albumCoverUrl || (await getAlbum(song))?.coverUrl

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
          addToQueue: (song: Song) => {
            const state = get()

            const activeQueue = state.isShuffled
              ? state.shuffledQueue
              : state.queue

            const isSameAsCurrentSong =
              song.title === state.currentSong?.title &&
              song.artist === state.currentSong.artist

            if (isSameAsCurrentSong) {
              toast.custom(
                () => <Toast message='❌ Song is already playing' />,
                {
                  duration: 2500,
                }
              )
              return
            }

            const songAlreadyInQueueIndex = activeQueue.findIndex(
              (queueSong) =>
                queueSong.title === song.title &&
                queueSong.artist === song.artist
            )

            set((state) => {
              const updatedQueue =
                songAlreadyInQueueIndex > -1
                  ? activeQueue.toSpliced(songAlreadyInQueueIndex, 1)
                  : activeQueue

              const currentSongIndex = updatedQueue.findIndex(
                (song) =>
                  song.title === state.currentSong?.title &&
                  song.artist === state.currentSong.artist
              )

              state.queue = updatedQueue.toSpliced(
                currentSongIndex + 1,
                0,
                song
              )
            })
          },
          removeFromQueue: (song: Song) => {
            const state = get()

            const removeShuffledQueueIndex = state.shuffledQueue.findIndex(
              (queueSong) =>
                queueSong.title === song.title &&
                queueSong.artist === song.artist
            )
            const removeQueueIndex = state.queue.findIndex(
              (queueSong) =>
                queueSong.title === song.title &&
                queueSong.artist === song.artist
            )

            set((state) => {
              state.queue = state.queue.toSpliced(removeQueueIndex, 1)
              state.shuffledQueue = state.shuffledQueue.toSpliced(
                removeShuffledQueueIndex,
                1
              )
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
          volume: 0.8,
          setVolume: (volume: number) =>
            set((state) => {
              state.volume = volume
            }),
          toggleMute: () =>
            set((state) => {
              if (state.volume === 0) {
                state.volume = 0.8 // Restore to default volume
              } else {
                state.volume = 0 // Mute
              }
            }),
        }),
        {
          name: 'player-state',
          partialize: (state) => ({
            currentSong: state.currentSong,
            duration: state.duration,
            queue: state.queue,
            shuffledQueue: state.shuffledQueue,
            isShuffled: state.isShuffled,
            queueIdentifier: state.queueIdentifier,
            repeatMode: state.repeatMode,
            volume: state.volume,
          }),
        }
      )
    )
  )
)

export const usePlayerProgressState = create<PlayerProgressState>()(
  devtools(
    immer(
      persist(
        (set) => ({
          progress: {
            playedSeconds: 0,
            played: 0,
          },
          setProgress: (progress) =>
            set((state) => {
              state.progress = progress
            }),
        }),
        {
          name: 'player-progress-state',
          partialize: (state) => ({
            progress: state.progress,
          }),
          storage: {
            getItem: (name) => {
              const str = localStorage.getItem(name)
              return str ? JSON.parse(str) : null
            },
            setItem: (name, value) => {
              // Only persist if it's been 10+ seconds since last persistence
              const lastPersisted = localStorage.getItem(
                `${name}_last_persisted`
              )
              const now = Date.now()

              if (!lastPersisted || now - parseInt(lastPersisted) >= 10000) {
                localStorage.setItem(name, JSON.stringify(value))
                localStorage.setItem(`${name}_last_persisted`, now.toString())
              }
            },
            removeItem: (name) => {
              localStorage.removeItem(name)
              localStorage.removeItem(`${name}_last_persisted`)
            },
          },
        }
      )
    )
  )
)

const instanceRef = createRef<Omit<ReactPlayer, 'refs'> | null>()
instanceRef.current = null

export const usePlayerInstance = create<PlayerInstanceState>()(
  devtools(() => ({
    instance: instanceRef,
  }))
)
