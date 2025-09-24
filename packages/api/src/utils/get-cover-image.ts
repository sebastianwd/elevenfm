import { coalesce } from '@repo/utils/coalesce'
import { groupBy } from 'es-toolkit'

export const getLastFMCoverImage = (
  images: Array<{
    '#text': string
    size: string
  }>
) => {
  const coverImages = groupBy(images, (item) => item.size)

  const imageSizes = ['extralarge', 'large', 'medium']

  const defaultValue = [{ '#text': '' }]

  const [coverImage] = coalesce(coverImages, imageSizes, defaultValue)

  return coverImage?.['#text']
}
