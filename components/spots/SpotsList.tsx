'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import { Location, BestLight } from '@/types'
import { getFRoadStatus } from '@/lib/spot-scoring'
import SpotCard from './SpotCard'
import SpotFilters from './SpotFilters'
import WildlifeCalendar from '@/components/wildlife/WildlifeCalendar'

const TYPE_ICONS: Record<string, string> = {
  waterfall: '💧', glacier: '🧊', volcano: '🌋', lake: '🏞️',
  canyon: '🏜️', beach: '🏖️', 'hot-spring': '♨️', lava: '🔥',
  mountain: '⛰️', ruins: '🏛️', geothermal: '💨', valley: '🌿',
}

const THUMB_FALLBACK: Record<string, string> = {
  waterfall: 'linear-gradient(135deg,#1e3a5f,#4a9eff)',
  glacier:   'linear-gradient(135deg,#0e4155,#a5f3fc)',
  volcano:   'linear-gradient(135deg,#450a0a,#ef4444)',
  lake:      'linear-gradient(135deg,#1e3a5f,#60a5fa)',
  mountain:  'linear-gradient(135deg,#1a1a2e,#f87171)',
  lava:      'linear-gradient(135deg,#3d0000,#dc2626)',
}

interface SpotsListProps {
  locations: Location[]
  selectedLocation: Location | null
  onLocationSelect: (loc: Location) => void
  isExpanded: boolean
  onExpandToggle: () => void
  typeFilter: string
  lightFilter: string
  onTypeFilterChange: (f: string) => void
  onLightFilterChange: (f: string) => void
  fRoadFilter: boolean
  onFRoadFilterChange: (v: boolean) => void
  featuredSpots?: Location[]
  onAddToTrip?: (loc: Location) => void
}

