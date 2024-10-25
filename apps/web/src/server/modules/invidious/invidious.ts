import Axios, { AxiosError, AxiosResponse } from 'axios'

import { logger } from '~/server/logger'

import {
  GetMixesResponse,
  GetPlaylistById,
  GetVideoById,
  GetVideoSearch,
} from './types'

const getEndpoint = (baseUrl: string, method: string) =>
  `${baseUrl}/api/v1/${method}`

export const invidiousUrls =
  process.env.NEXT_PUBLIC_INVIDIOUS_URLS?.split(',') ?? []

type InvidiousMethods =
  | `videos/${string}`
  | `search?q=${string}`
  | `mixes/RD${string}`
  | `playlists/${string}`

const invidious = async <T>(method: InvidiousMethods) => {
  let response = {} as AxiosResponse<T>

  for (const invidiousUrl of invidiousUrls) {
    try {
      response = await Axios.get<T>(getEndpoint(invidiousUrl, method))

      if (response.status === 200) break
    } catch (e) {
      if (e instanceof AxiosError) {
        logger.info(`Invidious error: ${invidiousUrl} - ${e.response?.data}`)
        if (
          e.response?.data &&
          (String(e.response?.data).includes('Too Many Requests') ||
            String(e.response?.data).includes('502 Bad Gateway'))
        ) {
          continue
        }

        if (
          e.response?.data &&
          'error' in e.response.data &&
          String(e.response?.data.error).includes('Could not create mix')
        ) {
          break
        }
        continue
      }
      logger.info(`Invidious error: ${invidiousUrl} - ${e}`)
      continue
    }
  }

  return response
}

invidious.getVideoInfo = (args: { videoId: string }) =>
  invidious<GetVideoById>(`videos/${args.videoId}`)

invidious.getVideos = async (args: { query: string }) => {
  const response = await invidious<GetVideoSearch>(
    `search?q=${args.query}&sortBy=relevance&page=1`
  )
  return { data: response.data.filter((video) => video.type === 'video') }
}

invidious.getPlaylist = (args: { playlistId: string }) =>
  invidious<GetPlaylistById>(`playlists/${args.playlistId}`)

invidious.getMix = (args: { videoId: string }) =>
  invidious<GetMixesResponse>(`mixes/RD${args.videoId}`)

export { invidious }
