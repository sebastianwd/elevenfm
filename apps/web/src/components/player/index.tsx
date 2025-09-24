'use client'

import { QueueListIcon } from '@heroicons/react/24/outline'
import { PauseCircleIcon, PlayCircleIcon } from '@heroicons/react/24/solid'
import { orpc } from '@repo/api/lib/orpc.client'
import { useQuery } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import Link from 'next/link'
import { type ChangeEvent, Fragment, useCallback, useState } from 'react'
import SimpleBar from 'simplebar-react'
import { twMerge } from 'tailwind-merge'
import { useShallow } from 'zustand/react/shallow'

import { usePlaySong } from '~/hooks/use-play-song'
import { useLayoutState } from '~/store/use-layout-state'
import { useLocalSettings } from '~/store/use-local-settings'
import type { Song as SongType } from '~/store/use-player'
import {
  usePlayerInstance,
  usePlayerProgressState,
  usePlayerState,
} from '~/store/use-player'
import type { PlayableSong } from '~/types'
import { sanitizeSongTitle, splitArtist } from '~/utils/song-title-utils'

import { Button } from '../button'
import {
  LyricsIcon,
  NextIcon,
  PreviousIcon,
  RandomIcon,
  RepeatIcon,
  RepeatOneIcon,
  TheaterModeIcon,
} from '../icons'
import { WavesLoader } from '../loader'
import { RangeSlider } from '../range-slider'
import { Song } from '../song'

const formatSeconds = (seconds: number) => {
  // format time and consider adding 0 if less than 10
  const minutes = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)

  return `${minutes}:${secs < 10 ? '0' : ''}${secs}`
}

interface QueueListProps {
  queue: SongType[]
  onPlay: (song: PlayableSong) => void
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      duration: 0.1,
    },
  },
}

const QueueList = (props: QueueListProps) => {
  const { queue, onPlay } = props

  const currentSong = usePlayerState((state) => state.currentSong)

  const renderContent = () => {
    if (queue.length === 0) {
      return (
        <div className='flex h-[36rem] items-center justify-center'>
          <p className='text-gray-400'>Queue is empty</p>
        </div>
      )
    }

    return queue.map((song, index) => {
      return (
        <li key={song.title + index}>
          <Song
            artist={song.artist}
            song={song.title}
            songUrl={song.urls ? song.urls[0] : undefined}
            position={index + 1}
            isQueue
            isPlaying={
              currentSong?.title === song.title &&
              currentSong.artist === song.artist
            }
            onClick={() =>
              onPlay({
                artist: song.artist,
                title: song.title,
                songUrl: song.urls ? song.urls[0] : undefined,
              })
            }
          />
        </li>
      )
    })
  }

  return (
    <motion.div
      className='rounded-lg border border-b-0 border-solid border-surface-700 bg-surface-950'
      initial='hidden'
      exit='hidden'
      animate='show'
      variants={container}
    >
      <h3 className='px-5 py-3 text-lg font-semibold'>Queue</h3>
      <SimpleBar
        className='h-[36rem] overflow-auto pr-4'
        classNames={{
          scrollbar: 'bg-primary-500 w-1 rounded',
        }}
      >
        <ul>{renderContent()}</ul>
      </SimpleBar>
    </motion.div>
  )
}

interface LyricsProps {
  song: string
  artist: string
  className?: string
}

