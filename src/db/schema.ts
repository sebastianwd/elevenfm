import { createId } from '@paralleldrive/cuid2'
import { relations, sql } from 'drizzle-orm'
import { integer, sqliteTable, text, unique } from 'drizzle-orm/sqlite-core'

export const Users = sqliteTable('users', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  name: text('name').notNull(),
  username: text('username').unique(),
  email: text('email').unique(),
  password: text('password'),
  createdAt: integer('createdAt', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull(),
})

export const UserRelations = relations(Users, ({ many }) => ({
  playlists: many(Playlists),
}))

export const Accounts = sqliteTable('accounts', {
  id: integer('id').primaryKey(),
  userId: text('userId')
    .notNull()
    .references(() => Users.id, { onDelete: 'cascade' }),
  provider: text('provider').notNull(),
  providerAccountId: text('providerAccountId').notNull(),
  createdAt: integer('createdAt', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull(),
})

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
    updatedAt: integer('updatedAt', { mode: 'timestamp' }),
  },
  (s) => ({
    unq: unique().on(s.title, s.artist, s.album),
  })
)

export const Playlists = sqliteTable('playlists', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  name: text('name').notNull(),
  userId: text('userId').notNull(),
  type: text('type').default('playlist'), // playlist, radio
  radioSongId: text('songId').references(() => Songs.id),
  createdAt: integer('createdAt', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }),
})

export const PlaylistRelations = relations(Playlists, ({ one, many }) => ({
  user: one(Users, {
    fields: [Playlists.userId],
    references: [Users.id],
  }),
  playlistsToSongs: many(PlaylistsToSongs),
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
    createdAt: integer('createdAt', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (s) => ({
    unq: unique().on(s.playlistId, s.songId),
  })
)

export const PlaylistToSongRelations = relations(
  PlaylistsToSongs,
  ({ one }) => ({
    playlist: one(Playlists, {
      fields: [PlaylistsToSongs.playlistId],
      references: [Playlists.id],
    }),
    song: one(Songs, {
      fields: [PlaylistsToSongs.songId],
      references: [Songs.id],
    }),
  })
)