export default function SpotsList({
  locations,
  selectedLocation,
  onLocationSelect,
  isExpanded,
  onExpandToggle,
  typeFilter,
  lightFilter,
  onTypeFilterChange,
  onLightFilterChange,
  fRoadFilter,
  onFRoadFilterChange,
  featuredSpots,
  onAddToTrip,
}: SpotsListProps) {
  const [picksCollapsed, setPicksCollapsed] = useState(false)
  const nowMonth = new Date().getMonth()
  const fRoadStatus = getFRoadStatus(nowMonth)

  // ── Filtering logic ─────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let result = locations

    if (fRoadFilter) {
      result = result.filter((loc) => !!loc.fRoad)
    }

    if (typeFilter !== 'all') {
      result = result.filter((loc) => {
        if (loc.type === typeFilter) return true
        if (loc.category === typeFilter) return true
        return false
      })
    }

    if (lightFilter !== 'all') {
      result = result.filter((loc) =>
        loc.bestLight.includes(lightFilter as BestLight)
      )
    }

    return result
  }, [locations, typeFilter, lightFilter, fRoadFilter])

  return (
    <div className="flex flex-col h-full" style={{ background: '#0a0b0e' }}>

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div
        className="flex items-center justify-between px-3 pt-3 pb-2 shrink-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="flex items-baseline gap-2">
          <h2 style={{ fontSize: 15, fontWeight: 700, color: '#ffffff' }}>
            Iceland Spots
          </h2>
          <span style={{ fontSize: 11, color: '#8a8f9e', fontWeight: 400 }}>
            {filtered.length} of {locations.length} spots
          </span>
        </div>

        <button
          onClick={onExpandToggle}
          className="flex items-center gap-1 font-semibold transition-all active:scale-95 shrink-0"
          style={{
            height: 26, padding: '0 12px', borderRadius: 999,
            background: isExpanded ? 'rgba(245,166,35,0.12)' : '#f5a623',
            color: isExpanded ? '#f5a623' : '#0a0b0e',
            border: isExpanded ? '1px solid rgba(245,166,35,0.3)' : 'none',
            fontSize: 11,
          }}
        >
          {isExpanded ? '↙ Collapse' : '↗ Expand'}
        </button>
      </div>

      {/* ── Today's Picks carousel ───────────────────────────────────────────── */}
      {featuredSpots && featuredSpots.length > 0 && (
        <div className="px-3 pt-2 shrink-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span style={{ fontSize: 11, fontWeight: 700, color: '#f5a623', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                ⭐ Today&apos;s Picks
              </span>
              {!picksCollapsed && (
                <span style={{ fontSize: 10, color: '#8a8f9e' }}>Best conditions now</span>
              )}
            </div>
            <button
              onClick={() => setPicksCollapsed(v => !v)}
              style={{
                fontSize: 10, fontWeight: 600, cursor: 'pointer',
                background: 'transparent', border: 'none',
                color: '#8a8f9e', padding: '2px 6px',
              }}
            >
              {picksCollapsed ? '▼ Show' : '▲ Hide'}
            </button>
          </div>
          {!picksCollapsed && <div
            className="flex gap-2 overflow-x-auto pb-2"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {featuredSpots.map((loc) => (
              <button
                key={loc.id}
                onClick={() => onLocationSelect(loc)}
                style={{
                  flexShrink: 0,
                  width: 120,
                  borderRadius: 12,
                  overflow: 'hidden',
                  background: 'rgba(18,20,28,0.95)',
                  border: selectedLocation?.id === loc.id
                    ? '1.5px solid #f5a623'
                    : '1px solid rgba(245,166,35,0.25)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  padding: 0,
                }}
              >
                {/* Thumbnail */}
                <div style={{
                  position: 'relative',
                  width: '100%',
                  height: 72,
                  background: THUMB_FALLBACK[loc.type] ?? 'linear-gradient(135deg,#1a1a2e,#4a9eff)',
                }}>
                  {loc.thumbnail && (
                    <Image
                      src={loc.thumbnail}
                      alt={loc.name}
                      fill
                      sizes="120px"
                      style={{ objectFit: 'cover' }}
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                    />
                  )}
                  {/* Type icon overlay */}
                  <div style={{
                    position: 'absolute', top: 4, right: 4,
                    background: 'rgba(0,0,0,0.65)',
                    borderRadius: 6, padding: '1px 5px', fontSize: 10,
                  }}>
                    {TYPE_ICONS[loc.type] ?? '📍'}
                  </div>
                </div>
                {/* Name + region */}
                <div style={{ padding: '6px 8px' }}>
                  <div style={{
                    fontSize: 11, fontWeight: 700, color: '#fff',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>
                    {loc.name}
                  </div>
                  <div style={{ fontSize: 10, color: '#f5a623', marginTop: 2 }}>
                    {loc.region.replace(/-/g, ' ')}
                  </div>
                </div>
              </button>
            ))}
          </div>}
          {/* Divider */}
          <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', marginBottom: 4 }} />
        </div>
      )}

      {/* ── Wildlife this month ─────────────────────────────────────────────── */}
      <WildlifeCalendar compact />

      {/* ── Filters ─────────────────────────────────────────────────────────── */}
      <div className="px-3 py-2 shrink-0">
        <SpotFilters
          typeFilter={typeFilter}
          lightFilter={lightFilter}
          onTypeFilterChange={onTypeFilterChange}
          onLightFilterChange={onLightFilterChange}
        />

        {/* 4WD / F-Road filter row */}
        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={() => onFRoadFilterChange(!fRoadFilter)}
            style={{
              height: 26, padding: '0 12px', borderRadius: 999,
              fontSize: 11, fontWeight: 600, cursor: 'pointer',
              background: fRoadFilter ? 'rgba(245,166,35,0.15)' : 'transparent',
              border: fRoadFilter ? '1px solid rgba(245,166,35,0.5)' : '1px solid rgba(255,255,255,0.12)',
              color: fRoadFilter ? '#f5a623' : '#8a8f9e',
              display: 'flex', alignItems: 'center', gap: 5,
            }}
          >
            🚙 4WD / F-Roads
          </button>

          {/* F-road season status */}
          {fRoadFilter && (
            <span style={{
              fontSize: 10, fontWeight: 600,
              color: fRoadStatus.color,
              background: `${fRoadStatus.color}18`,
              border: `1px solid ${fRoadStatus.color}40`,
              borderRadius: 999, padding: '2px 8px',
            }}>
              {fRoadStatus.open ? '● Open' : '● Closed'} · {fRoadStatus.label}
            </span>
          )}
        </div>
      </div>

      {/* ── Spots list (scrollable) ─────────────────────────────────────────── */}
      <div
        className="flex-1 overflow-y-auto px-3 pb-4"
        style={{
          display: 'flex', flexDirection: 'column', gap: 8,
          scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.08) transparent',
        }}
      >
        {filtered.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center text-center"
            style={{ paddingTop: 48, gap: 8 }}
          >
            <span style={{ fontSize: 32 }}>🗺️</span>
            <p style={{ fontSize: 13, color: '#8a8f9e' }}>
              No spots match your filters.
            </p>
            <button
              onClick={() => {
                onTypeFilterChange('all')
                onLightFilterChange('all')
                onFRoadFilterChange(false)
              }}
              className="pill-btn active"
              style={{ marginTop: 4 }}
            >
              Clear filters
            </button>
          </div>
        ) : (
          filtered.map((loc) => (
            <SpotCard
              key={loc.id}
              location={loc}
              isSelected={selectedLocation?.id === loc.id}
              onSelect={onLocationSelect}
              onAddToTrip={onAddToTrip}
            />
          ))
        )}
      </div>

      {/* ── Bottom action bar ───────────────────────────────────────────────── */}
      <div
        className="flex items-center justify-between px-3 py-2 shrink-0"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
      >
        <button
          onClick={onExpandToggle}
          className="flex items-center gap-1.5 font-semibold transition-all active:scale-95"
          style={{
            height: 30, padding: '0 16px', borderRadius: 999,
            background: '#f5a623', color: '#0a0b0e',
            fontSize: 12, boxShadow: '0 2px 12px rgba(245,166,35,0.35)', border: 'none',
          }}
        >
          {isExpanded ? '↙ Collapse Spots' : '↗ Expand Spots'}
        </button>

        <span style={{ fontSize: 10, color: '#8a8f9e' }}>
          {filtered.length} spot{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>
    </div>
  )
}