export const Lyrics = (props: LyricsProps) => {
  const { artist, song } = props

  const { data, isLoading } = useQuery(
    orpc.song.lyrics.queryOptions({
      input: {
        artist: splitArtist(artist)[0]!.trim(),
        song: sanitizeSongTitle(song),
      },
      retry: 2,
      staleTime: Infinity,
      gcTime: Infinity,
      enabled: Boolean(song && artist),
    })
  )

  const lyrics = data?.lyrics

  //const scrollableNodeRef = useRef<SimpleBarCore>(null)

  /*const { playerProgress } = usePlayerProgressState((state) => ({
    playerProgress: state.progress,
  }))

  useEffect(() => {
    const el = scrollableNodeRef.current?.getScrollElement()
    if (el && playerProgress.played) {
      const scrollAmount =
        playerProgress.played < 0.1
          ? 0
          : playerProgress.played > 0.8
            ? 1
            : playerProgress.played

      el.scroll({
        top: (el.scrollHeight - el.clientHeight) * round(scrollAmount, 1),
        behavior: 'smooth',
      })
    }
  }, [playerProgress])*/

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className='flex h-[36rem] items-center justify-center'>
          <WavesLoader />
        </div>
      )
    }

    if (!lyrics) {
      return (
        <div className='flex h-[36rem] items-center justify-center'>
          <p className='text-gray-300'>
            {song && artist ? 'Lyrics not found' : 'Play a song to view lyrics'}
          </p>
        </div>
      )
    }

    return (
      <pre className='overflow-auto px-4 py-2 text-lg whitespace-pre-line'>
        {lyrics}
      </pre>
    )
  }

  return (
    <motion.div
      className='h-full rounded-lg border border-b-0 border-solid border-surface-700 bg-surface-950'
      initial='hidden'
      exit='hidden'
      animate='show'
      variants={container}
    >
      <h3 className='px-5 py-3 text-lg font-semibold'>{song}</h3>
      <SimpleBar
        className={twMerge(`h-[36rem] overflow-auto pr-4`, props.className)}
        classNames={{
          scrollbar: 'bg-primary-500 w-1 rounded',
        }}
      >
        {renderContent()}
      </SimpleBar>
    </motion.div>
  )
}

