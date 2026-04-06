'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, MapPin } from 'lucide-react'
import { WILDLIFE, getWildlifeForMonth, getPeakWildlifeForMonth, MONTH_NAMES } from '@/data/wildlife'
import type { WildlifeEntry } from '@/types'

interface WildlifeCalendarProps {
  compact?: boolean // when true, show just "this month" strip
}

function MonthDots({ entry, currentMonth }: { entry: WildlifeEntry; currentMonth: number }) {
  return (
    <div style={{ display: 'flex', gap: 2, marginTop: 4 }}>
      {Array.from({ length: 12 }, (_, i) => {
        const isActive = entry.months.includes(i)
        const isPeak = entry.peakMonths.includes(i)
        const isCurrent = i === currentMonth
        return (
          <div
            key={i}
            style={{
              width: isCurrent ? 6 : 4,
              height: isCurrent ? 6 : 4,
              borderRadius: '50%',
              backgroundColor: isPeak ? '#f5a623' : isActive ? 'rgba(245,166,35,0.35)' : 'rgba(255,255,255,0.08)',
              flexShrink: 0,
              transition: 'all 0.15s',
              border: isCurrent ? '1px solid rgba(255,255,255,0.4)' : 'none',
            }}
          />
        )
      })}
    </div>
  )
}

