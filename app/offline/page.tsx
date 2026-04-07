'use client'
export default function OfflinePage() {
  return (
    <div
      style={{
        minHeight: '100dvh',
        background: '#0a0b0e',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        textAlign: 'center',
        fontFamily: 'system-ui, sans-serif',
        color: '#8a8f9e',
      }}
    >
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏔️</div>
      <h1 style={{ color: '#f5f5f5', fontSize: '1.5rem', margin: '0 0 0.5rem' }}>
        You're offline
      </h1>
      <p style={{ margin: '0 0 2rem', maxWidth: '280px', lineHeight: 1.5 }}>
        Iceland Explorer is loading from your last visit. Some live data like weather
        and aurora forecasts may be out of date.
      </p>
      <button
        onClick={() => window.location.reload()}
        style={{
          background: '#f5a623',
          color: '#0a0b0e',
          border: 'none',
          borderRadius: '999px',
          padding: '0.75rem 2rem',
          fontWeight: 600,
          fontSize: '0.95rem',
          cursor: 'pointer',
        }}
      >
        Try again
      </button>
    </div>
  )
}
