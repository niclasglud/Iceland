'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import { Location } from '@/types'

interface SpotDetailProps {
  location: Location
  onClose: () => void
  onViewOnMap: () => void
  onNavigate?: (location: Location) => void
}

const REGION_INFO: Record<string, { label: string; color: string; bg: string }> = {
  'ring-road':    { label: 'Ring Road',    color: '#4a9eff', bg: 'rgba(74,158,255,0.15)' },
  'highlands':    { label: 'Highlands',    color: '#f5a623', bg: 'rgba(245,166,35,0.15)' },
  'westfjords':   { label: 'Westfjords',   color: '#8b5cf6', bg: 'rgba(139,92,246,0.15)' },
  'snaefellsnes': { label: 'Snæfellsnes', color: '#06b6d4', bg: 'rgba(6,182,212,0.15)'  },
  'reykjanes':    { label: 'Reykjanes',    color: '#ef4444', bg: 'rgba(239,68,68,0.15)'  },
  'east':         { label: 'East',         color: '#10b981', bg: 'rgba(16,185,129,0.15)' },
  'north':        { label: 'North',        color: '#60a5fa', bg: 'rgba(96,165,250,0.15)' },
  'south':        { label: 'South',        color: '#fbbf24', bg: 'rgba(251,191,36,0.15)' },
}

const TYPE_ICONS: Record<string, string> = {
  waterfall: '💧', glacier: '🧊', volcano: '🌋', lake: '🏞️',
  canyon: '🏜️', beach: '🏖️', 'hot-spring': '♨️', lava: '🔥',
  mountain: '⛰️', ruins: '🏛️', geothermal: '💨', valley: '🌿',
}

const SEASON_COLORS: Record<string, { color: string; bg: string }> = {
  spring: { color: '#34d399', bg: 'rgba(52,211,153,0.12)' },
  summer: { color: '#fbbf24', bg: 'rgba(251,191,36,0.12)' },
  autumn: { color: '#f97316', bg: 'rgba(249,115,22,0.12)' },
  winter: { color: '#93c5fd', bg: 'rgba(147,197,253,0.12)' },
}

const LIGHT_ICONS: Record<string, string> = {
  sunrise: '🌅',
  'golden-hour': '🌇',
  'midnight-sun': '☀️',
  overcast: '☁️',
  'northern-lights': '🌌',
  sunset: '🌆',
}

const DIFFICULTY_CONFIG: Record<string, { color: string; label: string }> = {
  easy:     { color: '#10b981', label: 'Easy' },
  moderate: { color: '#f5a623', label: 'Moderate' },
  hard:     { color: '#ef4444', label: 'Hard' },
  extreme:  { color: '#8b5cf6', label: 'Extreme' },
}

const THUMB_FALLBACK: Record<string, string> = {
  waterfall:   'linear-gradient(160deg,#0c2a4a,#1e6a9e)',
  glacier:     'linear-gradient(160deg,#0e3a50,#4cc9e0)',
  volcano:     'linear-gradient(160deg,#2d0a0a,#b91c1c)',
  lake:        'linear-gradient(160deg,#0c2040,#2563eb)',
  canyon:      'linear-gradient(160deg,#2a1200,#d97706)',
  beach:       'linear-gradient(160deg,#1a2a30,#ca8a04)',
  'hot-spring':'linear-gradient(160deg,#2a1200,#ea580c)',
  lava:        'linear-gradient(160deg,#1a0000,#dc2626)',
  mountain:    'linear-gradient(160deg,#111122,#6366f1)',
  ruins:       'linear-gradient(160deg,#1a0e2e,#7c3aed)',
  geothermal:  'linear-gradient(160deg,#1e1000,#f97316)',
  valley:      'linear-gradient(160deg,#081a0f,#15803d)',
}

