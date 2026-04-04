'use client'

import { useMemo } from 'react'
import { Location, BestLight } from '@/types'
import SpotCard from './SpotCard'
import SpotFilters from './SpotFilters'

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
}: SpotsListProps) {
  // ── Filtering logic ─────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let result = locations

    if (typeFilter !== 'all') {
      result = result.filter((loc) => {
        // Match location.type OR location.category (for 'highland' category filter)
        if (loc.type === typeFilter) return true
        if (loc.category === typeFilter) return true
        return false
      })
    }

    if (lightFilter !== 'all') {
      // Map filter value to BestLight union — 'northern-lights' maps to the type value
      result = result.filter((loc) =>
        loc.bestLight.includes(lightFilter as BestLight)
      )
    }

    return result
  }, [locations, typeFilter, lightFilter])

  return (
    <div
      className="flex flex-col h-full"
      style={{ background: '#0a0b0e' }}
    >
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

        {/* Expand / collapse button — desktop style, top right */}
        <button
          onClick={onExpandToggle}
          className="flex items-center gap-1 font-semibold transition-all active:scale-95 shrink-0"
          style={{
            height: 26,
            padding: '0 12px',
            borderRadius: 999,
            background: isExpanded ? 'rgba(245,166,35,0.12)' : '#f5a623',
            color: isExpanded ? '#f5a623' : '#0a0b0e',
            border: isExpanded ? '1px solid rgba(245,166,35,0.3)' : 'none',
            fontSize: 11,
          }}
        >
          {isExpanded ? '↙ Collapse' : '↗ Expand'}
        </button>
      </div>

      {/* ── Filters ─────────────────────────────────────────────────────────── */}
      <div className="px-3 py-2 shrink-0">
        <SpotFilters
          typeFilter={typeFilter}
          lightFilter={lightFilter}
          onTypeFilterChange={onTypeFilterChange}
          onLightFilterChange={onLightFilterChange}
        />
      </div>

      {/* ── Spots list (scrollable) ─────────────────────────────────────────── */}
      <div
        className="flex-1 overflow-y-auto px-3 pb-4"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(255,255,255,0.08) transparent',
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
            height: 30,
            padding: '0 16px',
            borderRadius: 999,
            background: '#f5a623',
            color: '#0a0b0e',
            fontSize: 12,
            boxShadow: '0 2px 12px rgba(245,166,35,0.35)',
            border: 'none',
          }}
        >
          {isExpanded ? '↙ Collapse Spots' : '↗ Expand Spots'}
        </button>

        {/* Sort hint */}
        <span style={{ fontSize: 10, color: '#8a8f9e' }}>
          {filtered.length} spot{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>
    </div>
  )
}
