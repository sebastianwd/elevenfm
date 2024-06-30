// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { getLyrics as getLyricsRequest } from 'genius-lyrics-api'

import { GetLyricsOptions } from './types'

const getLyrics = (args: Pick<GetLyricsOptions, 'artist' | 'title'>) => {
  const [title, artist] = `${args.title}▲${args.artist}`
    .toLowerCase()
    .replace(/ *\([^)]*\) */g, '')
    .replace(/ *\[[^\]]*]/, '')
    .replace(/\b(feat\.|ft\.)\b/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .split('▲')

  return getLyricsRequest({
    ...args,
    title,
    artist,
    apiKey: process.env.GENIUS_ACCESS_TOKEN!,
    optimizeQuery: false,
  } satisfies GetLyricsOptions) as Promise<string>
}

export { getLyrics }
