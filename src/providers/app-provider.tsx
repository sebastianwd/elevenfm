import { Hydrate, QueryClientProvider } from '@tanstack/react-query'
import { AppProps } from 'next/app'
import * as React from 'react'

import { queryClient } from '~/api'

export const AppProvider = (props: {
  children: React.ReactNode
  pageProps: AppProps['pageProps']
}) => {
  const { children, pageProps } = props

  return (
    <QueryClientProvider client={queryClient}>
      <Hydrate state={pageProps?.dehydratedState}>{children}</Hydrate>
    </QueryClientProvider>
  )
}
