export const playlistType = {
  PLAYLIST: 1,
  RADIO: 2,
} as const

export const dbErrorCodes = {
  SQLITE_CONSTRAINT_UNIQUE: 'SQLITE_CONSTRAINT_UNIQUE',
} as const

export const queryKeys = {
  videoInfo: (query: string) => ['getVideoInfo', query],
}