export const FooterPlayer = () => {
  const {
    isPlaying,
    setIsPlaying,
    currentSong,
    duration,
    playNext,
    playPrevious,
    isShuffled,
    setShuffle,
  } = usePlayerState()

  const { progress } = usePlayerProgressState()

  const { instance } = usePlayerInstance()

  const theaterMode = useLayoutState((state) => state.theaterMode)
  const setTheaterMode = useLayoutState((state) => state.setTheaterMode)
  const rightSidebarQueueOpen = useLayoutState(
    (state) => state.rightSidebarOpen
  )
  const toggleRightSidebarOpen = useLayoutState(
    (state) => state.toggleRightSidebarOpen
  )

  const onChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      instance.current?.seekTo(Number(e.target.value) / 100, 'fraction')
    },
    [instance]
  )

  const { queueIdentifier, currentQueue, repeatMode, setRepeatMode } =
    usePlayerState(
      useShallow((state) => ({
        queueIdentifier: state.queueIdentifier,
        currentQueue: state.isShuffled ? state.shuffledQueue : state.queue,
        repeatMode: state.repeatMode,
        setRepeatMode: state.setRepeatMode,
      }))
    )

  const toggleShuffledPlaylist = useLocalSettings(
    (state) => state.toggleShuffledPlaylist
  )

  const [showQueue, setShowQueue] = useState(false)
  const [showLyrics, setShowLyrics] = useState(false)

  const { onPlaySong } = usePlaySong({
    songs: currentQueue,
    songsIdentifier: '',
  })

  const onShuffleToggle = useCallback(() => {
    if (queueIdentifier) {
      toggleShuffledPlaylist(queueIdentifier)
    }

    setShuffle(!isShuffled)
  }, [isShuffled, queueIdentifier, setShuffle, toggleShuffledPlaylist])

  return (
    <>
      <div className='fixed bottom-28 left-0 z-40 mx-auto max-h-screen w-full md:right-4 md:w-1/2 lg:w-1/3'>
        <AnimatePresence>
          {showLyrics ? (
            <Lyrics
              artist={currentSong?.artist || ''}
              song={currentSong?.title || ''}
            />
          ) : null}
        </AnimatePresence>
      </div>
      <div className='fixed right-0 bottom-28 z-40 max-h-screen w-full md:w-1/2 lg:w-1/3'>
        <AnimatePresence>
          {showQueue ? (
            <QueueList queue={currentQueue} onPlay={onPlaySong} />
          ) : null}
        </AnimatePresence>
      </div>
      <footer className='fixed bottom-6 left-1/2 z-40 -translate-x-1/2 bg-transparent'>
        <div className='relative mx-auto flex max-w-5xl flex-col items-center gap-3 rounded border border-surface-700 bg-surface-400/20 px-3 py-2 text-white shadow-xl backdrop-blur-md md:flex-row md:gap-4 md:rounded-full md:px-6 md:py-3'>
          {/* Left: Album Art + Track Info */}
          <div className='flex items-center gap-3'>
            <div className='flex shrink-0 items-center'>
              {currentSong ? (
                <img
                  src={currentSong.albumCoverUrl || '/cover-placeholder.png'}
                  width={40}
                  height={40}
                  alt='album cover'
                  className='size-10 rounded-md object-cover'
                />
              ) : null}
            </div>
            <div className='flex min-w-0 flex-col justify-center'>
              <h1 className='truncate text-sm font-medium text-gray-100'>
                {currentSong?.title}
              </h1>
              <div className='truncate text-xs text-zinc-300'>
                {splitArtist(currentSong?.artist || '').map(
                  (artist, index, artists) => (
                    <Fragment key={artist}>
                      <Link
                        href={`/artist/${artist.trim()}`}
                        className='hover:underline'
                      >
                        {artist.trim()}
                      </Link>
                      {index < artists.length - 1 ? ',\u00a0' : ''}
                    </Fragment>
                  )
                )}
              </div>
            </div>
          </div>
          {/* Center: Progress Bar + Time */}
          <div className='flex w-full items-center gap-3 md:w-58 md:flex-1'>
            <RangeSlider
              max={100}
              min={0}
              disabled={!currentSong}
              value={progress.played * 100}
              onChange={onChange}
              minLabel={`${formatSeconds(progress.playedSeconds)}`}
              maxLabel={`${formatSeconds(duration)}`}
              className='flex-1'
            />
          </div>
          {/* Right: Controls */}
          <div className='flex items-center gap-2'>
            <Button
              variant='ghost'
              className='p-1'
              title='Shuffle'
              onClick={onShuffleToggle}
            >
              <RandomIcon
                className={`size-5 ${isShuffled ? 'text-primary-500' : ''}`}
              />
            </Button>
            <Button
              variant='ghost'
              className='p-1'
              disabled={!currentSong}
              title='Previous'
              onClick={() => {
                if (!currentSong) return
                playPrevious()
              }}
            >
              <PreviousIcon className='size-8' />
            </Button>
            <Button
              variant='ghost'
              className='p-1'
              disabled={!currentSong}
              title='Play/Pause'
              onClick={() => {
                if (!currentSong) return
                setIsPlaying(!isPlaying)
              }}
            >
              {isPlaying ? (
                <PauseCircleIcon className='size-10 text-primary-500' />
              ) : (
                <PlayCircleIcon className='size-10' />
              )}
            </Button>
            <Button
              variant='ghost'
              className='p-1'
              title='Next'
              disabled={!currentSong}
              onClick={() => {
                if (!currentSong) return
                playNext()
              }}
            >
              <NextIcon className='size-8' />
            </Button>
            <Button
              onClick={() => {
                setRepeatMode(
                  repeatMode === 'none'
                    ? 'all'
                    : repeatMode === 'all'
                      ? 'one'
                      : 'none'
                )
              }}
              variant='ghost'
              title='Repeat'
              className='p-1'
            >
              {repeatMode === 'none' ? (
                <RepeatIcon className='size-6' />
              ) : repeatMode === 'all' ? (
                <RepeatIcon className='size-6 text-primary-500' />
              ) : (
                <RepeatOneIcon className='size-6 text-primary-500' />
              )}
            </Button>

            <Button
              onClick={() => {
                setShowLyrics(!showLyrics)
              }}
              className='inline-flex p-1'
              title='Lyrics'
              variant='ghost'
            >
              <LyricsIcon
                className={`size-6.5 ${
                  showLyrics ? 'text-primary-500' : 'text-gray-200'
                }`}
              />
            </Button>
            <Button
              onClick={() => {
                setTheaterMode(!theaterMode)
              }}
              className='inline-flex p-1'
              title='Theater Mode'
              variant='ghost'
            >
              <TheaterModeIcon
                className={`size-5.5 ${
                  theaterMode ? 'text-primary-500' : 'text-gray-200'
                }`}
              />
            </Button>
            <Button
              onClick={() => {
                setShowQueue(!showQueue)
              }}
              className='inline-flex p-1 md:hidden'
              title='Queue'
              variant='ghost'
            >
              <QueueListIcon
                className={`size-6 ${
                  showQueue ? 'text-primary-500' : 'text-gray-200'
                }`}
              />
            </Button>
            <Button
              onClick={toggleRightSidebarOpen}
              className='hidden p-1 md:inline-flex'
              title='Queue Sidebar'
              variant='ghost'
            >
              <QueueListIcon
                className={`size-7 ${
                  rightSidebarQueueOpen ? 'text-primary-500' : 'text-gray-200'
                }`}
              />
            </Button>
          </div>
        </div>
      </footer>
    </>
  )
}
