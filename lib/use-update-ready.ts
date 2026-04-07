import { useEffect, useState } from 'react'

const POLL_MS = 30_000 // check every 30 seconds

export function useUpdateReady() {
  const [updateReady, setUpdateReady] = useState(false)

  useEffect(() => {
    // Next.js 14 always embeds __NEXT_DATA__ with the current buildId
    const buildId = (window as unknown as { __NEXT_DATA__?: { buildId?: string } })
      .__NEXT_DATA__?.buildId

    if (!buildId) return

    let active = true

    const check = async () => {
      if (!active) return
      try {
        // HEAD the current build's manifest — 404 means a new deploy replaced it
        const res = await fetch(
          `/_next/static/${buildId}/_buildManifest.js`,
          { method: 'HEAD', cache: 'no-store' },
        )
        if (res.status === 404) {
          setUpdateReady(true)
        }
      } catch {
        // Network error / offline — ignore
      }
    }

    const timer = setInterval(check, POLL_MS)

    const onVisible = () => {
      if (document.visibilityState === 'visible') check()
    }
    document.addEventListener('visibilitychange', onVisible)

    // Instant signal from service worker (bonus, catches updates immediately)
    if ('serviceWorker' in navigator) {
      let hadController = !!navigator.serviceWorker.controller
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (hadController) setUpdateReady(true)
        hadController = true
      })
    }

    return () => {
      active = false
      clearInterval(timer)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [])

  return updateReady
}
