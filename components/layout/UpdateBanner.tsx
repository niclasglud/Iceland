'use client'
import { useEffect, useState } from 'react'

export default function UpdateBanner() {
  const [updateReady, setUpdateReady] = useState(false)

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return

    // Track whether a SW was already controlling this page
    let hadController = !!navigator.serviceWorker.controller

    // controllerchange fires when a new SW takes over (skipWaiting: true means this happens immediately after install)
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (hadController) {
        setUpdateReady(true)
      }
      hadController = true
    })

    // Also catch the case where a worker is already waiting when the page loads
    navigator.serviceWorker.getRegistration().then((reg) => {
      if (!reg) return

      // Already has a waiting worker (user had the tab open before update finished)
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

    // Poll for updates when the user returns to the tab
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        navigator.serviceWorker.getRegistration().then((reg) => reg?.update().catch(() => {}))
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [])

  if (!updateReady) return null

  return (
    <>
      <style>{`
        @keyframes glow-pulse {
          0%, 100% { box-shadow: 0 0 10px 2px rgba(245,166,35,0.6), 0 2px 12px rgba(0,0,0,0.5); }
          50%       { box-shadow: 0 0 22px 6px rgba(245,166,35,0.95), 0 2px 16px rgba(0,0,0,0.5); }
        }
      `}</style>
      <div
        style={{
          position: 'fixed',
          bottom: 72,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 9998,
        }}
      >
        <button
          onClick={() => window.location.reload()}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: '#f5a623',
            color: '#0a0b0e',
            border: 'none',
            borderRadius: 9999,
            padding: '10px 20px',
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            animation: 'glow-pulse 2s ease-in-out infinite',
          }}
        >
          <span style={{ fontSize: 15 }}>✨</span>
          Update available — tap to reload
        </button>
      </div>
    </>
  )
}