export default function SpotDetail({ location, onClose, onViewOnMap, onNavigate }: SpotDetailProps) {
  const region = REGION_INFO[location.region] ?? { label: location.region, color: '#8a8f9e', bg: 'rgba(138,143,158,0.15)' }
  const fallback = THUMB_FALLBACK[location.type] ?? 'linear-gradient(160deg,#111,#333)'
  const typeIcon = TYPE_ICONS[location.type] ?? '📍'

  // Close on back gesture / escape key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  // Prevent body scroll while open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: '#0a0b0e',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
        overscrollBehavior: 'contain',
      }}
    >
      {/* ── Hero image ──────────────────────────────────────────────────────── */}
      <div style={{ position: 'relative', width: '100%', height: 260, flexShrink: 0, background: fallback }}>
        {location.thumbnail && (
          <Image
            src={location.thumbnail}
            alt={location.name}
            fill
            priority
            sizes="100vw"
            style={{ objectFit: 'cover' }}
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
        )}

        {/* Dark gradient overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, transparent 40%, rgba(10,11,14,0.8) 100%)',
        }} />

        {/* Back button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: 16, left: 16,
            width: 38, height: 38, borderRadius: '50%',
            background: 'rgba(10,11,14,0.75)',
            border: '1px solid rgba(255,255,255,0.2)',
            color: '#fff', fontSize: 18, fontWeight: 600,
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(8px)',
          }}
          aria-label="Close"
        >
          ←
        </button>

        {/* Type icon pill */}
        <div style={{
          position: 'absolute', top: 16, right: 16,
          padding: '5px 12px', borderRadius: 999,
          background: 'rgba(10,11,14,0.75)',
          border: '1px solid rgba(255,255,255,0.15)',
          fontSize: 13, backdropFilter: 'blur(8px)',
        }}>
          {typeIcon} {location.type.replace('-', ' ')}
        </div>

        {/* Name over image bottom */}
        <div style={{ position: 'absolute', bottom: 16, left: 16, right: 16 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#fff', lineHeight: 1.2, textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}>
            {location.name}
          </h1>
          {location.icelandicName && (
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', fontStyle: 'italic', marginTop: 3 }}>
              {location.icelandicName}
            </p>
          )}
        </div>
      </div>

      {/* ── Content ─────────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, padding: '16px 16px 32px', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Badges row */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          <Badge color={region.color} bg={region.bg}>{region.label}</Badge>
          {location.category === 'hidden-gem' && <Badge color="#a78bfa" bg="rgba(167,139,250,0.15)">💎 Hidden Gem</Badge>}
          {location.category === 'highland'   && <Badge color="#f5a623" bg="rgba(245,166,35,0.15)">🏔️ Highland</Badge>}
          {location.category === 'popular'    && <Badge color="#4a9eff" bg="rgba(74,158,255,0.15)">⭐ Popular</Badge>}
          {location.fRoad && <Badge color="#ef4444" bg="rgba(239,68,68,0.15)">🚙 {location.fRoad} required</Badge>}
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {location.elevation != null && (
            <StatBox label="Elevation" value={`${location.elevation.toLocaleString()}m`} icon="▲" />
          )}
          {location.distance != null && (
            <StatBox label="From Reykjavík" value={`${location.distance} km`} icon="📍" />
          )}
          {location.difficulty && (
            <StatBox
              label="Difficulty"
              value={DIFFICULTY_CONFIG[location.difficulty]?.label ?? location.difficulty}
              icon="🥾"
              color={DIFFICULTY_CONFIG[location.difficulty]?.color}
            />
          )}
          {location.auroraRating && (
            <StatBox
              label="Aurora"
              value={'★'.repeat(location.auroraRating) + '☆'.repeat(3 - location.auroraRating)}
              icon="🌌"
              color="#00ff88"
            />
          )}
        </div>

        {/* Description */}
        <Section title="About">
          <p style={{ fontSize: 14, color: '#c8cad4', lineHeight: 1.7 }}>
            {location.description}
          </p>
        </Section>

        {/* Hiking info */}
        {location.hikingInfo && (
          <Section title="Hiking Info">
            <p style={{ fontSize: 14, color: '#c8cad4', lineHeight: 1.7 }}>
              {location.hikingInfo}
            </p>
          </Section>
        )}

        {/* Best seasons */}
        <Section title="Best Seasons">
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {(['spring', 'summer', 'autumn', 'winter'] as const).map((s) => {
              const active = location.bestSeason.includes(s)
              const c = SEASON_COLORS[s]
              return (
                <span
                  key={s}
                  style={{
                    padding: '5px 14px', borderRadius: 999, fontSize: 12, fontWeight: 600,
                    color: active ? c.color : '#4a4d5a',
                    background: active ? c.bg : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${active ? c.color + '40' : 'rgba(255,255,255,0.08)'}`,
                    textTransform: 'capitalize',
                  }}
                >
                  {s}
                </span>
              )
            })}
          </div>
        </Section>

        {/* Best light */}
        <Section title="Best Light">
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {location.bestLight.map((light) => (
              <span
                key={light}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  padding: '5px 12px', borderRadius: 999, fontSize: 12, fontWeight: 500,
                  color: '#f5a623', background: 'rgba(245,166,35,0.1)',
                  border: '1px solid rgba(245,166,35,0.25)',
                }}
              >
                {LIGHT_ICONS[light] ?? '💡'} {light.replace(/-/g, ' ')}
              </span>
            ))}
          </div>
        </Section>

        {/* Tags */}
        {location.tags.length > 0 && (
          <Section title="Tags">
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {location.tags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    padding: '4px 10px', borderRadius: 8, fontSize: 11,
                    color: '#8a8f9e', background: 'transparent',
                    border: '1px solid rgba(255,255,255,0.12)',
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </Section>
        )}

        {/* Coordinates */}
        <Section title="Coordinates">
          <p style={{ fontSize: 13, color: '#8a8f9e', fontFamily: 'monospace' }}>
            {location.coordinates[1].toFixed(4)}°N, {Math.abs(location.coordinates[0]).toFixed(4)}°W
          </p>
        </Section>

        {/* CTA buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
          {/* Start Navigation — primary CTA */}
          {onNavigate && (
            <button
              onClick={() => { onNavigate(location); onClose() }}
              style={{
                width: '100%', height: 52, borderRadius: 14, fontWeight: 700, fontSize: 16,
                background: '#f5a623', color: '#0a0b0e', border: 'none', cursor: 'pointer',
                boxShadow: '0 4px 24px rgba(245,166,35,0.45)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M9 2L16 9L9 16" stroke="#0a0b0e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 9H16" stroke="#0a0b0e" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
              Start Navigation
            </button>
          )}

          {/* View on Map + Close row */}
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={onViewOnMap}
              style={{
                flex: 1, height: 48, borderRadius: 14, fontWeight: 600, fontSize: 14,
                background: 'rgba(255,255,255,0.07)', color: '#fff',
                border: '1px solid rgba(255,255,255,0.12)', cursor: 'pointer',
              }}
            >
              🗺️ View on Map
            </button>
            <button
              onClick={onClose}
              style={{
                width: 48, height: 48, borderRadius: 14, fontWeight: 700,
                background: 'rgba(255,255,255,0.07)', color: '#fff',
                border: '1px solid rgba(255,255,255,0.12)', cursor: 'pointer', fontSize: 18,
              }}
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function Badge({ color, bg, children }: { color: string; bg: string; children: React.ReactNode }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '4px 10px', borderRadius: 999, fontSize: 11, fontWeight: 600,
      color, background: bg, border: `1px solid ${color}30`,
    }}>
      {children}
    </span>
  )
}

function StatBox({ label, value, icon, color }: { label: string; value: string; icon: string; color?: string }) {
  return (
    <div style={{
      padding: '10px 12px', borderRadius: 12,
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.08)',
    }}>
      <div style={{ fontSize: 11, color: '#8a8f9e', marginBottom: 4 }}>{icon} {label}</div>
      <div style={{ fontSize: 14, fontWeight: 700, color: color ?? '#fff' }}>{value}</div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 style={{ fontSize: 11, fontWeight: 700, color: '#8a8f9e', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
        {title}
      </h3>
      {children}
    </div>
  )
}
