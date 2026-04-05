'use client'

import { useState } from 'react'
import Image from 'next/image'
import { locations } from '@/data/locations'

interface Analysis {
  correct: boolean
  confidence: number
  description: string
  isIceland: boolean
  issues: string | null
  suggestedSearch: string
  error?: string
}

interface LocResult {
  id: string
  name: string
  type: string
  region: string
  currentUrl: string
  analysis: Analysis | null
  loading: boolean
  newUrl?: string
}

const UNSPLASH_SEARCHES: Record<string, string> = {
  'skogafoss':       'skogafoss waterfall iceland',
  'seljalandsfoss':  'seljalandsfoss waterfall iceland',
  'gljufrabui':      'gljufrabui hidden waterfall iceland',
  'jokulsarlon':     'jokulsarlon glacier lagoon iceland',
  'diamond beach':   'diamond beach iceland icebergs',
  'reynisfjara':     'reynisfjara black sand beach iceland',
  'geysir':          'geysir strokkur geyser iceland eruption',
  'gullfoss':        'gullfoss waterfall iceland golden circle',
  'thingvellir':     'thingvellir national park iceland',
  'kirkjufell':      'kirkjufell mountain iceland',
  'kirkjufellsfoss': 'kirkjufellsfoss waterfall iceland',
  'svartifoss':      'svartifoss basalt column waterfall iceland',
  'dettifoss':       'dettifoss waterfall iceland powerful',
  'godafoss':        'godafoss waterfall iceland',
  'myvatn':          'myvatn lake iceland',
  'hverfjall':       'hverfjall crater iceland volcanic',
  'grjotagja':       'grjotagja cave hot spring iceland',
  'namaskar':        'namaskar hverir geothermal iceland sulfur',
  'vatnajokull':     'vatnajokull glacier iceland aerial',
  'snaefellsjokull': 'snaefellsjokull volcano glacier iceland',
  'vik':             'vik iceland black beach cliffs',
  'vestrahorn':      'vestrahorn mountain iceland reflection',
  'skaftafell':      'skaftafell nature reserve iceland',
  'blue lagoon':     'blue lagoon geothermal spa iceland',
  'fjadrargjufur':   'fjadrargljufur canyon iceland green',
  'krafla':          'krafla volcano lava iceland',
  'leirhnjukur':     'leirhnjukur lava field iceland',
  'dynjandi':        'dynjandi waterfall westfjords iceland',
  'husavik':         'husavik town harbour iceland',
  'hvitserkur':      'hvitserkur rock formation iceland',
  'studlagil':       'studlagil basalt canyon iceland blue river',
  'storurd':         'storurd boulders east iceland',
  'aldeyjarfoss':    'aldeyjarfoss basalt waterfall iceland',
  'raudasandur':     'raudasandur red sand beach westfjords',
  'gjain':           'gjain valley landmannalaugar iceland',
  'raudfeldsgja':    'raudfeldsgja gorge snaefellsnes iceland',
  'bjarnarfoss':     'bjarnarfoss waterfall snaefellsnes iceland',
  'fosslaug':        'fosslaug hot spring iceland mountain',
  'stong':           'viking ruins iceland historical',
  'holmatungur':     'holmatungur valley jokulsargljufur iceland',
  'hljodaklettar':   'hljodaklettar echo rocks basalt iceland',
  'rjukandafoss':    'rjukandafoss waterfall east iceland',
  'skutustadagigar': 'skutustadagigar pseudo craters myvatn iceland',
  'gatklettur':      'gatklettur arch rock arnarstapi iceland',
  'haifoss':         'haifoss tall waterfall iceland',
  'landmannalaugar': 'landmannalaugar colorful mountains iceland',
  'kerlingarfjoll':  'kerlingarfjoll mountains geothermal highlands iceland',
  'askja':           'askja caldera volcano highland iceland',
  'viti':            'viti crater lake askja iceland turquoise',
  'oskjuvatn':       'oskjuvatn crater lake iceland',
}

