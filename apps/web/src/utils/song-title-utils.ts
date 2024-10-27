export const splitArtist = (artist: string) =>
  artist.split(' & ').join(',').split(',')

export const getMainArtist = (artist: string) => splitArtist(artist)[0]

export const sanitizeSongTitle = (title: string) => {
  const sanitizedTitle = title
    .replace(/w\/.*/, '')
    .replace(/\(.*\)/, '')
    .trim()

  return sanitizedTitle ? sanitizedTitle : title
}
