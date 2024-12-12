import '../styles/global.css'
import 'simplebar-react/dist/simplebar.min.css'

import { debounce } from 'lodash'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import { useRouter } from 'next/router'
import Script from 'next/script'
import { PagesProgressBar as ProgressBar } from 'next-nprogress-bar'
import { useCallback, useEffect, useState } from 'react'

import { searchArtistQuery } from '~/api'
import { CommandPalette } from '~/components/command-palette'
import MainLayout from '~/layouts/main'
import { AppProvider } from '~/providers/app-provider'
import { useGlobalSearchStore } from '~/store/use-global-search'

// todo, use command palette from https://motion.dev/docs/react-transitions
const ArtistSearchCommandPalette = () => {
  const { isOpen, setIsOpen, search, setSearch, setResults, results } =
    useGlobalSearchStore()

  const router = useRouter()

  const [isSearching, setIsSearching] = useState(false)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const delayedSearch = useCallback(
    debounce(async (value: string) => {
      if (value.length < 3) {
        setResults([])
        return
      }

      setIsSearching(true)

      const searchArtistQueryResponse = await searchArtistQuery({
        artist: value,
      })

      setResults(searchArtistQueryResponse.searchArtists)
      setIsSearching(false)
    }, 300),
    []
  )

  useEffect(() => {
    if (search) {
      delayedSearch(search)?.catch((e) => {
        console.error('Error searching artist', e)
      })
    }
  }, [delayedSearch, search])

  const onSelect = async (value: string) => {
    if (!value) return
    setIsOpen(false)
    await router.push(`/artist/${value}`)
  }

  return (
    <CommandPalette
      onSelect={(value) => {
        void onSelect(value)
      }}
      commands={results}
      value={search}
      isLoading={isSearching}
      onInputChange={(value) => {
        setSearch(value)
      }}
      isOpen={isOpen}
      onClose={() => {
        setSearch('')
        setResults([])
        setIsOpen(false)
      }}
    />
  )
}

const MyApp = (props: AppProps) => {
  const { Component, pageProps } = props

  return (
    <>
      <AppProvider pageProps={pageProps}>
        <Head>
          <meta
            name='viewport'
            content='minimum-scale=1, initial-scale=1, width=device-width'
          />
        </Head>
        <ProgressBar color='#FC3967' options={{ showSpinner: false }} />
        <MainLayout>
          <Component {...pageProps} />
        </MainLayout>
        <ArtistSearchCommandPalette />
      </AppProvider>
      {process.env.NODE_ENV === 'development' ? null : (
        <Script
          defer
          data-site-id='elevenfm.com'
          src='https://assets.onedollarstats.com/tracker.js'
        />
      )}
    </>
  )
}

export default MyApp
