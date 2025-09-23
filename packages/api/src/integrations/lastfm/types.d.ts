export type ArtistGetInfo = {
  artist?: {
    name: string
    mbid: string
    url: string
    image: Array<{
      '#text': string
      size: string
    }>
    streamable: string
    ontour: string
    stats: {
      listeners: string
      playcount: string
    }
    similar: {
      artist: Array<{
        name: string
        url: string
        image: Array<{
          '#text': string
          size: string
        }>
      }>
    }
    tags?: {
      tag: Array<{
        name: string
        url: string
      }>
    }
    bio?: {
      links: {
        link: {
          '#text': string
          rel: string
          href: string
        }
      }
      published: string
      summary: string
      content: string
    }
  }
}

export type GetTopTracks = {
  toptracks?: {
    track: Array<{
      name: string
      playcount: string
      listeners: string
      mbid?: string
      url: string
      streamable: string
      artist: {
        name: string
        mbid: string
        url: string
      }
      image: Array<{
        '#text': string
        size: string
      }>
      '@attr': {
        rank: string
      }
    }>
    '@attr': {
      artist: string
      page: string
      perPage: string
      totalPages: string
      total: string
    }
  }
}

export type TrackGetInfo = {
  track?: {
    name: string
    mbid: string
    url: string
    duration: string
    streamable: {
      '#text': string
      fulltrack: string
    }
    listeners: string
    playcount: string
    artist: {
      name: string
      mbid: string
      url: string
    }
    album: {
      artist: string
      title: string
      mbid: string
      url: string
      image?: Array<{
        '#text': string
        size: string
      }>
      '@attr': {
        position: string
      }
    }
    toptags: {
      tag: Array<{
        name: string
        url: string
      }>
    }
  }
}

export type ArtistSearch = {
  results: {
    'opensearch:Query': {
      '#text': string
      role: string
      searchTerms: string
      startPage: string
    }
    'opensearch:totalResults': string
    'opensearch:startIndex': string
    'opensearch:itemsPerPage': string
    artistmatches: {
      artist: Array<{
        name: string
        listeners: string
        mbid: string
        url: string
        streamable: string
        image: Array<{
          '#text': string
          size: string
        }>
      }>
    }
    '@attr': {
      for: string
    }
  }
}

export type ArtistGetSimilar = {
  similarartists?: {
    artist: Array<{
      name: string
      mbid?: string
      match: string
      url: string
      image: Array<{
        '#text': string
        size: string
      }>
      streamable: string
    }>
    '@attr': {
      artist: string
    }
  }
}

export type AlbumGetInfo = {
  album: {
    artist: string
    mbid: string
    tags: {
      tag: Array<{
        url: string
        name: string
      }>
    }
    playcount: string
    image: Array<{
      size: string
      '#text': string
    }>
    tracks?: {
      track:
        | Array<{
            streamable: {
              fulltrack: string
              '#text': string
            }
            duration?: number
            url: string
            name: string
            '@attr': {
              rank: number
            }
            artist: {
              url: string
              name: string
              mbid: string
            }
          }>
        | {
            streamable: {
              fulltrack: string
              '#text': string
            }
            duration?: number
            url: string
            name: string
            '@attr': {
              rank: number
            }
            artist: {
              url: string
              name: string
              mbid: string
            }
          }
    }
    url: string
    name: string
    listeners: string
    wiki?: {
      published: string
      summary: string
      content: string
    }
  }
}

export type ArtistGetTopAlbums = {
  topalbums?: {
    album: Array<{
      name: string
      playcount: number
      mbid?: string
      url: string
      artist: {
        name: string
        mbid: string
        url: string
      }
      image: Array<{
        '#text': string
        size: string
      }>
    }>
    '@attr': {
      artist: string
      page: string
      perPage: string
      totalPages: string
      total: string
    }
  }
}
