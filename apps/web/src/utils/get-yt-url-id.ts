import getYoutubeId from 'get-youtube-id'
export const ytGetId = (url: string) => {
  try {
    const playlistMatch = url.match(/(?<=list=)[^&]+/)

    if (playlistMatch) {
      return {
        type: 'playlist' as const,
        id: playlistMatch[0],
      }
    }

    const videoId = getYoutubeId(url)
    if (videoId) {
      return {
        type: 'video' as const,
        id: videoId,
      }
    }
    return null
  } catch (e) {
    console.error(`Error in ytGetId: ${e}, url: ${url}`)
    return null
  }
}
