import { Innertube } from 'youtubei.js'

const innertube = await Innertube.create({ lang: 'en', location: 'US' })

type Video = Extract<
  Awaited<ReturnType<(typeof innertube)['search']>>['videos'][number],
  { id: string; video_id: string; is_watched: boolean }
>
export type { Video }

export const searchVideos: (typeof innertube)['search'] = async (query, options = { type: 'video' }) => {
  return await innertube.search(query, options)
}

export const getVideoInfo: (typeof innertube)['getInfo'] = async (videoId) => {
  return await innertube.getInfo(videoId)
}
