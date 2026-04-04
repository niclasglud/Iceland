'use client'

import { Sparkles, Moon, Cloud, MapPin, Star } from 'lucide-react'
import { getKpColor, getKpLabel, getAuroraDescription } from '@/lib/aurora'

interface AuroraBarProps {
  kpIndex: number
  probability: number
  bestViewingTime?: string
  cloudCover: number
  forecast: { time: string; kp: number }[]
  onViewMap: () => void
}

const AURORA_SPOTS = [
  { name: 'Askja Region', rating: 3 as const, note: 'KP 3+ needed', distance: '~280 km from Reykjavik' },
  { name: 'Northern Highlands', rating: 3 as const, note: 'Zero light pollution', distance: '~200 km from Reykjavik' },
  { name: 'East Fjords', rating: 2 as const, note: 'Remote coastal darkness', distance: '~490 km from Reykjavik' },
  { name: 'Westfjords', rating: 2 as const, note: 'Dramatic fjord backdrop', distance: '~450 km from Reykjavik' },
  { name: 'Vatnajökull', rating: 3 as const, note: 'Glacier reflection', distance: '~350 km from Reykjavik' },
]

function StarRating({ rating }: { rating: 1 | 2 | 3 }) {
  return (
    <span style={{ display: 'flex', gap: 2 }}>
      {[1, 2, 3].map((i) => (
        <Star
          key={i}
          size={12}
          fill={i <= rating ? '#f5a623' : 'transparent'}
          color={i <= rating ? '#f5a623' : '#3a3f4e'}
        />
      ))}
    </span>
  )
}

function getCloudLabel(cover: number): string {
  if (cover < 25) return 'Clear'
  if (cover < 60) return 'Partly cloudy'
  return 'Overcast'
}

function getProbabilityColor(prob: number): string {
  if (prob >= 60) return '#00ff88'
  if (prob >= 30) return '#f5a623'
  return '#8a8f9e'
}

function getBarColor(kp: number): string {
  if (kp >= 7) return '#ef4444'
  if (kp >= 5) return '#f59e0b'
  if (kp >= 3) return '#00ff88'
  if (kp >= 1) return '#4a9eff'
  return '#3a3f4e'
}

function KpMiniBar({ kp, maxKp = 9 }: { kp: number; maxKp?: number }) {
  const heightPct = Math.max(4, (kp / maxKp) * 100)
  return (
    <div
      style={{
        width: '100%',
        height: `${heightPct}%`,
        backgroundColor: getBarColor(kp),
        borderRadius: 2,
        transition: 'height 0.3s ease',
      }}
    />
  )
}

