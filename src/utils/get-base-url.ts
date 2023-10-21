export function getBaseURL() {
  if (process.env.VERCEL_ENV === 'preview')
    return `https://${process.env.VERCEL_URL}`

  return process.env.NEXT_PUBLIC_SITE_URL
}
