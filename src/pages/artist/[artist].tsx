import { Tab } from '@headlessui/react'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import {
  ArrowLeftIcon,
  GlobeAltIcon,
  PlayIcon,
} from '@heroicons/react/24/solid'
import { dehydrate, useQuery } from '@tanstack/react-query'
import { head } from 'lodash'
import type { GetServerSideProps, NextPage } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import * as React from 'react'
import { twMerge } from 'tailwind-merge'

import {
  artistQuery,
  getAlbumsQuery,
  // getLyricsQuery,
  getVideoInfoQuery,
  queryClient,
  similarArtistsQuery,
  topsongsByArtistQuery,
} from '~/api'
import { Seo } from '~/components/seo'
import { Song } from '~/components/song'
import { useLayoutState } from '~/store/use-layout-state'
import { usePlayerState } from '~/store/use-player'

interface ArtistAlbumsProps {
  artist: string
  selectedAlbum?: string
  onAlbumSelect: (album: string) => void
}

const ArtistAlbums = (props: ArtistAlbumsProps) => {
  const { artist, selectedAlbum, onAlbumSelect } = props

  const getAlbums = useQuery({
    queryKey: ['getAlbums', artist],
    queryFn: () => getAlbumsQuery({ artist }),
  })

  const albums = getAlbums.data?.getAlbums

  const { setIsPlaying, setCurrentSong, setQueue } = usePlayerState()

  const onPlaySong = React.useCallback(
    async (song: string, artist: string) => {
      const data = await queryClient.fetchQuery({
        queryKey: ['getVideoInfo', `${artist} - ${song}`],
        queryFn: () => getVideoInfoQuery({ query: `${artist} - ${song}` }),
        staleTime: Infinity,
        cacheTime: Infinity,
      })

      const sample = head(data?.getVideoInfo)

      const album = albums?.find((album) => album.name === selectedAlbum)

      setCurrentSong({
        artist,
        title: song,
        url: `https://www.youtube.com/watch?v=${sample?.videoId}`,
        albumCoverUrl: album?.coverImage || '',
      })

      setQueue(
        album?.tracks?.map((song) => ({
          artist: artist,
          title: song,
        })) || []
      )

      setIsPlaying(true)
    },
    [albums, selectedAlbum]
  )

  const renderContent = () => {
    const album = albums?.find((album) => album.name === selectedAlbum)

    if (selectedAlbum && album) {
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
            album={selectedAlbum}
            artist={artist}
            songs={album?.tracks || []}
            coverImage={album?.coverImage || undefined}
            onPlaySong={onPlaySong}
            description={album?.description || undefined}
          />
        </>
      )
    }

    return (
      <>
        <h3 className='text-xl font-semibold mb-4'>Albums</h3>
        <div className='flex flex-wrap -mx-2 -mr-1'>
          {albums?.map((album, i) => {
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
                  <span className='text-center text-sm'>{album.name}</span>
                </button>
              </div>
            )
          })}
        </div>
      </>
    )
  }

  return <div className='p-4 pt-6'>{renderContent()}</div>
}

interface ArtistSongsProps {
  artist: string
}

const ArtistSongs = (props: ArtistSongsProps) => {
  const { artist } = props

  const { data: topsongsByArtist } = useQuery({
    queryKey: ['topsongsByArtist', artist],
    queryFn: () => topsongsByArtistQuery({ artist }),
    staleTime: Infinity,
    cacheTime: Infinity,
  })

  /* const res = getLyricsQuery({
    artist: 'Thursday',
    song: 'Understanding In A Car Crash',
  })*/

  const [listSearchValue, setListSearchValue] = React.useState('')

  const { setIsPlaying, currentSong, setCurrentSong, setQueue } =
    usePlayerState()

  const onPlaySong = React.useCallback(
    async (song: string, artist: string) => {
      const data = await queryClient.fetchQuery({
        queryKey: ['getVideoInfo', `${artist} - ${song}`],
        queryFn: () => getVideoInfoQuery({ query: `${artist} - ${song}` }),
        staleTime: Infinity,
        cacheTime: Infinity,
      })

      const sample = head(data?.getVideoInfo)

      console.log('sample', sample)

      setCurrentSong({
        artist,
        title: song,
        url: `https://www.youtube.com/watch?v=${sample?.videoId}`,
      })

      setQueue(
        topsongsByArtist?.topsongsByArtist.map((song) => ({
          artist: song.artist,
          title: song.title,
        })) || []
      )

      setIsPlaying(true)
    },
    [topsongsByArtist?.topsongsByArtist]
  )

  const onInputChange = (value: string) => {
    setListSearchValue(value)
  }

  const filteredSongs = React.useMemo(() => {
    if (!listSearchValue) {
      return topsongsByArtist?.topsongsByArtist
    }

    return topsongsByArtist?.topsongsByArtist.filter((song) =>
      song.title.toLowerCase().includes(listSearchValue.toLowerCase())
    )
  }, [listSearchValue, topsongsByArtist])

  return (
    <>
      <div className='grid grid-cols-3 px-4 py-2'>
        <div className='flex items-center rounded-3xl bg-dark-500 px-4 shadow-2xl ring-dark-500/70 focus-within:ring-2 col-span-full lg:col-start-2 lg:col-span-1'>
          <input
            onChange={(e) => onInputChange(e.target.value)}
            className='text-md border-0 bg-transparent w-full h-9 py-2 outline-none ring-0'
            value={listSearchValue}
          />
          <MagnifyingGlassIcon className='h-4 w-4' />
        </div>
      </div>
      {filteredSongs?.map((song, index) => (
        <Song
          key={index}
          position={index + 1}
          isPlaying={
            currentSong?.title === song.title &&
            currentSong?.artist === song.artist
          }
          onClick={() => onPlaySong(song.title, song.artist)}
          song={song.title}
          playcount={song.playcount ? Number(song.playcount) : undefined}
          artist={song.artist}
          showArtist={false}
        />
      ))}
    </>
  )
}