export default function AuroraBar({
  kpIndex,
  probability,
  bestViewingTime,
  cloudCover,
  forecast,
  onViewMap,
}: AuroraBarProps) {
  const kpColor = getKpColor(kpIndex)
  const kpLabel = getKpLabel(kpIndex)
  const description = getAuroraDescription(kpIndex)
  const probColor = getProbabilityColor(probability)

  const markerPct = Math.min(100, (kpIndex / 9) * 100)

  const now = new Date()
  const dateStr = now.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  const timeStr = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })

  // Build 24h forecast display — sample every entry, show ~8 bars for chart readability
  const chartEntries = forecast.length > 0
    ? forecast.filter((_, i) => i % Math.max(1, Math.floor(forecast.length / 24)) === 0).slice(0, 24)
    : []

  const maxChartKp = Math.max(...chartEntries.map((e) => e.kp), 5)
  const thresholdPct = (3 / maxChartKp) * 100

  return (
    <div
      style={{
        backgroundColor: '#0a0b0e',
        minHeight: '100%',
        padding: '20px 16px 32px',
        overflowY: 'auto',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      {/* ── Header ── */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <Sparkles size={22} color="#00ff88" />
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#ffffff', letterSpacing: '-0.3px' }}>
            Northern Lights
          </h1>
        </div>
        <p style={{ margin: 0, fontSize: 13, color: '#8a8f9e', marginBottom: 4 }}>
          Aurora Borealis Forecast — Iceland
        </p>
        <p style={{ margin: 0, fontSize: 12, color: '#5a5f6e' }}>
          {dateStr} · {timeStr}
        </p>
      </div>

      {/* ── KP Index Gauge ── */}
      <div
        style={{
          backgroundColor: 'rgba(18,20,28,0.95)',
          borderRadius: 14,
          padding: '18px 16px',
          marginBottom: 14,
          border: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#8a8f9e', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            KP Index
          </span>
          <span style={{ fontSize: 11, color: '#5a5f6e' }}>0 – 9 geomagnetic scale</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 14 }}>
          <span style={{ fontSize: 48, fontWeight: 800, color: kpColor, lineHeight: 1 }}>
            {kpIndex.toFixed(1)}
          </span>
          <span
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: kpColor,
              backgroundColor: `${kpColor}22`,
              padding: '3px 10px',
              borderRadius: 20,
              border: `1px solid ${kpColor}44`,
            }}
          >
            {kpLabel}
          </span>
        </div>

        {/* Gradient bar */}
        <div style={{ position: 'relative', marginBottom: 8 }}>
          <div
            style={{
              height: 10,
              borderRadius: 6,
              background: 'linear-gradient(to right, #4a9eff, #00ff88, #f5a623, #ef4444)',
              position: 'relative',
            }}
          >
            {/* Marker */}
            <div
              style={{
                position: 'absolute',
                left: `${markerPct}%`,
                top: '50%',
                transform: 'translate(-50%, -50%)',
                width: 16,
                height: 16,
                borderRadius: '50%',
                backgroundColor: '#ffffff',
                border: `3px solid ${kpColor}`,
                boxShadow: `0 0 8px ${kpColor}88`,
              }}
            />
          </div>

          {/* Scale labels */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
              <span key={n} style={{ fontSize: 10, color: '#5a5f6e', width: 10, textAlign: 'center' }}>
                {n}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tonight's Forecast ── */}
      <div
        style={{
          backgroundColor: 'rgba(18,20,28,0.95)',
          borderRadius: 14,
          padding: '18px 16px',
          marginBottom: 14,
          border: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <span style={{ fontSize: 12, fontWeight: 600, color: '#8a8f9e', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Tonight&apos;s Probability
        </span>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, margin: '10px 0 8px' }}>
          <span style={{ fontSize: 52, fontWeight: 800, color: probColor, lineHeight: 1 }}>
            {probability}
          </span>
          <span style={{ fontSize: 24, fontWeight: 700, color: probColor }}>%</span>
        </div>

        {bestViewingTime && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <Moon size={13} color="#8a8f9e" />
            <span style={{ fontSize: 13, color: '#8a8f9e' }}>
              Best viewing time:{' '}
              <span style={{ color: '#ffffff', fontWeight: 600 }}>{bestViewingTime}</span>
            </span>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Cloud size={13} color="#8a8f9e" />
          <span style={{ fontSize: 13, color: '#8a8f9e' }}>
            Cloud cover:{' '}
            <span style={{ color: cloudCover < 25 ? '#00ff88' : cloudCover < 60 ? '#f5a623' : '#ef4444', fontWeight: 600 }}>
              {cloudCover}%
            </span>
            {' '}— {getCloudLabel(cloudCover)}
          </span>
        </div>
      </div>

      {/* ── Description ── */}
      <div
        style={{
          backgroundColor: 'rgba(18,20,28,0.95)',
          borderRadius: 14,
          padding: '14px 16px',
          marginBottom: 14,
          border: '1px solid rgba(0,255,136,0.08)',
        }}
      >
        <p style={{ margin: 0, fontSize: 14, color: '#c0c5d0', lineHeight: 1.6 }}>
          {description}
        </p>
      </div>

      {/* ── 24h KP Forecast Chart ── */}
      {chartEntries.length > 0 && (
        <div
          style={{
            backgroundColor: 'rgba(18,20,28,0.95)',
            borderRadius: 14,
            padding: '18px 16px',
            marginBottom: 14,
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <span style={{ fontSize: 12, fontWeight: 600, color: '#8a8f9e', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            24-Hour KP Forecast
          </span>

          <div style={{ position: 'relative', marginTop: 16 }}>
            {/* KP=3 threshold line */}
            <div
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: `${thresholdPct}%`,
                borderTop: '1px dashed rgba(0,255,136,0.4)',
                zIndex: 1,
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  right: 0,
                  top: -18,
                  fontSize: 9,
                  color: '#00ff88',
                  whiteSpace: 'nowrap',
                }}
              >
                KP=3 visible threshold
              </span>
            </div>

            {/* Bars */}
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-end',
                gap: 3,
                height: 80,
                position: 'relative',
              }}
            >
              {chartEntries.map((entry, i) => (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    height: '100%',
                    display: 'flex',
                    alignItems: 'flex-end',
                  }}
                >
                  <KpMiniBar kp={entry.kp} maxKp={maxChartKp} />
                </div>
              ))}
            </div>

            {/* X-axis hour labels */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: 6,
              }}
            >
              {['0h', '6h', '12h', '18h', '24h'].map((label) => (
                <span key={label} style={{ fontSize: 10, color: '#5a5f6e' }}>
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Best Viewing Spots ── */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <MapPin size={15} color="#00ff88" />
          <span style={{ fontSize: 14, fontWeight: 700, color: '#ffffff' }}>
            Best Aurora Spots in Iceland
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {AURORA_SPOTS.map((spot) => (
            <div
              key={spot.name}
              style={{
                backgroundColor: 'rgba(18,20,28,0.95)',
                borderRadius: 12,
                padding: '12px 14px',
                border: '1px solid rgba(255,255,255,0.06)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#ffffff', marginBottom: 3 }}>
                  {spot.name}
                </div>
                <div style={{ fontSize: 11, color: '#8a8f9e' }}>{spot.note}</div>
                <div style={{ fontSize: 10, color: '#5a5f6e', marginTop: 2 }}>3+ km from nearest town</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                <StarRating rating={spot.rating} />
                <span style={{ fontSize: 10, color: '#5a5f6e' }}>{spot.distance}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── View on Map button ── */}
      <button
        onClick={onViewMap}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          width: '100%',
          padding: '14px 24px',
          backgroundColor: '#f5a623',
          color: '#0a0b0e',
          border: 'none',
          borderRadius: 100,
          fontSize: 15,
          fontWeight: 700,
          cursor: 'pointer',
          letterSpacing: '0.01em',
        }}
      >
        View Aurora Map →
      </button>
    </div>
  )
}
