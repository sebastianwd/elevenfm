export type GetVideoById = {
  type: string
  title: string
  videoId: string
  videoThumbnails: Array<{
    quality: string
    url: string
    width: number
    height: number
  }>
  storyboards: Array<{
    url: string
    templateUrl: string
    width: number
    height: number
    count: number
    interval: number
    storyboardWidth: number
    storyboardHeight: number
    storyboardCount: number
  }>
  description: string
  descriptionHtml: string
  published: number
  publishedText: string
  keywords: Array<string>
  viewCount: number
  likeCount: number
  dislikeCount: number
  paid: boolean
  premium: boolean
  isFamilyFriendly: boolean
  allowedRegions: Array<string>
  genre: string
  genreUrl: string
  author: string
  authorId: string
  authorUrl: string
  authorThumbnails: Array<{
    url: string
    width: number
    height: number
  }>
  subCountText: string
  lengthSeconds: number
  allowRatings: boolean
  rating: number
  isListed: boolean
  liveNow: boolean
  isUpcoming: boolean
  dashUrl: string
  adaptiveFormats: Array<{
    init: string
    index: string
    bitrate: string
    url: string
    itag: string
    type: string
    clen: string
    lmt: string
    projectionType: string
    fps?: number
    container?: string
    encoding?: string
    audioQuality?: string
    audioSampleRate?: number
    audioChannels?: number
    resolution?: string
    qualityLabel?: string
    colorInfo?: {
      primaries: string
      transferCharacteristics: string
      matrixCoefficients: string
    }
  }>
  formatStreams: Array<{
    url: string
    itag: string
    type: string
    quality: string
    fps: number
    container: string
    encoding: string
    resolution: string
    qualityLabel: string
    size: string
  }>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  captions: Array<any>
  musicTracks: Array<{
    song: string
    artist: string
    album: string
    license: string
  }>
  recommendedVideos: Array<{
    videoId: string
    title: string
    videoThumbnails: Array<{
      quality: string
      url: string
      width: number
      height: number
    }>
    author: string
    authorUrl: string
    authorId: string
    lengthSeconds: number
    viewCountText: string
    viewCount: number
  }>
}

export type GetVideoSearch = Array<{
  type: 'video' | 'playlist' | (string & {})
  title: string
  videoId: string
  author: string
  authorId: string
  authorUrl: string
  authorVerified: boolean
  videoThumbnails: Array<{
    quality: string
    url: string
    width: number
    height: number
  }>
  description: string
  descriptionHtml: string
  viewCount: number
  viewCountText: string
  published: number
  publishedText: string
  lengthSeconds: number
  liveNow: boolean
  premium: boolean
  isUpcoming: boolean
}>

type GetMixesResponse = {
  title: string
  mixId: string
  videos: {
    title: string
    videoId: string
    author: string
    authorId: string
    authorUrl: string
    videoThumbnails: {
      quality: string
      url: string
      width: number
      height: number
    }[]
    index: number
    lengthSeconds: number
  }[]
}

export type GetPlaylistById = {
  title: string
  playlistId: string
  author: string
  authorId: string
  authorThumbnails: {
    url: string
    width: string
    height: string
  }[]
  description: string
  descriptionHtml: string
  videoCount: number
  viewCount: bigint
  updated: bigint
  videos: {
    title: string
    videoId: string
    author: string
    authorId: string
    authorUrl: string
    videoThumbnails: {
      quality: string
      url: string
      width: number
      height: number
    }[]
    index: number
    lengthSeconds: number
  }[]
}
