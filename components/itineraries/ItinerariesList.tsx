'use client'
import React from 'react'

import { Clock, Gauge, Navigation, Calendar, AlertTriangle } from 'lucide-react'
import { itineraries, type Itinerary } from '@/data/itineraries'

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
        padding: '16px 16px 32px',
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

      {/* Cards grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 12,
        }}
      >
        {itineraries.map((it) => (
          <button
            key={it.id}
            onClick={() => onSelect(it.id)}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              textAlign: 'left',
              borderRadius: 14,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: 'rgba(18,20,28,0.95)',
              transition: 'transform 0.15s ease',
            }}
            onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => (e.currentTarget.style.transform = 'scale(1.02)')}
            onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            {/* Cover photo */}
            <div style={{ position: 'relative', width: '100%', paddingTop: '65%', overflow: 'hidden' }}>
              <img
                src={it.coverImage}
                alt={it.name}
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
              {/* Gradient overlay */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(10,11,14,0.9) 0%, rgba(10,11,14,0.2) 60%, transparent 100%)',
                }}
              />
              {/* Icon + name on photo */}
              <div
                style={{
                  position: 'absolute',
                  bottom: 8,
                  left: 10,
                  right: 10,
                }}
              >
                <div style={{ fontSize: 18, marginBottom: 2 }}>{it.icon}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#ffffff', lineHeight: 1.2 }}>
                  {it.name}
                </div>
              </div>
              {/* 4WD badge */}
              {it.requiresFourWD && (
                <div
                  style={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    backgroundColor: 'rgba(245,166,35,0.9)',
                    color: '#0a0b0e',
                    fontSize: 8,
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: 8,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 3,
                  }}
                >
                  <AlertTriangle size={8} />
                  4WD
                </div>
              )}
            </div>

            {/* Info below photo */}
            <div style={{ padding: '10px 10px 12px' }}>
              {/* Stats row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                {/* Days */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                  <Clock size={10} color="#8a8f9e" />
                  <span style={{ fontSize: 11, color: '#e2e4ea', fontWeight: 600 }}>
                    {it.days} days
                  </span>
                </div>
                {/* Distance */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                  <Navigation size={10} color="#8a8f9e" />
                  <span style={{ fontSize: 11, color: '#8a8f9e' }}>
                    {it.totalKm.toLocaleString()} km
                  </span>
                </div>
                {/* Difficulty */}
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    color: difficultyColor(it.difficulty),
                    backgroundColor: `${difficultyColor(it.difficulty)}18`,
                    padding: '1px 6px',
                    borderRadius: 8,
                    border: `1px solid ${difficultyColor(it.difficulty)}33`,
                  }}
                >
                  {it.difficulty}
                </div>
              </div>

              {/* Tagline */}
              <p style={{ margin: '0 0 6px', fontSize: 11, color: '#8a8f9e', lineHeight: 1.4 }}>
                {it.tagline}
              </p>

              {/* Season tags */}
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {it.seasons.map((s) => (
                  <span
                    key={s}
                    style={{
                      fontSize: 9,
                      color: '#5a5f6e',
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      padding: '1px 5px',
                      borderRadius: 6,
                      border: '1px solid rgba(255,255,255,0.07)',
                    }}
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Footer note */}
      <p
        style={{
          margin: '20px 0 0',
          fontSize: 11,
          color: '#3a3f4e',
          textAlign: 'center',
          lineHeight: 1.5,
        }}
      >
        Distances and drive times are approximate.{'\n'}
        Always check road conditions at road.is
      </p>
    </div>
  )
}
