// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore-next-line
import { getLyrics as getLyricsRequest } from 'genius-lyrics-api'

import { logger } from '~/server/logger'

import type { GetLyricsOptions } from './types'

const getLyrics = async (args: Pick<GetLyricsOptions, 'artist' | 'title'>) => {
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

  return getLyricsRequest({
    ...args,
    title,
    artist,
    apiKey: process.env.GENIUS_ACCESS_TOKEN!,
    optimizeQuery: false,
    authHeader: true,
    reverseProxy: process.env.PROXY,
  } satisfies GetLyricsOptions) as Promise<string>
}

export { getLyrics }
