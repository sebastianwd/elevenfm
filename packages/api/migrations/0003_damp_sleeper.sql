CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`expiresAt` integer NOT NULL,
	`token` text NOT NULL,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL,
	`updatedAt` integer NOT NULL,
	`ipAddress` text,
	`userAgent` text,
	`userId` text NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `sessions_token_unique` ON `sessions` (`token`);--> statement-breakpoint
CREATE TABLE `verifications` (
	`id` text PRIMARY KEY NOT NULL,
	`identifier` text NOT NULL,
	`value` text NOT NULL,
	`expiresAt` integer NOT NULL,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL,
	`updatedAt` integer
);
--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_accounts` (
	`id` text PRIMARY KEY NOT NULL,
	`accountId` text NOT NULL,
	`providerId` text NOT NULL,
	`userId` text NOT NULL,
	`accessToken` text,
	`refreshToken` text,
	`idToken` text,
	`accessTokenExpiresAt` integer,
	`refreshTokenExpiresAt` integer,
	`scope` text,
	`password` text,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL,
	`updatedAt` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_accounts`("id", "accountId", "providerId", "userId", "accessToken", "refreshToken", "idToken", "accessTokenExpiresAt", "refreshTokenExpiresAt", "scope", "password", "createdAt", "updatedAt") SELECT "id", "providerAccountId", "provider", "userId", NULL, NULL, NULL, NULL, NULL, NULL, NULL, "createdAt", "updatedAt" FROM `accounts`;--> statement-breakpoint
DROP TABLE `accounts`;--> statement-breakpoint
ALTER TABLE `__new_accounts` RENAME TO `accounts`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
DROP INDEX "sessions_token_unique";--> statement-breakpoint
DROP INDEX "users_username_unique";--> statement-breakpoint
DROP INDEX "users_email_unique";--> statement-breakpoint
DROP INDEX "playlistsToSongs_playlistId_songId_unique";--> statement-breakpoint
DROP INDEX "songs_title_artist_album_unique";--> statement-breakpoint
ALTER TABLE `users` ALTER COLUMN "name" TO "name" text;--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `playlistsToSongs_playlistId_songId_unique` ON `playlistsToSongs` (`playlistId`,`songId`);--> statement-breakpoint
CREATE UNIQUE INDEX `songs_title_artist_album_unique` ON `songs` (`title`,`artist`,`album`);--> statement-breakpoint
ALTER TABLE `users` ADD `emailVerified` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `image` text;--> statement-breakpoint
INSERT INTO `accounts` (`id`, `accountId`, `providerId`, `userId`, `password`, `createdAt`, `updatedAt`) SELECT `id`, `id`, 'credential', `id`, `password`, `createdAt`, `updatedAt` FROM `users` WHERE `users`.`id` NOT IN (SELECT `userId` FROM `accounts`) AND `users`.`password` IS NOT NULL;--> statement-breakpoint
UPDATE `accounts` SET `password` = (SELECT `password` FROM `users` WHERE `users`.`id` = `accounts`.`userId`) WHERE `accounts`.`password` IS NULL;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `password`;