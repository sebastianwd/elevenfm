export interface PlayableSong {
  title: string
  albumCoverUrl?: string | null
  playcount?: string | null
  artist: string
  rank?: string | null
  songUrl?: string | null
  createdAt?: Date | null
  id?: string
}
