import { useEffect, useState } from 'react'

export function useUpdateReady() {
  const [updateReady, setUpdateReady] = useState(false)

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return

    let hadController = !!navigator.serviceWorker.controller

    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (hadController) setUpdateReady(true)
      hadController = true
    })

    navigator.serviceWorker.getRegistration().then((reg) => {
      if (!reg) return
      if (reg.waiting && navigator.serviceWorker.controller) {
        setUpdateReady(true)
        return
      }
      reg.addEventListener('updatefound', () => {
        const worker = reg.installing
        if (!worker) return
        worker.addEventListener('statechange', () => {
          if (worker.state === 'installed' && navigator.serviceWorker.controller) {
            setUpdateReady(true)
          }
        })
      })
    })

    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        navigator.serviceWorker.getRegistration().then((reg) => reg?.update().catch(() => {}))
      }
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [])

  return updateReady
}