interface ArtistAlbumProps {
  album: string
  coverImage?: string
  songs: string[]
  artist: string
  onPlaySong: (song: string, artist: string) => void
  description?: string
}

const ArtistAlbum = (props: ArtistAlbumProps) => {
  const { album, coverImage, songs, artist, onPlaySong, description } = props

  const currentSong = usePlayerState((state) => state.currentSong)

  const [readMore, setReadMore] = React.useState(false)

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
            onClick={() => onPlaySong(song, artist)}
            song={song}
            artist={artist}
            showArtist={false}
          />
        )
      })}
    </div>
  )
}
interface SimilarArtistsProps {
  artist: string
}

const SimilarArtists = (props: SimilarArtistsProps) => {
  const { artist } = props

  const { data: similarArtists } = useQuery({
    queryKey: ['similarArtists', artist],
    queryFn: () =>
      similarArtistsQuery({ artist: artist, limit: 9, onlyNames: false }),
    staleTime: Infinity,
  })

  return (
    <div className='flex flex-wrap -px-4'>
      {similarArtists?.similarArtists.map((artist, i) => {
        return (
          <div
            key={artist.name + i}
            className='w-1/2 2xl:w-1/3 flex flex-col px-1 mb-1 h-28 md:h-64'
          >
            <Link
              href={`/artist/${artist.name}`}
              className='h-full relative group overflow-hidden rounded-md'
            >
              <Image
                alt={artist.name}
                width={164}
                height={164}
                quality={80}
                src={artist.image || '/cover-placeholder.png'}
                className='w-full object-cover h-full group-hover:scale-105 group-hover:blur-sm transition-all'
              />
              <div className='absolute bg-black/50 group-hover:bg-black/40 w-full h-full top-0 left-0 transition-colors flex items-center justify-center'>
                <span className='text-center text-slate-50'>{artist.name}</span>
              </div>
            </Link>
          </div>
        )
      })}
    </div>
  )
}

