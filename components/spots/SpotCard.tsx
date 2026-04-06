'use client'

import Image from 'next/image'
import { Plus } from 'lucide-react'
import { Location, SunInfo } from '@/types'

interface SpotCardProps {
  location: Location
  isSelected: boolean
  onSelect: (location: Location) => void
  sunInfo?: Pick<SunInfo, 'goldenHour' | 'sunrise'>
  onAddToTrip?: (location: Location) => void
}

// Region display config: label + color
const REGION_INFO: Record<string, { label: string; color: string; bg: string }> = {
  'ring-road':    { label: 'Ring Road',    color: '#4a9eff', bg: 'rgba(74,158,255,0.12)' },
  'highlands':    { label: 'Highlands',    color: '#f5a623', bg: 'rgba(245,166,35,0.12)' },
  'westfjords':   { label: 'Westfjords',   color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)' },
  'snaefellsnes': { label: 'Snæfellsnes', color: '#06b6d4', bg: 'rgba(6,182,212,0.12)'  },
  'reykjanes':    { label: 'Reykjanes',    color: '#ef4444', bg: 'rgba(239,68,68,0.12)'  },
  'east':         { label: 'East',         color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
  'north':        { label: 'North',        color: '#60a5fa', bg: 'rgba(96,165,250,0.12)' },
  'south':        { label: 'South',        color: '#fbbf24', bg: 'rgba(251,191,36,0.12)' },
}

const DIFFICULTY_COLORS: Record<string, string> = {
  easy:     '#10b981',
  moderate: '#f5a623',
  hard:     '#ef4444',
  extreme:  '#8b5cf6',
}

// Fallback gradient bg if thumbnail fails to load
const THUMB_FALLBACK_COLORS: Record<string, string> = {
  waterfall:   'linear-gradient(135deg,#1e3a5f,#4a9eff)',
  glacier:     'linear-gradient(135deg,#0e4155,#a5f3fc)',
  volcano:     'linear-gradient(135deg,#450a0a,#ef4444)',
  lake:        'linear-gradient(135deg,#1e3a5f,#60a5fa)',
  canyon:      'linear-gradient(135deg,#3d1f00,#f59e0b)',
  beach:       'linear-gradient(135deg,#1a3040,#fbbf24)',
  'hot-spring':'linear-gradient(135deg,#3d1500,#f97316)',
  lava:        'linear-gradient(135deg,#3d0000,#dc2626)',
  mountain:    'linear-gradient(135deg,#1a1a2e,#f87171)',
  ruins:       'linear-gradient(135deg,#1a0e2e,#a78bfa)',
  geothermal:  'linear-gradient(135deg,#2d1500,#fb923c)',
  valley:      'linear-gradient(135deg,#0a2a1a,#34d399)',
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })
}

