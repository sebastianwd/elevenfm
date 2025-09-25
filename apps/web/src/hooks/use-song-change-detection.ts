import { useCallback, useEffect, useRef } from 'react'

interface UseSongChangeDetectionProps {
  currentSong: {
    title?: string
    artist?: string
    duration?: number
  } | null
  currentProgress?: number
  onSongChange: () => void
}

export const useSongChangeDetection = ({
  currentSong,
  currentProgress = 0,
  onSongChange,
}: UseSongChangeDetectionProps) => {
  const previousTitleRef = useRef(currentSong?.title)
  const previousArtistRef = useRef(currentSong?.artist)
  const previousDurationRef = useRef(currentSong?.duration)

  const hasSongChanged = useCallback(() => {
    return (
      previousTitleRef.current !== currentSong?.title ||
      previousArtistRef.current !== currentSong?.artist ||
      previousDurationRef.current !== currentSong?.duration
    )
  }, [currentSong?.title, currentSong?.artist, currentSong?.duration])

  const updatePreviousRefs = useCallback(() => {
    previousTitleRef.current = currentSong?.title
    previousArtistRef.current = currentSong?.artist
    previousDurationRef.current = currentSong?.duration
  }, [currentSong?.title, currentSong?.artist, currentSong?.duration])

  useEffect(() => {
    if (hasSongChanged() && currentProgress > 0) {
      onSongChange()
      updatePreviousRefs()
    }
  }, [
    currentSong?.title,
    currentSong?.artist,
    currentSong?.duration,
    currentProgress,
    hasSongChanged,
    onSongChange,
    updatePreviousRefs,
  ])

  return {
    hasSongChanged,
  }
}
