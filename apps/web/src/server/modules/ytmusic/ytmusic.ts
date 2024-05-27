import { Client, PlaylistCompact } from 'youtubei'

const youtube = new Client()

export const ytmusic = {
  getMix: async (videoId: string) => {
    const videoInfo = await youtube.getVideo(videoId)
    const mixPlaylist = videoInfo?.related.items.find(
      (item) => item instanceof PlaylistCompact
    )

    if (!mixPlaylist) return null

    return youtube.getPlaylist(mixPlaylist?.id ?? '')
  },
}
