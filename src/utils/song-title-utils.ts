export const splitArtist = (artist: string) =>
  artist.split(' & ').join(',').split(',')

export const sanitizeSongTitle = (title: string) => {
  const sanitizedTitle = title
    .replace(/w\//, '')
    .replace(/\(.*\)/, '')
    .trim()

  return sanitizedTitle ? sanitizedTitle : title
}
