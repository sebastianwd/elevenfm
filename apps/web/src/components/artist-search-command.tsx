'use client'

import { orpc, queryClient } from '@repo/api/lib/orpc.client'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import type { ComponentProps } from 'react'
import { useEffect, useState } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'

import { CommandPalette } from '~/components/command-palette'
import { useGlobalSearchStore } from '~/store/use-global-search'

export const ArtistSearchCommand = () => {
  const { isOpen, setIsOpen, search, setSearch } = useGlobalSearchStore()

  const router = useRouter()

  const [isSearching, setIsSearching] = useState(false)

  const searchQuery = useQuery({
    queryKey: ['artist-search', search],
    queryFn: async () => {
      if (!search || search.length < 3) return []

      const response = await queryClient.fetchQuery(
        orpc.artist.search.queryOptions({
          input: { artist: search },
        })
      )
      return response
    },
    enabled: !!search && search.length >= 3,
    staleTime: 5 * 60 * 1000,
  })

  useEffect(() => {
    setIsSearching(searchQuery.isFetching)
  }, [searchQuery.isFetching, setIsSearching])

  useHotkeys(
    'ctrl+k',
    (event) => {
      event.preventDefault()
      setIsOpen(true)
    },
    {
      enableOnFormTags: true,
    }
  )

  const onSelect: ComponentProps<typeof CommandPalette>['onSelect'] = (
    value
  ) => {
    if (!value) return
    setIsOpen(false)
    router.push(`/artist/${value}`)
  }

  return (
    <CommandPalette
      onSelect={onSelect}
      commands={searchQuery.data || []}
      value={search}
      isLoading={isSearching}
      hasSearched={searchQuery.isFetched}
      onInputChange={(value) => {
        setSearch(value)
      }}
      isOpen={isOpen}
      onClose={() => {
        setSearch('')
        setIsOpen(false)
      }}
    />
  )
}
