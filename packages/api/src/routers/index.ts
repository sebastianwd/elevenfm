import type { RouterClient } from '@orpc/server'

import { albumDetails } from './album.route'
import { getAlbums, getArtist, searchArtist, similarArtists, topSongsByArtist } from './artist.route'
import {
  addSongMetadata,
  addToPlaylist,
  createPlaylist,
  createSongRadio,
  deletePlaylist,
  generatePlaybackUrl,
  generateUploadUrl,
  getPlaylist,
  importPlaylist,
  processAudioUpload,
  removeFromPlaylist,
  updatePlaylist,
  updatePlaylistSongRank,
  userPlaylists
} from './playlist.route'
import { getAlbumBySong, getLyrics, getVideoInfo } from './song.route'
import { me, updateUser } from './user.route'

export const router = {
  album: {
    details: albumDetails
  },
  artist: {
    search: searchArtist,
    get: getArtist,
    topSongs: topSongsByArtist,
    similar: similarArtists,
    albums: getAlbums
  },
  user: {
    me: me,
    update: updateUser
  },
  playlist: {
    import: importPlaylist,
    list: userPlaylists,
    get: getPlaylist,
    create: createPlaylist,
    removeSong: removeFromPlaylist,
    delete: deletePlaylist,
    update: updatePlaylist,
    addSong: addToPlaylist,
    createRadio: createSongRadio,
    updateSongRank: updatePlaylistSongRank,
    generateUploadUrl: generateUploadUrl,
    processAudioUpload: processAudioUpload,
    generatePlaybackUrl: generatePlaybackUrl,
    addSongMetadata: addSongMetadata
  },
  song: {
    videoInfo: getVideoInfo,
    album: getAlbumBySong,
    lyrics: getLyrics
  }
}

export type AppRouter = typeof router
export type AppRouterClient = RouterClient<typeof router>
