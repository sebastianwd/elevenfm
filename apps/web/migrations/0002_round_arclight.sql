DROP INDEX IF EXISTS "playlistsToSongs_playlistId_songId_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "songs_title_artist_album_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "users_username_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "users_email_unique";--> statement-breakpoint
ALTER TABLE `users` ALTER COLUMN "username" TO "username" text NOT NULL DEFAULT '';--> statement-breakpoint
CREATE UNIQUE INDEX `playlistsToSongs_playlistId_songId_unique` ON `playlistsToSongs` (`playlistId`,`songId`);--> statement-breakpoint
CREATE UNIQUE INDEX `songs_title_artist_album_unique` ON `songs` (`title`,`artist`,`album`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
ALTER TABLE `playlistsToSongs` ADD `updatedAt` integer;