'use client'

import { useState } from 'react'
import Image from 'next/image'
import { locations } from '@/data/locations'

interface Detail {
  correct: boolean
  confidence: number
  description: string
  suggestedSearch: string
  duplicate: boolean
}

interface BatchResult {
  stats: { total: number; wrong: number; duplicates: number; fixed: number }
  fixes: Record<string, string>
  details: Record<string, Detail>
}

interface LocEntry {
  id: string
  name: string
  type: string
  region: string
  thumbnail: string
}

const locs: LocEntry[] = locations.map(l => ({
  id: l.id, name: l.name, type: l.type, region: l.region, thumbnail: l.thumbnail,
}))

export default function AdminPage() {
  const [status, setStatus] = useState<'idle' | 'running' | 'done' | 'applying' | 'applied'>('idle')
  const [result, setResult] = useState<BatchResult | null>(null)
  const [applyMsg, setApplyMsg] = useState('')
  const [elapsed, setElapsed] = useState(0)

  const runBatch = async () => {
    setStatus('running')
    setResult(null)
    const start = Date.now()

    // Show elapsed time while waiting
    const timer = setInterval(() => setElapsed(Math.floor((Date.now() - start) / 1000)), 1000)

    try {
      const res = await fetch('/api/gemini-batch', { method: 'POST' })
      const data: BatchResult = await res.json()
      setResult(data)
      setStatus('done')
    } catch (err) {
      alert('Batch failed: ' + String(err))
      setStatus('idle')
    } finally {
      clearInterval(timer)
    }
  }

  const applyFixes = async () => {
    if (!result) return
    setStatus('applying')
    try {
      const res = await fetch('/api/apply-thumbnails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates: result.fixes }),
      })
      const data = await res.json()
      setApplyMsg(`✓ Updated ${data.updated} of ${data.total} thumbnails in locations.ts`)
      setStatus('applied')
    } catch (err) {
      alert('Apply failed: ' + String(err))
      setStatus('done')
    }
  }

  const wrongEntries = result
    ? locs.filter(l => result.fixes[l.id])
    : []
  const correctEntries = result
    ? locs.filter(l => !result.fixes[l.id])
    : []

  return (
    <div style={{ background: '#0a0b0e', minHeight: '100vh', color: '#fff', fontFamily: 'system-ui, sans-serif' }}>

      {/* Header */}
      <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>🖼️ Thumbnail Audit — Gemini Vision</h1>
          <p style={{ fontSize: 12, color: '#8a8f9e', margin: '4px 0 0' }}>
            {locs.length} locations · Gemini 1.5 Flash
          </p>
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', gap: 10, alignItems: 'center' }}>
          {status === 'done' && result && (
            <span style={{ fontSize: 12, color: '#8a8f9e' }}>
              {result.stats.wrong} wrong · {result.stats.duplicates} duplicates · {result.stats.fixed} to fix
            </span>
          )}
          {status === 'applied' && (
            <span style={{ fontSize: 12, color: '#10b981', fontWeight: 600 }}>{applyMsg}</span>
          )}

          {status === 'done' && result && result.stats.fixed > 0 && (
            <button
              onClick={applyFixes}
              style={{ padding: '9px 18px', borderRadius: 8, background: '#10b981', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 700 }}
            >
              ✓ Apply {result.stats.fixed} fixes → locations.ts
            </button>
          )}

          <button
            onClick={runBatch}
            disabled={status === 'running' || status === 'applying'}
            style={{
              padding: '9px 20px', borderRadius: 8, border: 'none',
              background: status === 'running' ? 'rgba(255,255,255,0.06)' : '#f5a623',
              color: status === 'running' ? '#8a8f9e' : '#0a0b0e',
              cursor: status === 'running' ? 'not-allowed' : 'pointer',
              fontSize: 13, fontWeight: 700,
            }}
          >
            {status === 'running'
              ? `⏳ Analyzing… ${elapsed}s`
              : status === 'done' || status === 'applied'
              ? '↻ Re-analyze All'
              : `▶ Analyze All ${locs.length}`}
          </button>
        </div>
      </div>

      {/* Idle state */}
      {status === 'idle' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400, gap: 12 }}>
          <span style={{ fontSize: 48 }}>🔍</span>
          <p style={{ fontSize: 15, color: '#8a8f9e', margin: 0 }}>Click &quot;Analyze All {locs.length}&quot; to start Gemini Vision audit</p>
          <p style={{ fontSize: 12, color: '#4a4d5a', margin: 0 }}>Takes ~5–7 minutes (rate-limited to 4 concurrent requests)</p>
        </div>
      )}

      {/* Running state */}
      {status === 'running' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400, gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', border: '3px solid rgba(245,166,35,0.3)', borderTopColor: '#f5a623', animation: 'spin 1s linear infinite' }} />
          <p style={{ fontSize: 15, color: '#f5a623', margin: 0 }}>Gemini is analyzing {locs.length} photos…</p>
          <p style={{ fontSize: 12, color: '#8a8f9e', margin: 0 }}>{elapsed}s elapsed · batches of 4 with 4s delay</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
      )}

      {/* Results */}
      {(status === 'done' || status === 'applied' || status === 'applying') && result && (
        <div style={{ padding: 24 }}>

          {/* Stats bar */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
            {[
              { label: 'Total', value: result.stats.total, color: '#8a8f9e' },
              { label: 'Correct', value: result.stats.total - result.stats.wrong, color: '#10b981' },
              { label: 'Wrong', value: result.stats.wrong, color: '#ef4444' },
              { label: 'Duplicates', value: result.stats.duplicates, color: '#f5a623' },
              { label: 'Fixes queued', value: result.stats.fixed, color: '#4a9eff' },
            ].map(s => (
              <div key={s.label} style={{ padding: '10px 18px', borderRadius: 10, background: 'rgba(18,20,28,0.95)', border: `1px solid ${s.color}30` }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 11, color: '#8a8f9e' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Wrong photos */}
          {wrongEntries.length > 0 && (
            <>
              <h2 style={{ fontSize: 14, fontWeight: 700, color: '#ef4444', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                ✗ Needs fixing ({wrongEntries.length})
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 14, marginBottom: 32 }}>
                {wrongEntries.map(loc => {
                  const d = result.details[loc.id]
                  const newUrl = result.fixes[loc.id]
                  return (
                    <div key={loc.id} style={{ borderRadius: 14, background: 'rgba(18,20,28,0.95)', border: '1px solid rgba(239,68,68,0.4)', overflow: 'hidden' }}>
                      <div style={{ display: 'flex', height: 130 }}>
                        <div style={{ flex: 1, position: 'relative', background: '#111' }}>
                          <Image src={loc.thumbnail} alt="" fill style={{ objectFit: 'cover' }} onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0.15' }} sizes="170px" />
                          <div style={{ position: 'absolute', inset: 0, background: 'rgba(239,68,68,0.15)' }} />
                          <div style={{ position: 'absolute', bottom: 4, left: 4, background: 'rgba(0,0,0,0.75)', padding: '2px 6px', borderRadius: 4, fontSize: 9, color: '#ef4444', fontWeight: 700 }}>CURRENT</div>
                        </div>
                        {newUrl && (
                          <div style={{ flex: 1, position: 'relative', background: '#111' }}>
                            <Image src={newUrl} alt="" fill style={{ objectFit: 'cover' }} sizes="170px" />
                            <div style={{ position: 'absolute', bottom: 4, left: 4, background: 'rgba(16,185,129,0.85)', padding: '2px 6px', borderRadius: 4, fontSize: 9, color: '#fff', fontWeight: 700 }}>FIX</div>
                          </div>
                        )}
                      </div>
                      <div style={{ padding: '10px 12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span style={{ fontSize: 13, fontWeight: 700 }}>{loc.name}</span>
                          <div style={{ display: 'flex', gap: 4 }}>
                            {d?.duplicate && (
                              <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 999, background: 'rgba(245,166,35,0.15)', color: '#f5a623' }}>DUPLICATE</span>
                            )}
                            <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 999, background: 'rgba(239,68,68,0.15)', color: '#ef4444' }}>
                              {d?.confidence ?? 0}% conf
                            </span>
                          </div>
                        </div>
                        {d?.description && (
                          <p style={{ fontSize: 11, color: '#8a8f9e', margin: '2px 0', lineHeight: 1.5 }}>{d.description}</p>
                        )}
                        {d?.suggestedSearch && (
                          <p style={{ fontSize: 10, color: '#4a9eff', margin: '4px 0 0' }}>🔍 {d.suggestedSearch}</p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}

          {/* Correct photos */}
          {correctEntries.length > 0 && (
            <>
              <h2 style={{ fontSize: 14, fontWeight: 700, color: '#10b981', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                ✓ Correct ({correctEntries.length})
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10 }}>
                {correctEntries.map(loc => {
                  const d = result.details[loc.id]
                  return (
                    <div key={loc.id} style={{ borderRadius: 12, background: 'rgba(18,20,28,0.95)', border: '1px solid rgba(16,185,129,0.25)', overflow: 'hidden' }}>
                      <div style={{ position: 'relative', height: 90, background: '#111' }}>
                        <Image src={loc.thumbnail} alt="" fill style={{ objectFit: 'cover' }} sizes="160px" />
                        <div style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(16,185,129,0.85)', padding: '2px 6px', borderRadius: 999, fontSize: 9, color: '#fff', fontWeight: 700 }}>✓ {d?.confidence ?? 0}%</div>
                      </div>
                      <div style={{ padding: '6px 8px' }}>
                        <div style={{ fontSize: 11, fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{loc.name}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
