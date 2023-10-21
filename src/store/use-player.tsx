import { head, random, sortBy } from 'lodash'
import { createRef } from 'react'
import type ReactPlayer from 'react-player'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

import { getAlbumBySongQuery, getVideoInfoQuery, queryClient } from '~/api'

export type Song = {
  title: string
  artist: string
  albumCoverUrl?: string
  duration?: number
  url?: string
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
  shuffledQueue: Song[]
  setQueue: (queue: Song[]) => void
  playNext: () => void
  playPrevious: () => void
  isShuffled: boolean
  setShuffle: (random: boolean) => void
  addToQueue: (song: Song) => void
}

interface PlayerInstanceState {
  instance: React.MutableRefObject<Omit<ReactPlayer, 'refs'> | null>
}

const getAlbum = async (song: Song) => {
  if (song.albumCoverUrl) {
    return
  }

  const data = await queryClient.fetchQuery(
    ['album', `${song.artist} - ${song.title}`],
    () => getAlbumBySongQuery({ artist: song.artist, song: song.title }),
    { cacheTime: Infinity, staleTime: Infinity }
  )

  return data.getAlbumBySong
}

const getVideoInfo = async (song: Song) => {
  const data = await queryClient.fetchQuery(
    ['getVideoInfo', `${song.artist} - ${song.title}`],
    () => getVideoInfoQuery({ query: `${song.artist} - ${song.title}` }),
    { cacheTime: Infinity, staleTime: Infinity }
  )

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
      playNext: async () => {
        const state = get()

        const activeQueue = state.isShuffled ? state.shuffledQueue : state.queue

        const currentSongIndex = activeQueue.findIndex(
          (song) =>
            song.title === state.currentSong?.title &&
            song.artist === state.currentSong?.artist
        )

        const nextSong = state.isShuffled
          ? state.shuffledQueue[currentSongIndex + 1]
          : state.queue[currentSongIndex + 1]

        if (nextSong) {
          const data = await getVideoInfo(nextSong)

          const sample = head(data)

          await state.setCurrentSong({
            artist: nextSong.artist,
            title: nextSong.title,
            url: `https://www.youtube.com/watch?v=${sample?.videoId}`,
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
          const data = await getVideoInfo(previousSong)

          const sample = head(data)

          await state.setCurrentSong({
            artist: previousSong.artist,
            title: previousSong.title,
            url: `https://www.youtube.com/watch?v=${sample?.videoId}`,
          })
        }
      },
      setDuration: (duration: number) =>
        set((state) => {
          state.duration = duration
        }),
      setCurrentSong: async (song: Song) => {
        set((state) => {
          state.currentSong = song
        })

        const coverUrl = song.albumCoverUrl || (await getAlbum(song))?.coverUrl

        set((state) => {
          state.currentSong = {
            artist: song.artist,
            title: song.title,
            duration: song.duration,
            url: song.url,
            albumCoverUrl: coverUrl,
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
