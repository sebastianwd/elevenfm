import dynamic from 'next/dynamic'
import { useCallback, useLayoutEffect } from 'react'
import type ReactPlayer from 'react-player'

import {
  usePlayerInstance,
  usePlayerProgressState,
  usePlayerState,
} from '~/store/use-player'

const DynamicReactPlayer = dynamic(() => import('react-player/lazy'), {
  ssr: false,
})

export const VideoPlayer = () => {
  const { isPlaying, setIsPlaying, currentSong, setDuration, playNext } =
    usePlayerState()

  const { instance } = usePlayerInstance()

  const playedProgress = usePlayerProgressState(
    (state) => state.progress.played
  )

  const setPlayerProgress = usePlayerProgressState((state) => state.setProgress)

  const onPlayerPlay = useCallback(() => {
    if (!currentSong) {
      return
    }

    setIsPlaying(true)
  }, [currentSong, setIsPlaying])

  const onPlayerEnd = useCallback(() => {
    playNext()
  }, [playNext])

  const onPlayerPause = useCallback(() => {
    setIsPlaying(false)
  }, [setIsPlaying])

  const onPlayerProgress = useCallback(
    (options: { playedSeconds: number; played: number }) => {
      console.log('onPlayerProgress')
      setPlayerProgress({
        playedSeconds: options.playedSeconds,
        played: options.played,
      })
    },
    [setPlayerProgress]
  )

  const updatePlayerProgress = useCallback(
    (node: Omit<ReactPlayer, 'refs'>) => {
      console.log('updatePlayerProgress')
      if (isPlaying && playedProgress !== 0) {
        node.seekTo(playedProgress, 'fraction')
      }
    },
    [isPlaying, playedProgress]
  )

  useLayoutEffect(() => {
    if (instance.current) {
      updatePlayerProgress(instance.current)
    }
  }, [instance.current])

  return (
    <DynamicReactPlayer
      width='100%'
      height='100%'
      style={{ minHeight: 48 }}
      playing={isPlaying}
      url={currentSong?.url}
      controls
      onPlay={onPlayerPlay}
      onPause={onPlayerPause}
      onEnded={onPlayerEnd}
      stopOnUnmount={false}
      progressInterval={500}
      onProgress={onPlayerProgress}
      onDuration={(duration) => {
        if (!currentSong) {
          return
        }

        setDuration(duration)
      }}
      onReady={(node: Omit<ReactPlayer, 'refs'>) => {
        // @ts-expect-error - hide from redux devtools for performance
        node.toJSON = () => ({ hidden: 'to help redux devtools :)' })

        instance.current = node
      }}
    />
  )
}
