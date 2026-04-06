'use client'

import { Clock, Navigation, AlertTriangle } from 'lucide-react'
import { itineraries } from '@/data/itineraries'
import type { Itinerary } from '@/data/itineraries'

interface ItinerariesListProps {
  onSelect: (id: string) => void
}

function difficultyColor(d: Itinerary['difficulty']): string {
  if (d === 'Easy') return '#10b981'
  if (d === 'Moderate') return '#f5a623'
  return '#ef4444'
}

export default function ItinerariesList({ onSelect }: ItinerariesListProps) {
  return (
    <div
      style={{
        backgroundColor: '#0a0b0e',
        minHeight: '100%',
        padding: '16px 16px 40px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 700, color: '#ffffff', letterSpacing: '-0.3px' }}>
          Iceland Itineraries
        </h1>
        <p style={{ margin: 0, fontSize: 13, color: '#8a8f9e' }}>
          6 curated routes — from 3 to 8 days
        </p>
      </div>

      {/* Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {itineraries.map((it) => (
          <button
            key={it.id}
            onClick={() => onSelect(it.id)}
            style={{
              background: 'none',
              border: '1px solid rgba(255,255,255,0.07)',
              padding: 0,
              cursor: 'pointer',
              textAlign: 'left' as const,
              borderRadius: 16,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column' as const,
              backgroundColor: 'rgba(18,20,28,0.95)',
              width: '100%',
            }}
          >
            {/* Cover photo */}
            <div style={{ position: 'relative', width: '100%', height: 160, overflow: 'hidden' }}>
              <img
                src={it.coverImage}
                alt={it.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
              {/* Dark gradient */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(10,11,14,0.92) 0%, rgba(10,11,14,0.3) 50%, transparent 100%)',
                }}
              />
              {/* 4WD badge */}
              {it.requiresFourWD && (
                <div
                  style={{
                    position: 'absolute',
                    top: 10,
                    right: 10,
                    backgroundColor: 'rgba(245,166,35,0.95)',
                    color: '#0a0b0e',
                    fontSize: 9,
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: 8,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <AlertTriangle size={9} />
                  4WD REQUIRED
                </div>
              )}
              {/* Name + icon */}
              <div style={{ position: 'absolute', bottom: 12, left: 14, right: 14 }}>
                <div style={{ fontSize: 20, marginBottom: 2 }}>{it.icon}</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#ffffff', lineHeight: 1.2 }}>
                  {it.name}
                </div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', marginTop: 2 }}>
                  {it.tagline}
                </div>
              </div>
            </div>

            {/* Info strip */}
            <div style={{ padding: '12px 14px 14px' }}>
              {/* Stats row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Clock size={12} color="#8a8f9e" />
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#ffffff' }}>
                    {it.days} days
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Navigation size={12} color="#8a8f9e" />
                  <span style={{ fontSize: 13, color: '#8a8f9e' }}>
                    {it.totalKm.toLocaleString()} km
                  </span>
                </div>
                <div
                  style={{
                    marginLeft: 'auto',
                    fontSize: 11,
                    fontWeight: 600,
                    color: difficultyColor(it.difficulty),
                    backgroundColor: `${difficultyColor(it.difficulty)}18`,
                    padding: '3px 9px',
                    borderRadius: 20,
                    border: `1px solid ${difficultyColor(it.difficulty)}33`,
                  }}
                >
                  {it.difficulty}
                </div>
              </div>

              {/* Season tags */}
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' as const }}>
                {it.seasons.map((s) => (
                  <span
                    key={s}
                    style={{
                      fontSize: 10,
                      color: '#5a5f6e',
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      padding: '2px 7px',
                      borderRadius: 6,
                      border: '1px solid rgba(255,255,255,0.07)',
                    }}
                  >
                    {s}
                  </span>
                ))}
                <span
                  style={{
                    fontSize: 10,
                    color: it.color,
                    marginLeft: 'auto',
                    fontWeight: 600,
                  }}
                >
                  {it.stops.length} stops →
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>

      <p style={{ margin: '20px 0 0', fontSize: 11, color: '#3a3f4e', textAlign: 'center' as const, lineHeight: 1.5 }}>
        Drive times approximate. Check road.is before travel.
      </p>
    </div>
  )
}
