'use client'

import { ProgressProvider } from '@bprogress/next/app'
import { queryClient } from '@repo/api/lib/orpc.client'
import { QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'

import { URLDragOverlay } from '~/components/url-drag-overlay'

export const AppProvider = (props: { children: ReactNode }) => {
  const { children } = props

  return (
    <ProgressProvider
      height='4px'
      color='#FC3967'
      options={{ showSpinner: false }}
      shallowRouting
    >
      <QueryClientProvider client={queryClient}>
        {children}

        <URLDragOverlay />
      </QueryClientProvider>
    </ProgressProvider>
  )
}
