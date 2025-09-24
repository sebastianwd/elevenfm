import type { ArtistSortableProperties } from './store/use-local-settings'

export const playlistType = {
  PLAYLIST: 1,
  RADIO: 2,
} as const

export const dbErrorCodes = {
  SQLITE_CONSTRAINT_UNIQUE: 'SQLITE_CONSTRAINT_UNIQUE',
} as const

export const sortablePropertiesMapping = {
  default: 'default',
  title: 'title',
  scrobbles: 'playcount',
} as const satisfies Record<ArtistSortableProperties, string>
