'use client'

import { useState } from 'react'
import { locations } from '@/data/locations'
import type { Location, CustomTripStop } from '@/types'

const TYPE_ICONS: Record<string, string> = {
  waterfall: '💧', glacier: '🏔', volcano: '🌋', lake: '🏞', canyon: '🏜',
  beach: '🏖', 'hot-spring': '♨️', lava: '🪨', mountain: '⛰', ruins: '🏚',
  geothermal: '💨', valley: '🌿',
}

const STYLE_OPTIONS = [
  { id: 'photography', label: '📸 Photography' },
  { id: 'hiking', label: '🥾 Hiking' },
  { id: 'volcanic', label: '🌋 Volcanic' },
  { id: 'wildlife', label: '🐋 Wildlife' },
  { id: 'highland', label: '🏔 Highland' },
  { id: 'coastal', label: '🌊 Coastal' },
]

const DAY_OPTIONS = [2, 3, 4, 5, 6, 7, 10, 14]
const VEHICLE_OPTIONS = [
  { id: 'small-car', label: 'Small Car' },
  { id: 'suv', label: 'SUV' },
  { id: '4wd', label: '4WD' },
]
const SEASON_OPTIONS = [
  { id: 'spring', label: '🌸 Spring' },
  { id: 'summer', label: '☀️ Summer' },
  { id: 'autumn', label: '🍂 Autumn' },
  { id: 'winter', label: '❄️ Winter' },
]

interface Stop {
  locationId: string
  name: string
  note: string
}

interface ItineraryDay {
  day: number
  theme: string
  stops: Stop[]
}

interface Itinerary {
  title: string
  tagline: string
  days: ItineraryDay[]
}

interface AIBuilderProps {
  onAddToTrip: (location: Location) => void
}

function getCurrentSeason(): string {
  const month = new Date().getMonth()
  if (month >= 2 && month <= 4) return 'spring'
  if (month >= 5 && month <= 7) return 'summer'
  if (month >= 8 && month <= 10) return 'autumn'
  return 'winter'
}

const pill = (active: boolean, color = '#f5a623'): React.CSSProperties => ({
  borderRadius: 9999,
  padding: '5px 13px',
  fontSize: 12,
  fontWeight: active ? 600 : 400,
  background: active ? `${color}22` : 'rgba(255,255,255,0.06)',
  color: active ? color : '#8a8f9e',
  border: active ? `1px solid ${color}55` : '1px solid transparent',
  cursor: 'pointer',
  whiteSpace: 'nowrap' as const,
})

