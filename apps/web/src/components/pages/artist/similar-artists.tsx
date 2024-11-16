import { useQuery } from '@tanstack/react-query'
import Image from 'next/image'
import Link from 'next/link'

import { similarArtistsQuery } from '~/api'
import { Skeleton } from '~/components/skeleton/skeleton'

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
    <div className='flex flex-wrap'>
      {isLoading
        ? Array.from({ length: 9 }).map((_, i) => (
            <div
              key={i}
              className='mb-1 flex h-28 w-1/2 flex-col px-1 md:h-64 2xl:w-1/3'
            >
              <Skeleton className='size-full overflow-hidden' />
            </div>
          ))
        : similarArtists?.similarArtists.map((artist, i) => {
            return (
              <div
                key={artist.name + i}
                className='mb-1 flex h-28 w-1/2 flex-col px-1 md:h-64 2xl:w-1/3'
              >
                <Link
                  href={`/artist/${artist.name}`}
                  className='group relative h-full overflow-hidden rounded-md'
                >
                  <Image
                    alt={artist.name}
                    width={164}
                    height={164}
                    quality={80}
                    src={artist.image || '/cover-placeholder.png'}
                    className='size-full object-cover transition-all group-hover:scale-105 group-hover:blur-sm'
                  />
                  <div className='absolute left-0 top-0 flex size-full items-center justify-center bg-black/50 transition-colors group-hover:bg-black/40'>
                    <span className='text-center text-slate-50'>
                      {artist.name}
                    </span>
                  </div>
                </Link>
              </div>
            )
          })}
    </div>
  )
}
