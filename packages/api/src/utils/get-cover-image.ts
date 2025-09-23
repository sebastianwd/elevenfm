import { coalesce } from '@repo/utils/coalesce'
import { groupBy } from 'es-toolkit'

import type { TrackGetInfo } from '../integrations/lastfm/types'

export const getCoverImage = (images: TrackGetInfo['track']['album']['image']) => {
  if (!images) {
    return undefined
  }

  const coverImages = groupBy(images, (item) => item.size)

  const imageSizes = ['extralarge', 'large', 'medium']

  const defaultValue = [{ '#text': '' }]

  const [coverImage] = coalesce(coverImages, imageSizes, defaultValue)

  return coverImage?.['#text']
}
