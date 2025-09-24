'use client'

import { orpc, queryClient } from '@repo/api/lib/orpc.client'
import { debounce } from 'es-toolkit'
import { useRouter } from 'next/navigation'
import type { ComponentProps } from 'react'
import { useCallback, useEffect, useState } from 'react'

import { CommandPalette } from '~/components/command-palette'
import { useGlobalSearchStore } from '~/store/use-global-search'

export const ArtistSearchCommand = () => {
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

      const searchArtistQueryResponse = await queryClient.fetchQuery(
        orpc.artist.search.queryOptions({
          input: { artist: value },
        })
      )

      setResults(searchArtistQueryResponse)
      setIsSearching(false)
    }, 300),
    []
  )

  useEffect(() => {
    if (search) {
      delayedSearch(search)
    }
  }, [delayedSearch, search])

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
