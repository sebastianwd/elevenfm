export const getBaseUrl = () => {
  if (process.env.NODE_ENV === 'development') {
    return `${process.env.NEXT_PUBLIC_SITE_URL}`
  }

  return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
}