export default function SpotCard({ location, isSelected, onSelect, sunInfo, onAddToTrip }: SpotCardProps) {
  const region = REGION_INFO[location.region] ?? { label: location.region, color: '#8a8f9e', bg: 'rgba(138,143,158,0.12)' }
  const thumbFallback = THUMB_FALLBACK_COLORS[location.type] ?? 'linear-gradient(135deg,#1a1a2e,#4a9eff)'
  const visibleTags = location.tags.slice(0, 3)

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(location)}
      onKeyDown={(e) => e.key === 'Enter' && onSelect(location)}
      className={`spot-card no-select${isSelected ? ' selected' : ''}`}
      style={{
        display: 'flex',
        gap: 10,
        padding: 12,
        borderRadius: 14,
        background: isSelected ? 'rgba(245,166,35,0.07)' : 'rgba(18,20,28,0.95)',
        border: `1px solid ${isSelected ? '#f5a623' : 'rgba(255,255,255,0.08)'}`,
        cursor: 'pointer',
        transition: 'all 0.12s ease',
        outline: 'none',
      }}
    >
      {/* ── Left: text content (65%) ─────────────────────────────────────── */}
      <div className="flex flex-col gap-1.5 min-w-0" style={{ flex: '0 0 65%' }}>

        {/* Top badges row */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Region badge */}
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '2px 7px',
              borderRadius: 999,
              fontSize: 10,
              fontWeight: 600,
              color: region.color,
              background: region.bg,
              border: `1px solid ${region.color}30`,
              whiteSpace: 'nowrap',
            }}
          >
            {region.label}
          </span>

          {/* Category badge */}
          {location.category === 'hidden-gem' && (
            <span className="gem-badge">💎 Hidden Gem</span>
          )}
          {location.category === 'highland' && (
            <span className="highland-badge">🏔️ Highland</span>
          )}
          {location.category === 'popular' && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '2px 7px',
                borderRadius: 999,
                fontSize: 10,
                fontWeight: 600,
                color: '#4a9eff',
                background: 'rgba(74,158,255,0.12)',
                border: '1px solid rgba(74,158,255,0.25)',
              }}
            >
              ⭐ Popular
            </span>
          )}

          {/* F-road badge */}
          {location.fRoad && (
            <span className="f-road-badge">🚙 {location.fRoad}</span>
          )}
        </div>

        {/* Location name */}
        <div>
          <h3
            className="truncate"
            style={{ fontSize: 14, fontWeight: 600, color: '#ffffff', lineHeight: 1.3 }}
          >
            {location.name}
          </h3>
          {location.icelandicName && (
            <p
              className="truncate"
              style={{ fontSize: 10, color: '#8a8f9e', marginTop: 1, fontStyle: 'italic' }}
            >
              {location.icelandicName}
            </p>
          )}
        </div>

        {/* Description */}
        <p
          style={{
            fontSize: 11,
            color: '#8a8f9e',
            lineHeight: 1.5,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {location.description}
        </p>

        {/* Tags */}
        {visibleTags.length > 0 && (
          <div className="flex items-center gap-1 flex-wrap">
            {visibleTags.map((tag) => (
              <span
                key={tag}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '1px 6px',
                  borderRadius: 6,
                  fontSize: 10,
                  color: '#8a8f9e',
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.1)',
                  whiteSpace: 'nowrap',
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Bottom row: elevation + difficulty + aurora rating */}
        <div className="flex items-center gap-2 mt-auto">
          {location.elevation != null && (
            <span style={{ fontSize: 10, color: '#8a8f9e' }}>
              ▲ {location.elevation.toLocaleString()}m
            </span>
          )}
          {location.distance != null && (
            <span style={{ fontSize: 10, color: '#8a8f9e' }}>
              {location.distance} km
            </span>
          )}
          {location.difficulty && (
            <span
              style={{
                fontSize: 10,
                fontWeight: 600,
                color: DIFFICULTY_COLORS[location.difficulty] ?? '#8a8f9e',
              }}
            >
              {location.difficulty.charAt(0).toUpperCase() + location.difficulty.slice(1)}
            </span>
          )}
          {location.auroraRating && (
            <span
              style={{ fontSize: 10, color: '#00ff88' }}
              title={`Aurora rating: ${location.auroraRating}/3`}
            >
              {'★'.repeat(location.auroraRating)}{'☆'.repeat(3 - location.auroraRating)}
            </span>
          )}
          {sunInfo && (
            <span style={{ fontSize: 10, color: '#f5a623', marginLeft: 'auto' }}>
              🌅 {formatTime(sunInfo.goldenHour)}
            </span>
          )}
        </div>

        {/* Add to Trip button */}
        {onAddToTrip && (
          <button
            onClick={(e) => { e.stopPropagation(); onAddToTrip(location) }}
            style={{
              marginTop: 6,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 10,
              fontWeight: 600,
              color: '#f5a623',
              backgroundColor: 'rgba(245,166,35,0.10)',
              border: '1px solid rgba(245,166,35,0.25)',
              borderRadius: 8,
              padding: '4px 9px',
              cursor: 'pointer',
            }}
          >
            <Plus size={10} />
            Add to Trip
          </button>
        )}
      </div>

      {/* ── Right: thumbnail (35%) ───────────────────────────────────────── */}
      <div
        style={{
          flex: '0 0 35%',
          borderRadius: 10,
          overflow: 'hidden',
          aspectRatio: '4/3',
          position: 'relative',
          background: thumbFallback,
          minHeight: 72,
        }}
      >
        {location.thumbnail ? (
          <Image
            src={location.thumbnail}
            alt={location.name}
            fill
            sizes="120px"
            style={{ objectFit: 'cover' }}
            onError={(e) => {
              // Hide broken image; fallback gradient shows through
              const target = e.target as HTMLImageElement
              target.style.display = 'none'
            }}
          />
        ) : null}

        {/* Selected overlay ring */}
        {isSelected && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: 10,
              border: '2px solid #f5a623',
              pointerEvents: 'none',
            }}
          />
        )}
      </div>
    </div>
  )
}
