'use client'

import { ProgressProvider } from '@bprogress/next/app'
import { queryClient } from '@repo/api/lib/orpc.client'
import { QueryClientProvider } from '@tanstack/react-query'
import type * as React from 'react'

export const AppProvider = (props: { children: React.ReactNode }) => {
  const { children } = props

  return (
    <ProgressProvider
      height='4px'
      color='#FC3967'
      options={{ showSpinner: false }}
      shallowRouting
    >
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </ProgressProvider>
  )
}
