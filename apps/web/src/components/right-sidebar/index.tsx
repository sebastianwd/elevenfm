'use client'

import { QueueListIcon } from '@heroicons/react/24/outline'
import { AnimatePresence, motion } from 'framer-motion'
import Link from 'next/link'
import { Fragment } from 'react'
import SimpleBar from 'simplebar-react'
import { useShallow } from 'zustand/react/shallow'

import { Button } from '~/components/button'
import { Song } from '~/components/song'
import { VideoPlayer } from '~/components/video-player'
import { usePlaySong } from '~/hooks/use-play-song'
import { useLayoutState } from '~/store/use-layout-state'
import { usePlayerState } from '~/store/use-player'
import { splitArtist } from '~/utils/song-title-utils'

const transition = {
  duration: 0.15,
} as const

export const RightSidebar = () => {
  const theaterMode = useLayoutState((state) => state.theaterMode)
  const rightSidebarOpen = useLayoutState((state) => state.rightSidebarOpen)
  const toggleRightSidebarOpen = useLayoutState(
    (state) => state.toggleRightSidebarOpen
  )
  const currentSong = usePlayerState((state) => state.currentSong)

  const { currentQueue } = usePlayerState(
    useShallow((state) => ({
      currentQueue: state.isShuffled ? state.shuffledQueue : state.queue,
    }))
  )

  const { onPlaySong } = usePlaySong({
    songs: currentQueue,
    songsIdentifier: '',
  })

  return (
    <>
      <AnimatePresence>
        {rightSidebarOpen && (
          <motion.div
            className='hidden xl:block'
            initial='hidden'
            exit='hidden'
            animate='show'
            transition={transition}
            variants={{
              hidden: {
                marginLeft: 0,
                opacity: 0,
              },
              show: {
                opacity: 1,
                marginLeft: '24rem',
              },
            }}
          />
        )}
      </AnimatePresence>
      <motion.div
        className='top-0 right-0 z-20 size-full [--media-transform:translateX(0%)] md:fixed md:w-96 md:px-0 md:[--media-transform:translateX(100%)]'
        animate={{
          transform: rightSidebarOpen
            ? 'translateX(0)'
            : 'var(--media-transform)',
        }}
        transition={transition}
      >
        <div className='top-0 right-0 flex h-full grow p-4 md:sticky md:bg-surface-950 md:p-0'>
          <div className='flex size-full flex-col px-4 md:py-7 md:pb-28 xl:pb-7'>
            {/* Close Button */}
            <div className='absolute top-4 left-4'></div>
            {/* Now Playing Section - Spotify Style */}
            {currentSong && (
              <div className='mb-2 hidden rounded-lg md:block'>
                <div className='flex flex-col space-y-4'>
                  {/* Song Info */}
                  <div className='flex gap-2'>
                    <Button
                      onClick={toggleRightSidebarOpen}
                      title='Close sidebar'
                      variant='ghost'
                      className='mt-1'
                    >
                      <QueueListIcon
                        className={`size-6 ${
                          rightSidebarOpen
                            ? 'text-primary-500'
                            : 'text-gray-200'
                        }`}
                      />
                    </Button>
                    <div className='flex flex-col'>
                      <h2 className='line-clamp-2 text-lg font-bold text-white'>
                        {currentSong.title}
                      </h2>
                      <div className='flex flex-wrap gap-1 text-sm text-gray-300'>
                        {splitArtist(currentSong.artist || '').map(
                          (artist, index, artists) => (
                            <Fragment key={artist}>
                              <Link
                                href={`/artist/${artist.trim()}`}
                                className='transition-colors hover:text-white hover:underline'
                              >
                                {artist.trim()}
                              </Link>
                              {index < artists.length - 1 ? ', ' : ''}
                            </Fragment>
                          )
                        )}
                      </div>
                    </div>
                  </div>

                  <div className='mt-1 space-y-3'>
                    <div className='text-center'>
                      <p className='text-xs tracking-wider text-gray-400 uppercase'>
                        Now Playing
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {/* Empty state when no song is playing */}
            {!currentSong && (
              <div className='mt-6 hidden flex-col items-center justify-center space-y-4 text-center md:flex'>
                <div className='space-y-2'>
                  <h3 className='text-lg font-medium text-gray-300'>
                    Nothing playing
                  </h3>
                  <p className='text-sm text-gray-500'>
                    Start playing a song to see it here
                  </p>
                </div>
              </div>
            )}
            {/* Video Player Section */}
            {currentSong && !theaterMode && (
              <AnimatePresence initial={false}>
                <motion.div
                  className='rounded-lg'
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                >
                  <div className='relative aspect-video h-fit w-full overflow-hidden rounded-lg bg-surface-800 p-2'>
                    <VideoPlayer />
                  </div>
                </motion.div>
              </AnimatePresence>
            )}

            {/* Queue Section */}

            <h3 className='mt-6 hidden rounded-t-lg bg-surface-800 px-4 py-2 text-sm font-semibold text-white md:block'>
              Next in queue
            </h3>
            <SimpleBar
              className='hidden h-full overflow-auto rounded-b-lg bg-surface-800 md:block [&.simplebar-scrollable-y]:pr-4'
              classNames={{
                scrollbar: 'bg-primary-500 w-1 rounded',
              }}
            >
              {currentQueue.length === 0 ? (
                <div className='flex h-24 items-center justify-center'>
                  <span className='text-surface-200'>Queue is empty</span>
                </div>
              ) : (
                <ul className='flex flex-col'>
                  <AnimatePresence initial={false}>
                    {currentQueue.map((song, index) => (
                      <motion.li
                        key={song.title + song.artist}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0.25, height: 0 }}
                        transition={{
                          duration: 0.2,
                          ease: 'easeOut',
                        }}
                        layoutId={song.title + song.artist}
                      >
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
                            onPlaySong({
                              artist: song.artist,
                              title: song.title,
                              songUrl: song.urls ? song.urls[0] : undefined,
                            })
                          }
                        />
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              )}
            </SimpleBar>
          </div>
        </div>
      </motion.div>
    </>
  )
}
