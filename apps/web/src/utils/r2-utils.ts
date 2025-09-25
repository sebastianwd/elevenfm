/**
 * Detects if a URL is an R2 file key (starts with 'uploads/')
 */
export const isR2FileKey = (url: string): boolean => {
  return url.startsWith('uploads/')
}

/**
 * Detects if a URL is an R2 presigned URL (contains R2 domain)
 */
export const isR2Url = (url: string): boolean => {
  return (
    url.includes('r2.cloudflarestorage.com') || url.includes('amazonaws.com')
  )
}
