import { orpc, queryClient } from '@repo/api/lib/orpc.client'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'

import { ArtistPage } from '~/components/pages/artist'

interface ArtistPageProps {
  params: Promise<{ artist: string }>
}

export default async function Artist({ params }: ArtistPageProps) {
  const { artist } = await params

  console.log('artist', artist)

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
