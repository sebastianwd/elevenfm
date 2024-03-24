import Axios, { AxiosResponse } from 'axios'

import { GetVideoById, GetVideoSearch } from './types'

const getEndpoint = (baseUrl: string, method: string) =>
  `${baseUrl}/api/v1/${method}`

const invidiousUrls = process.env.NEXT_PUBLIC_INVIDIOUS_URLS?.split(',') ?? []

type InvidiousMethods = `videos/${string}` | `search?q=${string}`

const invidious = async <T>(method: InvidiousMethods) => {
  let response = {} as AxiosResponse<T>

  for (const invidiousUrl of invidiousUrls) {
    try {
      response = await Axios.get<T>(getEndpoint(invidiousUrl, method))

      if (response.status === 200) break
    } catch (e) {
      throw new Error(e as string)
    }
  }

  return response
}

invidious.getVideoInfo = (args: { videoId: string }) =>
  invidious<GetVideoById>(`videos/${args.videoId}`)

invidious.getVideos = (args: { query: string }) =>
  invidious<GetVideoSearch>(
    `search?q=${args.query}&sortBy=relevance&page=1&type=video`
  )

export { invidious }