export default function AIBuilder({ onAddToTrip }: AIBuilderProps) {
  const [days, setDays] = useState(5)
  const [styles, setStyles] = useState<string[]>(['photography'])
  const [vehicle, setVehicle] = useState('suv')
  const [season, setSeason] = useState(getCurrentSeason())
  const [notes, setNotes] = useState('')
  const [state, setState] = useState<'idle' | 'loading' | 'result'>('idle')
  const [itinerary, setItinerary] = useState<Itinerary | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [addedAll, setAddedAll] = useState(false)

  const toggleStyle = (id: string) => {
    setStyles((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    )
  }

  const generate = async () => {
    setState('loading')
    setError(null)
    setAddedAll(false)
    try {
      const res = await fetch('/api/ai-itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ days, styles, vehicle, season, notes }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setItinerary(data)
      setState('result')
    } catch (e) {
      setError(String(e))
      setState('idle')
    }
  }

  const handleAddToTrip = () => {
    if (!itinerary) return
    itinerary.days.forEach((d) => {
      d.stops.forEach((stop) => {
        const loc = locations.find((l) => l.id === stop.locationId)
        if (loc) onAddToTrip(loc)
      })
    })
    setAddedAll(true)
  }

  if (state === 'loading') {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 12px #10b98188', animation: 'pulse 1.2s ease-in-out infinite' }} />
        <div style={{ color: '#8a8f9e', fontSize: 14 }}>Building your Iceland adventure…</div>
        <style>{`@keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(0.7)} }`}</style>
      </div>
    )
  }

  if (state === 'result' && itinerary) {
    return (
      <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'none', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ padding: '16px 16px 8px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', lineHeight: 1.3 }}>{itinerary.title}</div>
          <div style={{ fontSize: 13, color: '#8a8f9e', marginTop: 4 }}>{itinerary.tagline}</div>
        </div>

        {/* Day cards */}
        <div style={{ flex: 1, padding: '12px 12px 80px' }}>
          {itinerary.days.map((d) => (
            <div key={d.day} style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <div style={{ background: '#f5a623', color: '#0a0b0e', fontSize: 10, fontWeight: 800, padding: '3px 12px', borderRadius: 20, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Day {d.day}
                </div>
                <div style={{ fontSize: 12, color: '#8a8f9e' }}>{d.theme}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {d.stops.map((stop) => {
                  const loc = locations.find((l) => l.id === stop.locationId)
                  const icon = loc ? (TYPE_ICONS[loc.type] ?? '📍') : '📍'
                  return (
                    <div key={stop.locationId} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '10px 12px', display: 'flex', gap: 10 }}>
                      <span style={{ fontSize: 18, lineHeight: 1 }}>{icon}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{loc?.name ?? stop.name}</div>
                        <div style={{ fontSize: 11, color: '#6b7280', marginTop: 3, lineHeight: 1.5 }}>{stop.note}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* CTA bar */}
        <div style={{ position: 'sticky', bottom: 0, padding: '10px 12px', background: 'rgba(10,11,14,0.98)', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', gap: 8 }}>
          <button
            onClick={handleAddToTrip}
            disabled={addedAll}
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: addedAll ? 'rgba(16,185,129,0.15)' : '#f5a623', color: addedAll ? '#10b981' : '#0a0b0e', border: addedAll ? '1px solid rgba(16,185,129,0.3)' : 'none', borderRadius: 12, padding: '11px', fontSize: 13, fontWeight: 700, cursor: addedAll ? 'default' : 'pointer' }}
          >
            {addedAll ? '✅ Added to Trip Plan' : '✅ Add to Trip Plan'}
          </button>
          <button
            onClick={() => { setState('idle'); setItinerary(null) }}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, background: 'rgba(255,255,255,0.07)', color: '#8a8f9e', border: 'none', borderRadius: 12, padding: '11px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
          >
            🔄 Regenerate
          </button>
        </div>
      </div>
    )
  }

  // Idle — preference form
  return (
    <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'none', padding: '12px 14px 80px', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div>
        <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', marginBottom: 4 }}>AI Itinerary Builder</div>
        <div style={{ fontSize: 12, color: '#8a8f9e', lineHeight: 1.5 }}>Tell us what you love and Gemini AI will design your perfect Iceland trip.</div>
      </div>

      {error && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '10px 12px', fontSize: 12, color: '#f87171' }}>
          {error}
        </div>
      )}

      {/* Days */}
      <div>
        <div style={{ fontSize: 11, color: '#5a5f6e', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Trip length (days)</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {DAY_OPTIONS.map((d) => (
            <button key={d} onClick={() => setDays(d)} style={pill(days === d)}>{d}</button>
          ))}
        </div>
      </div>

      {/* Styles */}
      <div>
        <div style={{ fontSize: 11, color: '#5a5f6e', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Trip style (pick any)</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {STYLE_OPTIONS.map(({ id, label }) => (
            <button key={id} onClick={() => toggleStyle(id)} style={pill(styles.includes(id))}>{label}</button>
          ))}
        </div>
      </div>

      {/* Vehicle */}
      <div>
        <div style={{ fontSize: 11, color: '#5a5f6e', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Vehicle</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {VEHICLE_OPTIONS.map(({ id, label }) => (
            <button key={id} onClick={() => setVehicle(id)} style={pill(vehicle === id)}>{label}</button>
          ))}
        </div>
      </div>

      {/* Season */}
      <div>
        <div style={{ fontSize: 11, color: '#5a5f6e', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Season</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {SEASON_OPTIONS.map(({ id, label }) => (
            <button key={id} onClick={() => setSeason(id)} style={pill(season === id)}>{label}</button>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div>
        <div style={{ fontSize: 11, color: '#5a5f6e', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Extra notes (optional)</div>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g. We have a 4WD and love remote spots. Flying in to Keflavík."
          rows={3}
          style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '10px 12px', fontSize: 12, color: '#e2e4ea', resize: 'none', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
        />
      </div>

      <button
        onClick={generate}
        disabled={styles.length === 0}
        style={{ background: styles.length === 0 ? 'rgba(245,166,35,0.3)' : '#f5a623', color: '#0a0b0e', border: 'none', borderRadius: 14, padding: '14px', fontSize: 15, fontWeight: 800, cursor: styles.length === 0 ? 'default' : 'pointer', width: '100%' }}
      >
        ✨ Generate My Itinerary
      </button>
    </div>
  )
}
