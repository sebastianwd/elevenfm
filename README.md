# ElevenFM

A music streaming webapp that uses YouTube to get the audio and video. It is built with [Next.js](https://nextjs.org/), Tailwind, [Apollo](https://www.apollographql.com/) and [Tanstack Query](https://tanstack.com/query/latest). The artist and album data is provided by Last.fm and TheAudioDB APIs.

![Main page screenshot](resources/image.png)

## Features

- Search for artists.
- View artist details and discography.
- Play albums and tracks.
- Autoplay artist's tracks.
- Add tracks to queue.
- View lyrics.
- Randomize the queue.
- Create playlists.
- Import playlists from Spotify.

## Installation

Clone the repository and run `pnpm install` to install the dependencies. Then run `pnpm run dev` to start the development server.

## Environment variables

- `LASTFM_API_KEY` - Last.fm API key
- `AUDIODB_API_KEY` - TheAudioDB API key
- `GENIUS_ACCESS_TOKEN` - Genius API access token for lyrics
- `NEXT_PUBLIC_INVIDIOUS_URLS` - Invidious instances to get YouTube video embeds
- `NEXT_PUBLIC_SITE_URL` - Site URL for CORS
- `TURSO_CONNECTION_URL` and `TURSO_AUTH_TOKEN` - [Turso](https://docs.turso.tech/sdk/ts/quickstart) variables

## Other commands

- `pnpm run gen` - Generate GraphQL types
- `pnpm run build` - Build the app for production
- `pnpm run update` - Run npm-check-updates and update dependencies
