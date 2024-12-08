import { ArrowLeftIcon, PlayIcon } from '@heroicons/react/24/solid'
import { useQuery } from '@tanstack/react-query'
import { orderBy } from 'lodash'
import Image from 'next/image'
import { useMemo, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'

import { getAlbumsQuery, getAlbumTracksQuery } from '~/api'
import { WavesLoader } from '~/components/loader'
import { SongList } from '~/components/song-list'
import { sortablePropertiesMapping } from '~/constants'
import type { ArtistSortableProperties } from '~/store/use-local-settings'
import { useLocalSettings } from '~/store/use-local-settings'

interface ArtistAlbumProps {
  album: string
  coverImage?: string
  songs: string[]
  artist: string
  description?: string
  albumId?: string
}

const ArtistAlbum = (props: ArtistAlbumProps) => {
  const { album, coverImage, songs, artist, description, albumId } = props

  const [readMore, setReadMore] = useState(false)

  console.log(albumId)

  const getAlbumTracks = useQuery({
    queryKey: ['getAlbumTracks', albumId],
    queryFn: () => getAlbumTracksQuery({ albumId: albumId ?? '' }),
    enabled: !!albumId,
    staleTime: Infinity,
    gcTime: Infinity,
  })

  const albumSongs = getAlbumTracks.data?.albumSongs.tracks

  const identifier = `${artist}-${album}`

  const playableSongs = useMemo(() => {
    const hasExternalSongs = albumSongs && albumSongs.length > 0

    return (hasExternalSongs ? albumSongs : songs).map((song) => ({
      title: song,
      artist: artist,
      albumCoverUrl: coverImage,
    }))
  }, [albumSongs, songs, artist, coverImage])

  const { sortedPlaylists } = useLocalSettings(
    useShallow((state) => ({
      sortedPlaylists: state.sortedPlaylists,
    }))
  )
  const sortingSettings = sortedPlaylists.find(
    (playlist) => playlist.identifier === identifier
  )

  const sortBySetting = sortingSettings?.sortBy || 'default'

  const sortedPlayableSongs = useMemo(() => {
    return orderBy(
      playableSongs,
      sortablePropertiesMapping[sortBySetting as ArtistSortableProperties],
      [sortingSettings?.direction || 'desc']
    )
  }, [playableSongs, sortBySetting, sortingSettings?.direction])

  return (
    <div>
      <div className='mb-4 flex flex-col md:flex-row'>
        <div className='mx-auto shrink-0 md:mx-0'>
          <Image
            alt={album}
            width={136}
            height={136}
            quality={80}
            src={coverImage || '/cover-placeholder.png'}
            className='rounded-md object-cover'
          />
        </div>
        <div className='flex flex-col px-4 py-3'>
          <h3
            className={` mb-2 block font-semibold ${
              description
                ? 'text-xl md:text-2xl'
                : 'mt-auto text-2xl md:text-3xl'
            }`}
          >
            {album}
          </h3>
          {description && (
            <>
              <p
                className={`text-sm leading-relaxed ${
                  readMore ? '' : 'line-clamp-4'
                }`}
              >
                {description}
              </p>
              {description.split(' ').length > 50 && (
                <button
                  type='button'
                  className='w-fit text-sm text-primary-500 hover:underline'
                  onClick={() => setReadMore(!readMore)}
                >
                  {readMore ? 'Read less' : 'Read more'}
                </button>
              )}
            </>
          )}
        </div>
      </div>
      <SongList
        identifier={identifier}
        songs={sortedPlayableSongs}
        isLoading={getAlbumTracks.isLoading}
      />
    </div>
  )
}

interface ArtistAlbumsProps {
  artist: string
  selectedAlbum?: string
  onAlbumSelect: (album: string) => void
}

export const ArtistAlbums = (props: ArtistAlbumsProps) => {
  const { artist, selectedAlbum: selectedAlbumName, onAlbumSelect } = props

  const getAlbums = useQuery({
    queryKey: ['getAlbums', artist],
    queryFn: () => getAlbumsQuery({ artist, limit: 12 }),
  })

  const albums = getAlbums.data?.getAlbums

  const selectedAlbum = useMemo(() => {
    return albums?.find((album) => album.name === selectedAlbumName)
  }, [albums, selectedAlbumName])

  const renderContent = () => {
    if (selectedAlbumName && selectedAlbum) {
      return (
        <>
          <button
            type='button'
            className='mb-4 flex items-center'
            onClick={() => {
              onAlbumSelect('')
            }}
          >
            <ArrowLeftIcon className='mr-2 inline-block h-6 text-primary-500' />
            <h3 className='text-xl font-semibold'>Albums</h3>
          </button>
          <ArtistAlbum
            album={selectedAlbumName}
            artist={artist}
            songs={selectedAlbum?.tracks || []}
            coverImage={selectedAlbum?.coverImage || undefined}
            description={selectedAlbum?.description || undefined}
            albumId={selectedAlbum?.albumId || undefined}
          />
        </>
      )
    }

    return (
      <>
        <h3 className='mb-4 text-xl font-semibold'>Albums</h3>
        <div className='-mx-2 -mr-1 flex flex-wrap'>
          {getAlbums.isLoading ? (
            <div className='flex h-28 w-full justify-center md:h-56'>
              <WavesLoader />
            </div>
          ) : (
            albums?.map((album, i) => {
              return (
                <div
                  key={album.name + i}
                  className='mb-5 flex w-1/2 flex-col px-2 sm:w-1/3 lg:w-1/4 xl:w-1/5 2xl:w-1/6'
                >
                  <button
                    type='button'
                    onClick={() => {
                      onAlbumSelect(album.name)
                    }}
                  >
                    <div className='group relative'>
                      <Image
                        alt={album.name}
                        width={164}
                        height={164}
                        quality={80}
                        src={album.coverImage || '/cover-placeholder.png'}
                        className='w-full rounded-md object-cover'
                      />
                      <div className='invisible absolute left-0 top-0 flex size-full items-center justify-center transition-colors group-hover:visible group-hover:bg-black/30'>
                        <PlayIcon className='size-10 text-transparent transition-colors group-hover:text-primary-500' />
                      </div>
                    </div>
                    <span className='text-center text-sm'>
                      {album.name}{' '}
                      <span className='text-xs text-gray-300'>
                        {album.year ? `(${album.year})` : ''}
                      </span>
                    </span>
                  </button>
                </div>
              )
            })
          )}
        </div>
      </>
    )
  }

  return <div className='p-4 pt-6'>{renderContent()}</div>
}