function getUnsplashSearch(name: string): string {
  const key = name.toLowerCase().replace(/[^a-z ]/g, '').split(' ')[0]
  for (const [k, v] of Object.entries(UNSPLASH_SEARCHES)) {
    if (name.toLowerCase().includes(k)) return v
  }
  return `${name} iceland photography`
}

function buildUnsplashUrl(search: string): string {
  const encoded = encodeURIComponent(search)
  return `https://source.unsplash.com/featured/800x560/?${encoded}`
}

export default function AdminPage() {
  const [results, setResults] = useState<LocResult[]>(
    locations.map(l => ({
      id: l.id,
      name: l.name,
      type: l.type,
      region: l.region,
      currentUrl: l.thumbnail,
      analysis: null,
      loading: false,
    }))
  )
  const [running, setRunning] = useState(false)
  const [copied, setCopied] = useState(false)

  const analyzeOne = async (idx: number) => {
    const loc = results[idx]
    setResults(r => r.map((x, i) => i === idx ? { ...x, loading: true } : x))
    try {
      const res = await fetch('/api/gemini-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: loc.currentUrl,
          locationName: loc.name,
          locationType: loc.type,
          locationRegion: loc.region,
        }),
      })
      const analysis: Analysis = await res.json()
      const suggestedSearch = analysis.suggestedSearch || getUnsplashSearch(loc.name)
      setResults(r => r.map((x, i) => i === idx ? {
        ...x,
        loading: false,
        analysis,
        newUrl: !analysis.correct ? buildUnsplashUrl(suggestedSearch) : undefined,
      } : x))
    } catch (err) {
      setResults(r => r.map((x, i) => i === idx ? {
        ...x,
        loading: false,
        analysis: { correct: false, confidence: 0, description: 'Error', isIceland: false, issues: String(err), suggestedSearch: '', error: String(err) },
      } : x))
    }
  }

  const analyzeAll = async () => {
    setRunning(true)
    for (let i = 0; i < results.length; i++) {
      await analyzeOne(i)
      await new Promise(r => setTimeout(r, 600)) // rate limit
    }
    setRunning(false)
  }

  const generateUpdatedData = () => {
    const lines = results.map(r => {
      const url = r.newUrl ?? r.currentUrl
      return `  '${r.id}': '${url}',`
    })
    return `// Updated thumbnails — generated by Gemini analysis\nexport const updatedThumbnails: Record<string, string> = {\n${lines.join('\n')}\n}`
  }

  const applyFixes = async () => {
    const updates: Record<string, string> = {}
    results.forEach(r => { if (r.newUrl) updates[r.id] = r.newUrl })
    if (!Object.keys(updates).length) return alert('No fixes to apply')
    const res = await fetch('/api/apply-thumbnails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ updates }),
    })
    const data = await res.json()
    alert(`✓ Updated ${data.updated} thumbnails in locations.ts`)
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generateUpdatedData())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const wrongCount = results.filter(r => r.analysis && !r.analysis.correct).length
  const doneCount = results.filter(r => r.analysis).length

  return (
    <div style={{ background: '#0a0b0e', minHeight: '100vh', color: '#fff', fontFamily: 'system-ui' }}>
      {/* Header */}
      <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>🖼️ Thumbnail Audit — Gemini Vision</h1>
          <p style={{ fontSize: 12, color: '#8a8f9e', margin: '4px 0 0' }}>
            {doneCount}/{results.length} analyzed · {wrongCount} wrong · {results.filter(r => r.newUrl).length} queued for fix
          </p>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 10 }}>
          {doneCount > 0 && (
            <>
              <button
                onClick={copyToClipboard}
                style={{ padding: '8px 16px', borderRadius: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#8a8f9e', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}
              >
                {copied ? '✓ Copied!' : '📋 Copy map'}
              </button>
              {wrongCount > 0 && (
                <button
                  onClick={applyFixes}
                  style={{ padding: '8px 16px', borderRadius: 8, background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.4)', color: '#10b981', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}
                >
                  ✓ Apply {wrongCount} fixes → locations.ts
                </button>
              )}
            </>
          )}
          <button
            onClick={analyzeAll}
            disabled={running}
            style={{ padding: '8px 20px', borderRadius: 8, background: running ? 'rgba(255,255,255,0.06)' : '#f5a623', border: 'none', color: running ? '#8a8f9e' : '#0a0b0e', cursor: running ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 700 }}
          >
            {running ? `Analyzing… (${doneCount}/${results.length})` : '▶ Analyze All 43'}
          </button>
        </div>
      </div>

      {/* Grid */}
      <div style={{ padding: 24, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
        {results.map((r, i) => (
          <div
            key={r.id}
            style={{
              borderRadius: 14,
              background: 'rgba(18,20,28,0.95)',
              border: r.analysis
                ? r.analysis.correct
                  ? '1px solid rgba(16,185,129,0.4)'
                  : '1px solid rgba(239,68,68,0.5)'
                : '1px solid rgba(255,255,255,0.08)',
              overflow: 'hidden',
            }}
          >
            {/* Thumbnail comparison */}
            <div style={{ display: 'flex', height: 120 }}>
              <div style={{ flex: 1, position: 'relative', background: '#111' }}>
                <Image src={r.currentUrl} alt="" fill style={{ objectFit: 'cover' }} onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0.2' }} />
                <div style={{ position: 'absolute', bottom: 4, left: 4, background: 'rgba(0,0,0,0.7)', padding: '2px 6px', borderRadius: 4, fontSize: 10, color: '#8a8f9e' }}>Current</div>
              </div>
              {r.newUrl && (
                <div style={{ flex: 1, position: 'relative', background: '#111' }}>
                  <Image src={r.newUrl} alt="" fill style={{ objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', bottom: 4, left: 4, background: 'rgba(245,166,35,0.8)', padding: '2px 6px', borderRadius: 4, fontSize: 10, color: '#0a0b0e', fontWeight: 700 }}>Fix</div>
                </div>
              )}
            </div>

            {/* Info */}
            <div style={{ padding: '10px 12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{r.name}</span>
                {r.analysis && (
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 999,
                    background: r.analysis.correct ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                    color: r.analysis.correct ? '#10b981' : '#ef4444',
                  }}>
                    {r.analysis.correct ? `✓ ${r.analysis.confidence}%` : `✗ ${r.analysis.confidence}%`}
                  </span>
                )}
              </div>

              {r.loading && (
                <p style={{ fontSize: 11, color: '#f5a623', margin: '4px 0' }}>🔍 Analyzing with Gemini…</p>
              )}

              {r.analysis && (
                <>
                  <p style={{ fontSize: 11, color: '#c8cad4', margin: '4px 0', lineHeight: 1.5 }}>
                    {r.analysis.description}
                  </p>
                  {r.analysis.issues && r.analysis.issues !== 'null' && (
                    <p style={{ fontSize: 10, color: '#ef4444', margin: '4px 0' }}>⚠ {r.analysis.issues}</p>
                  )}
                  {!r.analysis.correct && (
                    <p style={{ fontSize: 10, color: '#f5a623', margin: '4px 0' }}>
                      🔍 Suggested: {r.analysis.suggestedSearch}
                    </p>
                  )}
                </>
              )}

              {!r.analysis && !r.loading && (
                <button
                  onClick={() => analyzeOne(i)}
                  style={{ marginTop: 4, padding: '4px 12px', borderRadius: 6, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#8a8f9e', cursor: 'pointer', fontSize: 11 }}
                >
                  Analyze
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Instructions for applying fixes */}
      {wrongCount > 0 && (
        <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(245,166,35,0.05)' }}>
          <p style={{ fontSize: 12, color: '#f5a623', margin: 0 }}>
            {wrongCount} incorrect thumbnails found. Click <strong>Copy fixes</strong> to get updated thumbnail URLs, then apply them to <code>data/locations.ts</code>.
          </p>
        </div>
      )}
    </div>
  )
}
