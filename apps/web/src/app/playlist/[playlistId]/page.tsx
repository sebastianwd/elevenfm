import type { Metadata } from 'next'

import { PlaylistPage } from '~/components/pages/playlist'

interface PlaylistPageProps {
  params: Promise<{ playlistId: string }>
}

export function generateMetadata(): Metadata {
  const title = `ElevenFM`
  const description = `Listen to this playlist on ElevenFM.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'music.playlist',
      siteName: 'ElevenFM',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
  }
}

export default async function Playlist({ params }: PlaylistPageProps) {
  const { playlistId } = await params

  return <PlaylistPage playlistId={playlistId} />
}
