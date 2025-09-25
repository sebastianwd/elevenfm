'use client'

import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react'
import { orpc } from '@repo/api/lib/orpc.client'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { useMemo, useState } from 'react'
import { twMerge } from 'tailwind-merge'

import { ArtistHeader } from '~/components/artist-header'
import { TheaterMode } from '~/components/theater-mode'
import { useLayoutState } from '~/store/use-layout-state'

import { ArtistAlbums } from './albums'
import { SimilarArtists } from './similar-artists'
import { ArtistSongs } from './songs'

interface ArtistPageProps {
  artist: string
}

export const ArtistPage = (props: ArtistPageProps) => {
  const { artist } = props

  const [selectedAlbum, setSelectedAlbum] = useState<string>()

  const onAlbumSelect = (album: string) => {
    setSelectedAlbum(album)
  }

  const { data } = useQuery(
    orpc.artist.get.queryOptions({
      input: { name: artist },
      staleTime: Infinity,
    })
  )

  const artistWebsite = useMemo(() => {
    const website = data?.website
    if (website) {
      if (!website.startsWith('http://') && !website.startsWith('https://')) {
        return 'https://' + website
      }

      return website
    }
  }, [data?.website])

  const { theaterMode } = useLayoutState()

  return (
    <div className='relative'>
      {theaterMode ? null : (
        <div
          className={twMerge(`absolute top-0 left-0 flex h-80 w-full flex-col`)}
        >
          <div
            className='size-full bg-cover bg-position-[top_-4rem_center] bg-no-repeat'
            style={{
              backgroundImage: data?.bannerImage
                ? `url("${data.bannerImage}")`
                : undefined,
            }}
          >
            <div
              className={twMerge(
                'size-full',
                data?.bannerImage
                  ? `bg-gradient-blend`
                  : 'bg-gradient-blend-surface'
              )}
            ></div>
          </div>
        </div>
      )}
      <div className='container mx-auto flex min-h-full w-full max-w-[1920px] flex-col'>
        {theaterMode ? (
          <TheaterMode />
        ) : (
          <>
            <header
              className={twMerge(
                `relative flex h-80 w-full flex-col bg-top bg-no-repeat`
              )}
            >
              <div className='z-10 mt-auto mb-16 flex w-full flex-col items-center gap-7 px-8 md:flex-row'>
                {data?.image && (
                  <Image
                    alt='artist'
                    width={200}
                    height={200}
                    quality={100}
                    src={data.image}
                    className='size-40 rounded-lg object-cover [box-shadow:rgb(0,0,0)_0px_0px_20rem]'
                  />
                )}
                <ArtistHeader
                  externalUrls={{
                    website: artistWebsite || '',
                  }}
                  title={data?.name || ''}
                  subtitle={data?.genre || ''}
                />
              </div>
            </header>

            <div className='grid lg:grid-cols-3'>
              <div className='md:pl-8 lg:col-span-2 lg:-mt-11'>
                <TabGroup>
                  <TabList>
                    <Tab className='relative px-4 py-2'>
                      {({ selected }) => (
                        <>
                          Songs
                          {selected ? (
                            <motion.div
                              layoutId='tab-indicator'
                              className={twMerge(
                                'absolute bottom-0 left-1/4 mx-auto h-[1px] w-1/2 bg-primary-500'
                              )}
                            />
                          ) : null}
                        </>
                      )}
                    </Tab>
                    <Tab className='relative px-4 py-2'>
                      {({ selected }) => (
                        <>
                          Albums
                          {selected ? (
                            <motion.div
                              layoutId='tab-indicator'
                              className={twMerge(
                                'absolute bottom-0 left-1/4 mx-auto h-[1px] w-1/2 bg-primary-500'
                              )}
                            />
                          ) : null}
                        </>
                      )}
                    </Tab>
                    <Tab className='relative px-4 py-2'>
                      {({ selected }) => (
                        <>
                          Biography
                          {selected ? (
                            <motion.div
                              layoutId='tab-indicator'
                              className={twMerge(
                                'absolute bottom-0 left-1/4 mx-auto h-[1px] w-1/2 bg-primary-500'
                              )}
                            />
                          ) : null}
                        </>
                      )}
                    </Tab>
                  </TabList>
                  <TabPanels>
                    <TabPanel>
                      <div className='md:pr-4'>
                        <ArtistSongs artist={data?.name || artist} />
                      </div>
                    </TabPanel>
                    <TabPanel>
                      <ArtistAlbums
                        selectedAlbum={selectedAlbum}
                        onAlbumSelect={onAlbumSelect}
                        artist={data?.name || artist}
                      />
                    </TabPanel>
                    <TabPanel>
                      <div className='p-4 pt-6'>
                        <h3 className='mb-3 text-xl font-semibold'>
                          Biography
                        </h3>

                        <ul>
                          {!!Number(data?.formedYear) &&
                            !Number.isNaN(Number(data?.formedYear)) && (
                              <li className='mb-2'>
                                <span className='font-semibold'>
                                  Year formed:
                                </span>{' '}
                                {data?.formedYear || ''}
                              </li>
                            )}
                          {data?.location && (
                            <li className='mb-2'>
                              <span className='font-semibold'>Location:</span>{' '}
                              {data.location || ''}
                            </li>
                          )}
                          {typeof data?.disbanded === 'boolean' && (
                            <li className='mb-2'>
                              <span className='font-semibold'>Disbanded:</span>{' '}
                              {data.disbanded ? 'Yes' : 'No'}
                            </li>
                          )}
                        </ul>
                        <article className='text-sm leading-relaxed'>
                          <p>{data?.biography || ''}</p>
                        </article>
                      </div>
                    </TabPanel>
                  </TabPanels>
                </TabGroup>
              </div>
              <div className='mt-5 px-4 md:pl-12 lg:px-0'>
                <h3 className='mb-4 text-xl font-semibold'>Similar artists</h3>
                <SimilarArtists artist={artist} />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