const ArtistPage: NextPage<{ artist: string }> = (props) => {
  const artist = props.artist

  const [selectedAlbum, setSelectedAlbum] = React.useState<string>()

  const onAlbumSelect = async (album: string) => {
    setSelectedAlbum(album)
  }

  const { data } = useQuery({
    queryKey: ['artist', artist],
    queryFn: () => artistQuery({ name: artist }),
    staleTime: Infinity,
  })

  const artistWebsite = React.useMemo(() => {
    const website = data?.artist.website
    if (website) {
      if (!website.startsWith('http://') && !website.startsWith('https://')) {
        return 'https://' + website
      }

      return website
    }
  }, [data?.artist.website])

  const { setVideoPosition } = useLayoutState()

  React.useEffect(() => {
    setVideoPosition('artist-page')
  }, [setVideoPosition])

  return (
    <>
      <Seo
        title={data?.artist.name}
        description={`Listen to ${data?.artist.name} on ElevenFM`}
        image={data?.artist.bannerImage || undefined}
      />
      <div className='container mx-auto w-full max-w-[1920px]'>
        <div className='grid lg:grid-cols-3'>
          <header
            className='bg-gradient-blend relative col-span-2 flex h-80 w-auto flex-col bg-no-repeat bg-top'
            style={{
              backgroundImage: data?.artist.bannerImage
                ? `url("${data.artist.bannerImage}")`
                : undefined,
            }}
          >
            <div className='z-10 mt-auto flex w-full items-center gap-7 px-8 mb-16 flex-col md:flex-row'>
              {data?.artist.image && (
                <Image
                  alt='artist'
                  width={200}
                  height={200}
                  quality={100}
                  src={data?.artist.image}
                  className='h-40 w-40 rounded-md object-cover'
                />
              )}
              <div>
                <div className='flex items-center gap-4 justify-center md:justify-start'>
                  <h1 className='text-2xl md:text-3xl lg:text-5xl text-gray-50'>
                    {data?.artist.name}
                  </h1>
                  {artistWebsite && (
                    <a
                      href={artistWebsite}
                      target='_blank'
                      rel='noreferrer noopener'
                    >
                      <GlobeAltIcon className='h-6' />
                    </a>
                  )}
                </div>
                <h5 className='text-sm font-thin md:text-left text-center text-gray-300'>
                  {data?.artist.genre}
                </h5>
              </div>
            </div>
          </header>
          <div className='flex justify-center col-span-2 lg:col-span-1'>
            <div data-artist-page className='aspect-video max-w-full' />
          </div>
        </div>
        <div className='grid lg:grid-cols-3'>
          <div className='md:pl-8 lg:col-span-2 lg:-mt-11'>
            <Tab.Group>
              <Tab.List>
                <Tab
                  className={({ selected }) =>
                    twMerge(
                      `relative px-4 py-2 before:absolute before:bottom-0 before:left-1/4 before:mx-auto before:h-[1px] before:w-1/2 before:transition-colors before:content-['']`,
                      selected ? `before:bg-primary-500` : ''
                    )
                  }
                >
                  Songs
                </Tab>
                <Tab
                  className={({ selected }) =>
                    twMerge(
                      `relative px-4 py-2 before:absolute before:bottom-0 before:left-1/4 before:mx-auto before:h-[1px] before:w-1/2 before:transition-colors before:content-['']`,
                      selected ? `before:bg-primary-500` : ''
                    )
                  }
                >
                  Albums
                </Tab>
                <Tab
                  className={({ selected }) =>
                    twMerge(
                      `relative px-4 py-2 before:absolute before:bottom-0 before:left-1/4 before:mx-auto before:h-[1px] before:w-1/2 before:transition-colors before:content-[''] `,
                      selected ? `before:bg-primary-500` : ''
                    )
                  }
                >
                  Biography
                </Tab>
              </Tab.List>
              <Tab.Panels>
                <Tab.Panel>
                  <div className='md:pr-4'>
                    <ArtistSongs artist={artist} />
                  </div>
                </Tab.Panel>
                <Tab.Panel>
                  <ArtistAlbums
                    selectedAlbum={selectedAlbum}
                    onAlbumSelect={onAlbumSelect}
                    artist={artist}
                  />
                </Tab.Panel>
                <Tab.Panel>
                  <div className='p-4 pt-6'>
                    <h3 className='text-xl font-semibold mb-3'>Biography</h3>

                    <ul>
                      {data?.artist.formedYear && (
                        <li className='mb-2'>
                          <span className='font-semibold'>Year formed:</span>{' '}
                          {data?.artist.formedYear || ''}
                        </li>
                      )}
                      {data?.artist.location && (
                        <li className='mb-2'>
                          <span className='font-semibold'>Location:</span>{' '}
                          {data?.artist.location || ''}
                        </li>
                      )}
                      {data?.artist.disbanded && (
                        <li className='mb-2'>
                          <span className='font-semibold'>Disbanded:</span>{' '}
                          {data?.artist.disbanded ? 'Yes' : 'No'}
                        </li>
                      )}
                    </ul>
                    <article className='text-sm leading-relaxed'>
                      <p>{data?.artist.biography || ''}</p>
                    </article>
                  </div>
                </Tab.Panel>
              </Tab.Panels>
            </Tab.Group>
          </div>
          <div className='mt-5 px-4 md:pl-12 lg:px-0'>
            <h3 className='text-xl font-semibold mb-4'>Similar artists</h3>
            <SimilarArtists artist={artist} />
          </div>
        </div>
      </div>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  await queryClient.prefetchQuery(
    ['artist', String(params?.artist)],
    () => artistQuery({ name: String(params?.artist) }),
    {
      staleTime: 1000 * 60 * 60 * 24,
      cacheTime: 1000 * 60 * 60 * 24,
    }
  )

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
      artist: String(params?.artist),
    },
  }
}

export default ArtistPage
