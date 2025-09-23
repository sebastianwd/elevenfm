import { orpc } from '@repo/api/lib/orpc.client'
import { useQuery } from '@tanstack/react-query'
import { orderBy } from 'es-toolkit'
import { useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'

import { SongList } from '~/components/song-list'
import { sortablePropertiesMapping } from '~/constants'
import { useLocalSettings } from '~/store/use-local-settings'

interface ArtistSongsProps {
  artist: string
}

export const ArtistSongs = (props: ArtistSongsProps) => {
  const { artist } = props

  const { data: topsongsByArtist, isPending } = useQuery(
    orpc.artist.topSongs.queryOptions({
      input: { artist },
      staleTime: Infinity,
      gcTime: Infinity,
    })
  )

  const { sortedPlaylists } = useLocalSettings(
    useShallow((state) => ({
      sortedPlaylists: state.sortedPlaylists,
    }))
  )
  const sortingSettings = sortedPlaylists.find(
    (playlist) => playlist.identifier === artist
  )

  const sortBySetting = sortingSettings?.sortBy || 'default'

  const sortedSongs = useMemo(() => {
    if (!topsongsByArtist) return []

    if (sortBySetting === 'scrobbles') {
      return orderBy(
        topsongsByArtist,
        [
          (song) =>
            song.playcount ? Number(song.playcount) : Number.MIN_SAFE_INTEGER,
        ],
        [sortingSettings?.direction || 'desc']
      )
    }
    return orderBy(
      topsongsByArtist,
      // @ts-expect-error TODO: fix this
      [sortablePropertiesMapping[sortBySetting]],
      [sortingSettings?.direction || 'desc']
    )
  }, [sortingSettings?.direction, topsongsByArtist, sortBySetting])

  return (
    <SongList identifier={artist} songs={sortedSongs} isLoading={isPending} />
  )
}
