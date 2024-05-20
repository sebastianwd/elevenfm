import { QueueListIcon } from '@heroicons/react/24/outline'
import { PauseCircleIcon, PlayCircleIcon } from '@heroicons/react/24/solid'
import { useQuery } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import { head } from 'lodash'
import { type ChangeEvent, useCallback, useRef, useState } from 'react'
import type SimpleBarCore from 'simplebar-core'
import SimpleBar from 'simplebar-react'
import { twMerge } from 'tailwind-merge'

import { getLyricsQuery, getVideoInfoQuery, queryClient } from '~/api'
import { useLayoutState } from '~/store/use-layout-state'
import {
  Song as SongType,
  usePlayerInstance,
  usePlayerProgressState,
  usePlayerState,
} from '~/store/use-player'
import { useLocalSettings } from '~/store/user-local-settings'

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
  onPlay: (song: string, artist: string) => void
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
        <div className='flex justify-center items-center h-[36rem]'>
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
            isPlaying={
              currentSong?.title === song.title &&
              currentSong?.artist === song.artist
            }
            onClick={() => onPlay(song.title, song.artist)}
          />
        </li>
      )
    })
  }

  return (
    <motion.div
      className='bg-surface-950 rounded-lg'
      initial='hidden'
      exit='hidden'
      animate='show'
      variants={container}
    >
      <h3 className='font-semibold text-lg px-5 py-3'>Queue</h3>
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

  const { data, isLoading } = useQuery({
    queryKey: ['getLyricsQuery', song, artist],
    queryFn: () =>
      getLyricsQuery({
        song: song.replace(/\(|\)/g, ''),
        artist: head(artist.split(','))?.trim() || '',
      }),
    staleTime: Infinity,
    gcTime: Infinity,
    enabled: Boolean(song && artist),
  })

  const lyrics = data?.getLyrics?.lyrics

  const scrollableNodeRef = useRef<SimpleBarCore>(null)

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
        <div className='flex justify-center items-center h-[36rem]'>
          <WavesLoader />
        </div>
      )
    }

    if (!lyrics) {
      return (
        <div className='flex justify-center items-center h-[36rem]'>
          <p className='text-gray-300'>
            {song && artist ? 'Lyrics not found' : 'Play a song to view lyrics'}
          </p>
        </div>
      )
    }

    return (
      <SimpleBar
        ref={scrollableNodeRef}
        className={twMerge(`h-[36rem] overflow-auto pr-4`, props.className)}
        classNames={{
          scrollbar: 'bg-primary-500 w-1 rounded',
        }}
      >
        <pre className='whitespace-pre-line px-4 py-2 text-lg'>{lyrics}</pre>{' '}
      </SimpleBar>
    )
  }

  return (
    <motion.div
      className='bg-surface-950 rounded-lg h-full'
      initial='hidden'
      exit='hidden'
      animate='show'
      variants={container}
    >
      <h3 className='font-semibold text-lg px-5 py-3'>{song}</h3>
      {renderContent()}
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
    setCurrentSong,
  } = usePlayerState()

  const { progress } = usePlayerProgressState()

  const { instance } = usePlayerInstance()

  const { theaterMode, setTheaterMode } = useLayoutState((state) => ({
    theaterMode: state.theaterMode,
    setTheaterMode: state.setTheaterMode,
  }))

  const onChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      instance.current?.seekTo(Number(e.target.value) / 100, 'fraction')
    },
    [instance]
  )

  const { queueIdentifier, currentQueue, repeatMode, setRepeatMode } =
    usePlayerState((state) => ({
      queueIdentifier: state.queueIdentifier,
      currentQueue: state.isShuffled ? state.shuffledQueue : state.queue,
      repeatMode: state.repeatMode,
      setRepeatMode: state.setRepeatMode,
    }))

  const { toggleShuffledPlaylist } = useLocalSettings((state) => ({
    toggleShuffledPlaylist: state.toggleShuffledPlaylist,
  }))

  const [showQueue, setShowQueue] = useState(false)
  const [showLyrics, setShowLyrics] = useState(false)

  const onPlaySong = useCallback(
    async (song: string, artist: string) => {
      const data = await queryClient.fetchQuery({
        queryKey: ['getVideoInfo', `${artist} - ${song}`],
        queryFn: () => getVideoInfoQuery({ query: `${artist} - ${song}` }),
        staleTime: Infinity,
        gcTime: Infinity,
      })

      const urls = data.getVideoInfo?.map((video) => video.videoId)

      setCurrentSong({
        artist,
        title: song,
        urls,
        videoThumbnailUrl: head(data.getVideoInfo)?.thumbnailUrl,
      })

      setIsPlaying(true)
    },
    [setCurrentSong, setIsPlaying]
  )

  const onShuffleToggle = useCallback(() => {
    if (queueIdentifier) {
      toggleShuffledPlaylist(queueIdentifier)
    }

    setShuffle(!isShuffled)
  }, [isShuffled, queueIdentifier, setShuffle, toggleShuffledPlaylist])

  return (
    <>
      <div className='fixed bottom-28 left-0 mx-auto md:right-4 max-h-screen w-full md:w-1/2 lg:w-1/3 z-40'>
        <AnimatePresence>
          {showLyrics ? (
            <Lyrics
              artist={currentSong?.artist || ''}
              song={currentSong?.title || ''}
            />
          ) : null}
        </AnimatePresence>
      </div>
      <div className='fixed bottom-28 right-0 max-h-screen w-full md:w-1/2 lg:w-1/3 z-40'>
        <AnimatePresence>
          {showQueue ? (
            <QueueList queue={currentQueue} onPlay={onPlaySong} />
          ) : null}
        </AnimatePresence>
      </div>
      <footer className='fixed bottom-0 mt-auto h-28 w-full bg-surface-900 bg-opacity-20 backdrop-blur-lg z-40'>
        <div className='mx-auto p-4 md:p-5 pb-0 md:pb-5 text-white grid grid-cols-3 relative'>
          <div className='flex gap-2 md:gap-4 col-span-1'>
            <div className='flex items-center shrink-0'>
              {currentSong ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={currentSong?.albumCoverUrl || '/cover-placeholder.png'}
                  width={56}
                  height={56}
                  alt='album cover'
                  className='object-cover rounded-md w-9 md:w-14 md:h-14 grow'
                />
              ) : null}
            </div>
            <div className='flex justify-center flex-col'>
              <h1 className='text-gray-100 text-sm md:text-base font-medium mb-0.5 line-clamp-1'>
                {currentSong?.title}
              </h1>
              <div className='flex text-xs md:text-sm text-zinc-300'>
                {currentSong?.artist}
              </div>
            </div>
          </div>
          <div className='col-span-2 md:col-span-1'>
            <div className='flex items-center justify-end md:justify-center gap-1 md:gap-4 mb-3'>
              <Button
                variant='ghost'
                className='p-0'
                title='Shuffle'
                onClick={onShuffleToggle}
              >
                <RandomIcon
                  className={`h-6 w-6 ${isShuffled ? 'text-primary-500' : ''}`}
                />
              </Button>
              <Button
                variant='ghost'
                className='p-0'
                disabled={!currentSong}
                title='Previous'
                onClick={() => {
                  if (!currentSong) {
                    return
                  }
                  playPrevious()
                }}
              >
                <PreviousIcon className='h-8 w-8' />
              </Button>
              <Button
                variant='ghost'
                className='p-0'
                disabled={!currentSong}
                title='Play/Pause'
                onClick={() => {
                  if (!currentSong) {
                    return
                  }

                  setIsPlaying(!isPlaying)
                }}
              >
                {isPlaying ? (
                  <PauseCircleIcon className='h-12 w-12 text-primary-500' />
                ) : (
                  <PlayCircleIcon className='h-12 w-12' />
                )}
              </Button>
              <Button
                variant='ghost'
                title='Next'
                disabled={!currentSong}
                className='p-0'
                onClick={() => {
                  if (!currentSong) {
                    return
                  }
                  playNext()
                }}
              >
                <NextIcon className='h-8 w-8' />
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
                className='p-0'
              >
                {repeatMode === 'none' ? (
                  <RepeatIcon className='h-6 w-6' />
                ) : repeatMode === 'all' ? (
                  <RepeatIcon className='h-6 w-6 text-primary-500' />
                ) : (
                  <RepeatOneIcon className='h-6 w-6 text-primary-500' />
                )}
              </Button>
              <div className='w-2' />
              <button
                onClick={() => {
                  setShowLyrics(!showLyrics)
                }}
                className='md:hidden inline-flex'
                title='Lyrics'
                type='button'
              >
                <LyricsIcon
                  className={`h-6 w-6 ${
                    showLyrics ? 'text-primary-500' : 'text-gray-200'
                  }`}
                />
              </button>
              <button
                onClick={() => {
                  setShowQueue(!showQueue)
                }}
                className='md:hidden inline-flex'
              >
                <QueueListIcon
                  className={`h-6 w-6 ${
                    showQueue ? 'text-primary-500' : 'text-gray-200'
                  }`}
                />
              </button>
            </div>
            <RangeSlider
              max={100}
              min={0}
              disabled={!currentSong}
              value={progress.played * 100}
              onChange={onChange}
              minLabel={`${formatSeconds(progress.playedSeconds)}`}
              maxLabel={`${formatSeconds(duration)}`}
              className='absolute md:relative w-full left-0 md:w-auto md:left-auto md:px-0 px-4'
            />
          </div>
          <div className='hidden items-center justify-end md:flex gap-3'>
            <button
              onClick={() => {
                setTheaterMode(!theaterMode)
              }}
              className='inline-flex'
              title='Theater Mode'
              type='button'
            >
              <TheaterModeIcon
                className={`h-5 w-5 ${
                  theaterMode ? 'text-primary-500' : 'text-gray-200'
                }`}
              />
            </button>
            <button
              onClick={() => {
                setShowLyrics(!showLyrics)
              }}
              className='inline-flex'
              title='Lyrics'
              type='button'
            >
              <LyricsIcon
                className={`h-6 w-6 ${
                  showLyrics ? 'text-primary-500' : 'text-gray-200'
                }`}
              />
            </button>
            <button
              onClick={() => {
                setShowQueue(!showQueue)
              }}
              className='inline-flex'
              title='Queue'
              type='button'
            >
              <QueueListIcon
                className={`h-6 w-6 ${
                  showQueue ? 'text-primary-500' : 'text-gray-200'
                }`}
              />
            </button>
          </div>
        </div>
      </footer>
    </>
  )
}
