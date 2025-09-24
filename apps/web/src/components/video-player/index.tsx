'use client'

import { invidiousUrls } from '@repo/api/integrations/invidious/invidious'
import { ytGetId } from '@repo/utils/get-yt-url-id'
import { sample } from 'es-toolkit'
import { isEmpty } from 'es-toolkit/compat'
import dynamic from 'next/dynamic'
import { memo, useCallback, useEffect, useMemo, useState } from 'react'
import type ReactPlayer from 'react-player'

import { useLayoutState, type VideoPosition } from '~/store/use-layout-state'
import {
  usePlayerInstance,
  usePlayerProgressState,
  usePlayerState,
} from '~/store/use-player'

interface VideoPlayerPortalContainerProps {
  position: VideoPosition
  className?: string
}

export const VideoPlayerPortalContainer = (
  props: VideoPlayerPortalContainerProps
) => {
  const { position, className } = props

  const setVideoPosition = useLayoutState((state) => state.setVideoPosition)
  const theaterMode = useLayoutState((state) => state.theaterMode)

  const dynamicData = useMemo(() => {
    return { [`data-${theaterMode ? 'theater-mode' : position}`]: '' }
  }, [position, theaterMode])

  useEffect(() => {
    setVideoPosition(theaterMode ? 'theater-mode' : position)
  }, [setVideoPosition, theaterMode, position])

  return <div className={className} {...dynamicData} />
}

const DynamicReactPlayer = dynamic(() => import('react-player/lazy'), {
  ssr: false,
})

const VideoPlayer = memo(() => {
  const {
    isPlaying,
    setIsPlaying,
    currentSong,
    setDuration,
    playNext,
    volume,
  } = usePlayerState()

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
    playNext({ isUserAction: false })
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

    const isSoundCloud =
      currentSong?.urls?.length === 1 &&
      currentSong.urls[0]?.includes('soundcloud.com')

    if (isSoundCloud) {
      return currentSong.urls![0]
    }

    const videoUrl = currentSong?.urls?.[videoChoice]

    const isVideoUrlBlocked = !videoUrl

    if (isVideoUrlBlocked) {
      return `${sample(invidiousUrls)}/latest_version?id=${ytGetId(currentSong?.urls?.[0] ?? '')?.id}&itag=18`
    }

    return videoUrl
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
      volume={volume}
      onPlay={onPlayerPlay}
      onPause={onPlayerPause}
      onEnded={onPlayerEnd}
      stopOnUnmount={false}
      progressInterval={500}
      onProgress={onPlayerProgress}
      position={videoPosition}
      onError={(error) => {
        console.log(error)
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
