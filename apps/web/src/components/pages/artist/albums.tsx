import { ArrowLeftIcon, PlayIcon } from '@heroicons/react/24/solid'
import { useQuery } from '@tanstack/react-query'
import Image from 'next/image'
import { useMemo, useState } from 'react'

import { getAlbumsQuery } from '~/api'
import { WavesLoader } from '~/components/loader'
import { Song } from '~/components/song'
import { usePlaySong } from '~/hooks/use-play-song'
import { usePlayerState } from '~/store/use-player'
import { PlayableSong } from '~/types'

interface ArtistAlbumProps {
  album: string
  coverImage?: string
  songs: string[]
  artist: string
  onPlaySong: (song: PlayableSong) => void
  description?: string
}

const ArtistAlbum = (props: ArtistAlbumProps) => {
  const { album, coverImage, songs, artist, onPlaySong, description } = props

  const currentSong = usePlayerState((state) => state.currentSong)

  const [readMore, setReadMore] = useState(false)

  return (
    <div>
      <div className='flex mb-4 flex-col md:flex-row'>
        <div className='shrink-0 mx-auto md:mx-0'>
          <Image
            alt={album}
            width={136}
            height={136}
            quality={80}
            src={coverImage || '/cover-placeholder.png'}
            className='rounded-md object-cover'
          />
        </div>
        <div className='py-3 px-4 flex flex-col'>
          <h3
            className={` font-semibold block mb-2 ${
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
                  className='text-primary-500 hover:underline text-sm w-fit'
                  onClick={() => setReadMore(!readMore)}
                >
                  {readMore ? 'Read less' : 'Read more'}
                </button>
              )}
            </>
          )}
        </div>
      </div>
      {songs.map((song, index) => {
        return (
          <Song
            key={index}
            position={index + 1}
            isPlaying={
              currentSong?.title === song && currentSong?.artist === artist
            }
            onClick={() =>
              onPlaySong({
                title: song,
                artist: artist,
                albumCoverUrl: coverImage,
              })
            }
            song={song}
            artist={artist}
            showArtist={false}
          />
        )
      })}
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

  const { onPlaySong } = usePlaySong({
    songs:
      selectedAlbum?.tracks?.map((song) => ({
        artist: artist,
        title: song,
      })) || [],
    songsIdentifier: selectedAlbum?.name ?? '',
  })

  const renderContent = () => {
    if (selectedAlbumName && selectedAlbum) {
      return (
        <>
          <button
            className='flex items-center mb-4'
            onClick={() => {
              onAlbumSelect('')
            }}
          >
            <ArrowLeftIcon className='h-6 inline-block mr-2 text-primary-500' />
            <h3 className='text-xl font-semibold'>Albums</h3>
          </button>
          <ArtistAlbum
            album={selectedAlbumName}
            artist={artist}
            songs={selectedAlbum?.tracks || []}
            coverImage={selectedAlbum?.coverImage || undefined}
            onPlaySong={onPlaySong}
            description={selectedAlbum?.description || undefined}
          />
        </>
      )
    }

    return (
      <>
        <h3 className='text-xl font-semibold mb-4'>Albums</h3>
        <div className='flex flex-wrap -mx-2 -mr-1'>
          {getAlbums.isLoading ? (
            <div className='w-full flex justify-center h-28 md:h-56'>
              <WavesLoader />
            </div>
          ) : (
            albums?.map((album, i) => {
              return (
                <div
                  key={album.name + i}
                  className='w-1/2 sm:w-1/3 lg:w-1/4 xl:w-1/5 2xl:w-1/6 flex flex-col px-2 mb-5'
                >
                  <button
                    onClick={() => {
                      onAlbumSelect(album.name)
                    }}
                  >
                    <div className='relative group'>
                      <Image
                        alt={album.name}
                        width={164}
                        height={164}
                        quality={80}
                        src={album.coverImage || '/cover-placeholder.png'}
                        className='w-full rounded-md object-cover'
                      />
                      <div className='group-hover:visible invisible absolute group-hover:bg-black/30 w-full h-full top-0 left-0 transition-colors flex items-center justify-center'>
                        <PlayIcon className='group-hover:text-primary-500 w-10 h-10 text-transparent transition-colors' />
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
