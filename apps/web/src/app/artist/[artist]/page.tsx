import { orpc, queryClient } from '@repo/api/lib/orpc.client'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import type { Metadata } from 'next'

import { ArtistPage } from '~/components/pages/artist'

interface ArtistPageProps {
  params: Promise<{ artist: string }>
}

export async function generateMetadata({
  params,
}: ArtistPageProps): Promise<Metadata> {
  const { artist } = await params

  try {
    const artistData = await queryClient.fetchQuery(
      orpc.artist.get.queryOptions({
        input: { name: artist },
      })
    )

    const title = `${artistData.name} | ElevenFM`
    const description = `Listen to ${artistData.name} on ElevenFM. Discover their music, albums, and top tracks.`

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: 'profile',
        ...(artistData.image && {
          images: [
            {
              url: artistData.image,
              alt: `${artistData.name} profile picture`,
              width: 400,
              height: 400,
            },
          ],
        }),
        siteName: 'ElevenFM',
      },
      twitter: {
        card: 'summary',
        title,
        description,
        ...(artistData.image && {
          images: [artistData.image],
        }),
      },
    }
  } catch {
    const decodedArtist = decodeURIComponent(artist)
    return {
      title: `${decodedArtist} | ElevenFM`,
      description: `Listen to ${decodedArtist} on ElevenFM. Discover their music, albums, and top tracks.`,
    }
  }
}

export default async function Artist({ params }: ArtistPageProps) {
  const { artist } = await params

  await queryClient.prefetchQuery(
    orpc.artist.get.queryOptions({
      input: { name: artist },
      staleTime: 1000 * 60 * 60 * 24,
      gcTime: 1000 * 60 * 60 * 24,
    })
  )

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ArtistPage artist={artist} />
    </HydrationBoundary>
  )
}
