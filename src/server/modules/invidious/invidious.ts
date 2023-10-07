import Axios from 'axios'

import { GetVideoById, GetVideoSearch } from './types'

const getEndpoint = (method: string) =>
  `${process.env.NEXT_PUBLIC_INVIDIOUS_URL}/api/v1/${method}`

type InvidiousMethods = `videos/${string}` | `search?q=${string}`

const invidious = async <T>(method: InvidiousMethods) => {
  const url = getEndpoint(method)

  return Axios.get<T>(url)
}

invidious.getVideoInfo = (args: { videoId: string }) =>
  invidious<GetVideoById>(`videos/${args.videoId}`)

invidious.getVideos = (args: { query: string }) =>
  invidious<GetVideoSearch>(
    `search?q=${args.query}&sortBy=relevance&page=1&type=video`
  )

export { invidious }
