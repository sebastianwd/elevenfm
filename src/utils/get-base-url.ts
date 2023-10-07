const IS_SERVER = typeof window === 'undefined'

export function getBaseURL(path: string) {
  const baseURL = IS_SERVER
    ? process.env.NEXT_PUBLIC_SITE_URL!
    : window.location.origin
  return new URL(path, baseURL).toString()
}
