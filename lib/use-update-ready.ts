import { useEffect, useState } from 'react'

const POLL_MS = 60_000 // check every minute

export function useUpdateReady() {
  const [updateReady, setUpdateReady] = useState(false)

  useEffect(() => {
    let initial: string | null = null
    let active = true

    const check = async () => {
      if (!active) return
      try {
        const res = await fetch('/api/version', { cache: 'no-store' })
        if (!res.ok) return
        const { v } = (await res.json()) as { v: string }
        if (!v) return
        if (initial === null) {
          // First call — store the baseline version for this page load
          initial = v
          return
        }
        if (v !== initial) {
          setUpdateReady(true)
        }
      } catch {
        // Offline or server error — ignore silently
      }
    }

    // Immediate baseline fetch, then poll
    check()
    const timer = setInterval(check, POLL_MS)

    // Also re-check whenever the user returns to the tab
    const onVisible = () => {
      if (document.visibilityState === 'visible') check()
    }
    document.addEventListener('visibilitychange', onVisible)

    // SW-based instant detection as a bonus (fires right when the new SW
    // takes control, no polling delay needed)
    if ('serviceWorker' in navigator) {
      let hadController = !!navigator.serviceWorker.controller
      const onControllerChange = () => {
        if (hadController) setUpdateReady(true)
        hadController = true
      }
      navigator.serviceWorker.addEventListener('controllerchange', onControllerChange)
    }

    return () => {
      active = false
      clearInterval(timer)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [])

  return updateReady
}
