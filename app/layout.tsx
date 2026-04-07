import type { Metadata, Viewport } from 'next'
import './globals.css'
import OfflineBanner from '@/components/layout/OfflineBanner'
import UpdateBanner from '@/components/layout/UpdateBanner'

export const metadata: Metadata = {
  title: 'Iceland Explorer — Spots, 3D Map & Northern Lights',
  description:
    'Discover Iceland\'s most beautiful hidden gems, popular spots, and highland treasures. Interactive 3D terrain map, northern lights tracker, golden hour planner, and offline navigation.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Iceland Explorer',
  },
  icons: {
    apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180' }],
    icon: [
      { url: '/icons/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icons/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/icon-192.png',      sizes: '192x192', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
  },
}

export const viewport: Viewport = {
  themeColor: '#0a0b0e',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="preconnect" href="https://api.maptiler.com" />
        <link rel="stylesheet" href="https://unpkg.com/maplibre-gl@5.16.0/dist/maplibre-gl.css" />
      </head>
      <body className="overflow-hidden bg-[#0a0b0e] text-white antialiased">
        <OfflineBanner />
        <UpdateBanner />
        {children}
      </body>
    </html>
  )
}
