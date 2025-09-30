import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.imgflip.com',
      },
    ],
  },
  outputFileTracingRoot: require('path').join(__dirname),
  output: 'standalone',
}

export default nextConfig