function WildlifeCard({ entry, isCurrent }: { entry: WildlifeEntry; isCurrent: boolean }) {
  const [expanded, setExpanded] = useState(false)
  const currentMonth = new Date().getMonth()
  const isPeak = entry.peakMonths.includes(currentMonth)

  return (
    <div
      onClick={() => setExpanded((v) => !v)}
      style={{
        backgroundColor: 'rgba(18,20,28,0.95)',
        borderRadius: 14,
        overflow: 'hidden',
        border: `1px solid ${isCurrent ? 'rgba(245,166,35,0.3)' : 'rgba(255,255,255,0.06)'}`,
        cursor: 'pointer',
        transition: 'border-color 0.15s',
      }}
    >
      {/* Card top: image + info */}
      <div style={{ display: 'flex' }}>
        {/* Thumbnail */}
        <div style={{ width: 90, minHeight: 90, flexShrink: 0, overflow: 'hidden', position: 'relative' }}>
          <Image
            src={entry.photo}
            alt={entry.name}
            fill
            sizes="90px"
            style={{ objectFit: 'cover' }}
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
          {/* Emoji overlay */}
          <div style={{ position: 'absolute', bottom: 4, right: 4, fontSize: 18, filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.8))' }}>
            {entry.emoji}
          </div>
        </div>

        {/* Info */}
        <div style={{ flex: 1, padding: '10px 12px 10px 10px', minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 4, marginBottom: 3 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>{entry.name}</span>
            {isPeak && (
              <span style={{ fontSize: 9, fontWeight: 700, color: '#f5a623', backgroundColor: 'rgba(245,166,35,0.15)', border: '1px solid rgba(245,166,35,0.3)', borderRadius: 6, padding: '2px 6px', flexShrink: 0, whiteSpace: 'nowrap' }}>
                PEAK NOW
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 5 }}>
            <MapPin size={9} color="#8a8f9e" />
            <span style={{ fontSize: 10, color: '#8a8f9e' }}>{entry.locations[0]}{entry.locations.length > 1 ? ` +${entry.locations.length - 1}` : ''}</span>
          </div>

          <p style={{ margin: 0, fontSize: 11, color: '#8a8f9e', lineHeight: 1.45, display: '-webkit-box', WebkitLineClamp: expanded ? 99 : 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {entry.description}
          </p>

          <MonthDots entry={entry} currentMonth={new Date().getMonth()} />
        </div>
      </div>

      {/* Expanded: tips + all locations */}
      {expanded && (
        <div style={{ padding: '10px 14px 12px', borderTop: '1px solid rgba(255,255,255,0.06)', backgroundColor: 'rgba(10,11,14,0.5)' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#f5a623', marginBottom: 5 }}>📍 Where to see them</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
            {entry.locations.map((loc) => (
              <span key={loc} style={{ fontSize: 10, color: '#8a8f9e', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, padding: '2px 7px' }}>
                {loc}
              </span>
            ))}
          </div>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#4a9eff', marginBottom: 4 }}>💡 Tips</div>
          <p style={{ margin: 0, fontSize: 11, color: '#8a8f9e', lineHeight: 1.5 }}>{entry.tips}</p>
        </div>
      )}
    </div>
  )
}

export default function WildlifeCalendar({ compact = false }: WildlifeCalendarProps) {
  const todayMonth = new Date().getMonth()
  const [viewMonth, setViewMonth] = useState(todayMonth)

  const activeNow = getWildlifeForMonth(viewMonth)
  const peakNow   = getPeakWildlifeForMonth(viewMonth)
  const inactive  = WILDLIFE.filter((w) => !w.months.includes(viewMonth))

  const prevMonth = () => setViewMonth((m) => (m + 11) % 12)
  const nextMonth = () => setViewMonth((m) => (m + 1) % 12)

  if (compact) {
    // Compact strip for Spots tab header
    const active = getWildlifeForMonth(todayMonth)
    if (active.length === 0) return null
    return (
      <div style={{ padding: '10px 12px 0' }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: '#8a8f9e', textTransform: 'uppercase' as const, letterSpacing: '0.07em', marginBottom: 8 }}>
          Wildlife in {MONTH_NAMES[todayMonth]}
        </div>
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 8 }}>
          {active.map((w) => (
            <div key={w.id} style={{ flexShrink: 0, backgroundColor: 'rgba(18,20,28,0.95)', border: `1px solid ${w.peakMonths.includes(todayMonth) ? 'rgba(245,166,35,0.3)' : 'rgba(255,255,255,0.07)'}`, borderRadius: 10, padding: '6px 10px', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 16 }}>{w.emoji}</span>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#fff', whiteSpace: 'nowrap' }}>{w.name}</div>
                {w.peakMonths.includes(todayMonth) && (
                  <div style={{ fontSize: 9, color: '#f5a623', fontWeight: 700 }}>PEAK SEASON</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: '12px 12px 48px', fontFamily: 'system-ui, -apple-system, sans-serif', display: 'flex', flexDirection: 'column', gap: 12 }}>

      {/* Month navigator */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(18,20,28,0.95)', borderRadius: 14, padding: '10px 16px', border: '1px solid rgba(255,255,255,0.07)' }}>
        <button onClick={prevMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8a8f9e', display: 'flex', alignItems: 'center', padding: 4 }}>
          <ChevronLeft size={18} />
        </button>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>{MONTH_NAMES[viewMonth]}</div>
          <div style={{ fontSize: 11, color: '#8a8f9e' }}>
            {activeNow.length} species active · {peakNow.length} at peak
            {viewMonth === todayMonth ? ' · Now' : ''}
          </div>
        </div>
        <button onClick={nextMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8a8f9e', display: 'flex', alignItems: 'center', padding: 4 }}>
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Month dot bar */}
      <div style={{ display: 'flex', gap: 3, padding: '0 4px' }}>
        {MONTH_NAMES.map((name, i) => (
          <button
            key={i}
            onClick={() => setViewMonth(i)}
            style={{
              flex: 1,
              height: 28,
              background: i === viewMonth ? '#f5a623' : 'rgba(18,20,28,0.95)',
              border: `1px solid ${i === viewMonth ? '#f5a623' : 'rgba(255,255,255,0.07)'}`,
              borderRadius: 6,
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 2,
            }}
          >
            <span style={{ fontSize: 8, fontWeight: 700, color: i === viewMonth ? '#0a0b0e' : '#5a5f6e', lineHeight: 1 }}>{name.slice(0, 1)}</span>
            <span style={{ fontSize: 8, color: i === viewMonth ? '#0a0b0e' : '#3a3f4e', lineHeight: 1, marginTop: 1 }}>{getWildlifeForMonth(i).length}</span>
          </button>
        ))}
      </div>

      {/* Active wildlife cards */}
      {activeNow.length > 0 && (
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#8a8f9e', marginBottom: 8, textTransform: 'uppercase' as const, letterSpacing: '0.07em', paddingLeft: 4 }}>
            Active in {MONTH_NAMES[viewMonth]} ({activeNow.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {activeNow.map((w) => (
              <WildlifeCard key={w.id} entry={w} isCurrent={w.peakMonths.includes(viewMonth)} />
            ))}
          </div>
        </div>
      )}

      {/* Not active section */}
      {inactive.length > 0 && (
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#5a5f6e', marginBottom: 8, textTransform: 'uppercase' as const, letterSpacing: '0.07em', paddingLeft: 4 }}>
            Not active this month ({inactive.length})
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {inactive.map((w) => (
              <div key={w.id} style={{ display: 'flex', alignItems: 'center', gap: 5, backgroundColor: 'rgba(18,20,28,0.6)', borderRadius: 10, padding: '5px 9px', border: '1px solid rgba(255,255,255,0.04)', opacity: 0.5 }}>
                <span style={{ fontSize: 14 }}>{w.emoji}</span>
                <span style={{ fontSize: 11, color: '#5a5f6e' }}>{w.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
