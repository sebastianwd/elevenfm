import '~/global.css'

import type { Metadata, Viewport } from 'next'
import Script from 'next/script'

import { AppProvider } from '~/providers/app-provider'

import { ArtistSearchCommand } from '../components/artist-search-command'
import MainLayout from '../layouts/main'

export const metadata: Metadata = {
  title: 'ElevenFM',
  description: 'Unlimited music. Full albums. Lyrics. Import playlists.',
  icons: {
    icon: '/favicon.ico',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang='en' className='dark'>
      <body className='font-family-poppins'>
        <AppProvider>
          <MainLayout>{children}</MainLayout>
          <ArtistSearchCommand />
        </AppProvider>
        {process.env.NODE_ENV === 'development' ? null : (
          <Script
            defer
            data-site-id='elevenfm.com'
            src='https://assets.onedollarstats.com/tracker.js'
          />
        )}
      </body>
    </html>
  )
}
