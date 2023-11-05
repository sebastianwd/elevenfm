import dynamic from 'next/dynamic'
import { memo, useCallback } from 'react'
import type ReactPlayer from 'react-player'

import { useLayoutState } from '~/store/use-layout-state'
import {
  usePlayerInstance,
  usePlayerProgressState,
  usePlayerState,
} from '~/store/use-player'

const DynamicReactPlayer = dynamic(() => import('react-player/lazy'), {
  ssr: false,
})

const VideoPlayer = memo(() => {
  const { isPlaying, setIsPlaying, currentSong, setDuration, playNext } =
    usePlayerState()

  const { instance } = usePlayerInstance()

  const playedProgress = usePlayerProgressState(
    (state) => state.progress.played
  )

  const setPlayerProgress = usePlayerProgressState((state) => state.setProgress)

  const videoPosition = useLayoutState((state) => state.videoPosition)

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
      setPlayerProgress({
        playedSeconds: options.playedSeconds,
        played: options.played,
      })
    },
    [setPlayerProgress]
  )

  const updatePlayerProgress = useCallback(
    (node: Omit<ReactPlayer, 'refs'>) => {
      if (playedProgress !== 0) {
        node.seekTo(playedProgress, 'fraction')
      }
    },
    [playedProgress]
  )

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
      position={videoPosition}
      onDuration={(duration) => {
        if (!currentSong) {
          return
        }

        setDuration(duration)
      }}
      onReady={(node: Omit<ReactPlayer, 'refs'>) => {
        // @ts-expect-error - hide from redux devtools for performance
        node.toJSON = () => ({ hidden: 'to help redux devtools :)' })

        const previousPosition = instance.current?.props.position

        instance.current = node

        if (previousPosition !== node.props.position) {
          updatePlayerProgress(instance.current)
        }
      }}
    />
  )
})

VideoPlayer.displayName = 'VideoPlayer'

export { VideoPlayer }
