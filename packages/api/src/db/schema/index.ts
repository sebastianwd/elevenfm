import { init } from '@paralleldrive/cuid2'
import { createSelectSchema } from 'drizzle-arktype'
import { relations, sql } from 'drizzle-orm'
import { integer, sqliteTable, text, unique } from 'drizzle-orm/sqlite-core'

import { Accounts, Users } from './auth'

const createId = init({
  length: 14
})

export const UserSelectSchema = createSelectSchema(Users)

export const UserRelations = relations(Users, ({ many }) => ({
  playlists: many(Playlists)
}))

export const AccountSelectSchema = createSelectSchema(Accounts)

export const Songs = sqliteTable(
  'songs',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    title: text('title').notNull(),
    artist: text('artist').notNull(),
    album: text('album').default(''),
    createdAt: integer('createdAt', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: integer('updatedAt', { mode: 'timestamp' })
  },
  (s) => [unique().on(s.title, s.artist, s.album)]
)

export const Playlists = sqliteTable('playlists', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  name: text('name').notNull(),
  userId: text('userId').notNull(),
  // 1 = playlist, 2 = radio
  type: integer('type').notNull().default(1),
  radioSongId: text('radioSongId').references(() => Songs.id),
  createdAt: integer('createdAt', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer('updatedAt', { mode: 'timestamp' })
})

export const PlaylistRelations = relations(Playlists, ({ one, many }) => ({
  user: one(Users, {
    fields: [Playlists.userId],
    references: [Users.id]
  }),
  playlistsToSongs: many(PlaylistsToSongs)
}))

export const PlaylistsToSongs = sqliteTable(
  'playlistsToSongs',
  {
    playlistId: text('playlistId')
      .notNull()
      .references(() => Playlists.id, { onDelete: 'cascade' }),
    songId: text('songId')
      .notNull()
      .references(() => Songs.id),
    // for direct urls
    songUrl: text('songUrl'),
    rank: text('rank'),
    createdAt: integer('createdAt', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: integer('updatedAt', { mode: 'timestamp' })
  },
  (s) => [unique().on(s.playlistId, s.songId)]
)

export const PlaylistToSongRelations = relations(PlaylistsToSongs, ({ one }) => ({
  playlist: one(Playlists, {
    fields: [PlaylistsToSongs.playlistId],
    references: [Playlists.id]
  }),
  song: one(Songs, {
    fields: [PlaylistsToSongs.songId],
    references: [Songs.id]
  })
}))
