import { useQuery } from '@tanstack/react-query'
import Image from 'next/image'
import Link from 'next/link'

import { similarArtistsQuery } from '~/api'
import { WavesLoader } from '~/components/loader'

interface SimilarArtistsProps {
  artist: string
}

export const SimilarArtists = (props: SimilarArtistsProps) => {
  const { artist } = props

  const { data: similarArtists, isLoading } = useQuery({
    queryKey: ['similarArtists', artist],
    queryFn: () =>
      similarArtistsQuery({ artist: artist, limit: 9, onlyNames: false }),
    staleTime: Infinity,
  })

  return (
    <div className='flex flex-wrap -px-4'>
      {isLoading ? (
        <div className='w-full flex justify-center h-28 md:h-56'>
          <WavesLoader />
        </div>
      ) : (
        similarArtists?.similarArtists.map((artist, i) => {
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
                  <span className='text-center text-slate-50'>
                    {artist.name}
                  </span>
                </div>
              </Link>
            </div>
          )
        })
      )}
    </div>
  )
}
