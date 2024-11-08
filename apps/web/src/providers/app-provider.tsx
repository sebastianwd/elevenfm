import {
  HydrationBoundary as Hydrate,
  QueryClientProvider,
} from '@tanstack/react-query'
import type { AppProps } from 'next/app'
import { SessionProvider } from 'next-auth/react'
import type * as React from 'react'

import { queryClient } from '~/api'

export const AppProvider = (props: {
  children: React.ReactNode
  pageProps: AppProps['pageProps']
}) => {
  const {
    children,
    pageProps: { session, ...pageProps },
  } = props

  return (
    <SessionProvider session={session}>
      <QueryClientProvider client={queryClient}>
        <Hydrate state={pageProps?.dehydratedState}>{children}</Hydrate>
      </QueryClientProvider>
    </SessionProvider>
  )
}
