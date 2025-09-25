import type { Metadata } from 'next'

import { HomePage } from '~/components/pages/home'

const title = 'ElevenFM - Unlimited Free Music'
const description =
  'Listen to your favorite artists and create your own playlists! Enjoy unlimited free music, full albums, lyrics, import playlists and much more!'

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    type: 'website',
    siteName: 'ElevenFM',
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
  },
}

export default function Home() {
  return <HomePage />
}
