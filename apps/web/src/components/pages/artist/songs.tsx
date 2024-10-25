import { useQuery } from '@tanstack/react-query'
import { orderBy } from 'lodash'
import { useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'

import { topsongsByArtistQuery } from '~/api'
import { SongList } from '~/components/song-list'
import {
  type ArtistSortableProperties,
  useLocalSettings,
} from '~/store/use-local-settings'

interface ArtistSongsProps {
  artist: string
}

const sortablePropertiesMapping = {
  default: 'default',
  title: 'title',
  scrobbles: 'playcount',
} as const satisfies Record<ArtistSortableProperties, string>

export const ArtistSongs = (props: ArtistSongsProps) => {
  const { artist } = props

  const { data: topsongsByArtist } = useQuery({
    queryKey: ['topsongsByArtist', artist],
    queryFn: () => topsongsByArtistQuery({ artist }),
    staleTime: Infinity,
    gcTime: Infinity,
  })

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
    if (sortBySetting === 'scrobbles') {
      return orderBy(
        topsongsByArtist?.topsongsByArtist,
        (song) =>
          song.playcount ? Number(song.playcount) : Number.MIN_SAFE_INTEGER,
        [sortingSettings?.direction || 'desc']
      )
    }
    return orderBy(
      topsongsByArtist?.topsongsByArtist,
      sortablePropertiesMapping[sortBySetting as ArtistSortableProperties],
      [sortingSettings?.direction || 'desc']
    )
  }, [
    sortingSettings?.direction,
    topsongsByArtist?.topsongsByArtist,
    sortBySetting,
  ])

  return <SongList identifier={artist} songs={sortedSongs} />
}
