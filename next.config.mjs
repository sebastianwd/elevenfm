const externalImageUrls = process.env.NEXT_PUBLIC_INVIDIOUS_URLS.split(',')

/** @type {import('next').NextConfig} */
const nextConfig = {
  // https://github.com/nextauthjs/next-auth/discussions/9385
  transpilePackages: ['next-auth'],
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'www.theaudiodb.com',
      },
      {
        protocol: 'https',
        hostname: 'www.theaudiodb.com',
      },
      {
        protocol: 'https',
        hostname: 'lastfm.freetls.fastly.net',
      },
      ...externalImageUrls.map((url) => {
        const { protocol, hostname } = new URL(url)

        return { protocol: protocol.replace(':', ''), hostname }
      }),
    ],
  },
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config) => {
    if (!config.experiments) {
      config.experiments = {}
    }
    config.experiments.topLevelAwait = true
    return config
  },
}

export default nextConfig
