import type { Metadata, Viewport } from 'next'
import './globals.css'

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
    apple: '/icons/apple-touch-icon.png',
    icon: '/icons/favicon-32x32.png',
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
      </head>
      <body className="overflow-hidden bg-[#0a0b0e] text-white antialiased">
        {children}
      </body>
    </html>
  )
}
