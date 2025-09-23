import { orpc, queryClient } from '@repo/api/lib/orpc.client'
import { dehydrate } from '@tanstack/react-query'
import type { GetServerSideProps, NextPage } from 'next'

import { ArtistPage } from '~/components/pages/artist'

const Artist: NextPage<{ artist: string }> = (props) => {
  const { artist } = props

  return <ArtistPage artist={artist} />
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  await queryClient.prefetchQuery(
    orpc.artist.topSongs.queryOptions({
      input: { artist: String(params?.artist) },
      staleTime: 1000 * 60 * 60 * 24,
      gcTime: 1000 * 60 * 60 * 24,
    })
  )

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
      artist: String(params?.artist),
    },
  }
}

export default Artist
