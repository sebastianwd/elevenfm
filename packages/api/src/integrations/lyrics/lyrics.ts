// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore-next-line
import { getLyrics as getLyricsRequest } from 'genius-lyrics-api'

import { cache } from '../../utils/cache'
import { logger } from '../../utils/logger'
import type { GetLyricsOptions } from './types'

const extractLyricsFromResponse = (lyricsText: string): string => {
  const breakingWord = 'Lyrics'
  const lyricsIndex = lyricsText.indexOf(breakingWord)

  if (lyricsIndex !== -1) {
    return lyricsText.substring(lyricsIndex + breakingWord.length).trim()
  }

  return lyricsText.trim()
}

export const getLyrics = async (args: Pick<GetLyricsOptions, 'artist' | 'title'>) => {
  const [title, artist] = `${args.title}▲${args.artist}`
    .toLowerCase()
    .replace(/ *\([^)]*\) */g, '')
    .replace(/ *\[[^\]]*]/, '')
    .replace(/\b(feat\.|ft\.)\b/g, '')
    .replace(/\s+/g, ' ')
    .replace('<3', '')
    .trim()
    .split('▲')

  logger.info(`Fetching lyrics for ${title} by ${artist}`)

  for (const proxy of process.env.PROXY?.split(',') ?? []) {
    const cacheKey = `rateLimit:${proxy}`
    if (cache.has(cacheKey)) {
      continue
    }

    try {
      const result = await getLyricsRequest({
        ...args,
        title: title || '',
        artist: artist || '',
        apiKey: process.env.GENIUS_ACCESS_TOKEN!,
        optimizeQuery: false,
        authHeader: true,
        reverseProxy: proxy
      } satisfies GetLyricsOptions)

      logger.info(`Successfully fetched lyrics using proxy: ${proxy}`)

      return extractLyricsFromResponse(result)
    } catch (error) {
      logger.warn(`Proxy ${proxy} failed: ${String(error)}`)
      cache.set(cacheKey, 'true')
    }
  }

  logger.error('All proxy options failed')
}
