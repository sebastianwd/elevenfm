// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { getLyrics as getLyricsRequest } from 'genius-lyrics-api'

import { GetLyricsOptions } from './types'

const getLyrics = (args: Pick<GetLyricsOptions, 'artist' | 'title'>) =>
  getLyricsRequest({
    ...args,
    apiKey: process.env.GENIUS_ACCESS_TOKEN,
    optimizeQuery: true,
  } as GetLyricsOptions) as Promise<string>

export { getLyrics }
