/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['www.theaudiodb.com', 'lastfm.freetls.fastly.net'],
  },
  reactStrictMode: false,
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
