import { type BaseContext } from '@apollo/server'
import { type Session } from 'next-auth'

export interface Context extends BaseContext {
  session: Session | null
}

export interface PlayableSong {
  title: string
  albumCoverUrl?: string | null
  playcount?: string | null
  artist: string
  rank?: string | null
  songUrl?: string | null
  createdAt?: string | null
  id?: string
}
