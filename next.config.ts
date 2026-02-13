import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  experimental: {
    reactCompiler: false,
  },
  async redirects() {
    return [{ source: '/favicon.ico', destination: '/favicon.svg', permanent: false }]
  },
  images: {
    remotePatterns: [
      // Localhost with and without port so media URLs work in admin and frontend
      { protocol: 'http', hostname: 'localhost', port: '', pathname: '/**' },
      { protocol: 'http', hostname: 'localhost', port: '3000', pathname: '/**' },
      { protocol: 'http', hostname: '127.0.0.1', port: '', pathname: '/**' },
      { protocol: 'http', hostname: '127.0.0.1', port: '3000', pathname: '/**' },
      { protocol: 'https', hostname: 'localhost', pathname: '/**' },
      { protocol: 'https', hostname: '*.vercel.app', pathname: '/**' },
    ],
  },
}

export default withPayload(nextConfig)
