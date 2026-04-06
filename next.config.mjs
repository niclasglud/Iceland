import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const withPWA = require('next-pwa')

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['maplibre-gl'],
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'source.unsplash.com' },
      { protocol: 'https', hostname: 'api.maptiler.com' },
      { protocol: 'https', hostname: 'images.pexels.com' },
    ],
  },
}

export default withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  fallbacks: {
    document: '/offline',
  },
  runtimeCaching: [
    // API routes — network first, fall back to cache when offline
    {
      urlPattern: /^\/api\//,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'iceland-api',
        networkTimeoutSeconds: 8,
        expiration: {
          maxEntries: 60,
          maxAgeSeconds: 60 * 60 * 24, // 24 hours
        },
        cacheableResponse: { statuses: [0, 200] },
      },
    },
    // MapTiler tiles — stale-while-revalidate, cached 7 days
    {
      urlPattern: /^https:\/\/api\.maptiler\.com\/.*/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'map-tiles',
        expiration: {
          maxEntries: 1000,
          maxAgeSeconds: 60 * 60 * 24 * 7,
        },
        cacheableResponse: { statuses: [0, 200] },
      },
    },
    // Pexels images — cache first, refresh after 30 days
    {
      urlPattern: /^https:\/\/images\.pexels\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'pexels-images',
        expiration: {
          maxEntries: 300,
          maxAgeSeconds: 60 * 60 * 24 * 30,
        },
        cacheableResponse: { statuses: [0, 200] },
      },
    },
    // Next.js static assets — cache first
    {
      urlPattern: /^\/_next\/static\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'next-static',
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 60 * 60 * 24 * 365,
        },
      },
    },
    // Next.js image optimisation
    {
      urlPattern: /^\/_next\/image\?.*/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'next-images',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 60 * 60 * 24 * 7,
        },
      },
    },
  ],
})(nextConfig)
