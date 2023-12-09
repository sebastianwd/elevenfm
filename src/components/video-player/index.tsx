import { isEmpty } from 'lodash'
import dynamic from 'next/dynamic'
import { memo, useCallback, useEffect, useMemo, useState } from 'react'
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

  const [videoChoice, setVideoChoice] = useState(0)

  const url = useMemo(() => {
    if (isEmpty(currentSong?.urls)) return undefined

    const videoId = currentSong?.urls?.[videoChoice]
    const url = `https://www.youtube.com/watch?v=${videoId}`

    if (!videoId) {
      return `${process.env.NEXT_PUBLIC_INVIDIOUS_URL2}/latest_version?id=${currentSong?.urls?.[0]}`
    }

    return url
  }, [currentSong?.urls, videoChoice])

  useEffect(() => {
    setVideoChoice(0)
  }, [currentSong?.title, currentSong?.artist])

  return (
    <DynamicReactPlayer
      width='100%'
      height='100%'
      style={{ minHeight: 48 }}
      playing={isPlaying}
      url={url}
      controls
      onPlay={onPlayerPlay}
      onPause={onPlayerPause}
      onEnded={onPlayerEnd}
      stopOnUnmount={false}
      progressInterval={500}
      onProgress={onPlayerProgress}
      position={videoPosition}
      onError={(error) => {
        if (error) {
          setVideoChoice((prev) => prev + 1)
        }
      }}
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
