'use client'

import React, { useState, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { Place, PlaceType, Region } from '@/types'
import { places } from '@/data/places'

const PlacesMap = dynamic(() => import('./PlacesMap'), {
  ssr: false,
  loading: () => (
    <div style={{ height: 280, background: '#0d1117', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div
        className="animate-spin"
        style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid #f5a623', borderTopColor: 'transparent' }}
      />
    </div>
  ),
})

type TypeFilter = PlaceType | 'all'
type RegionFilter = Region | 'all'

const TYPE_LABELS: { id: TypeFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'restaurant', label: 'Restaurants' },
  { id: 'cafe', label: 'Cafes' },
  { id: 'hotel', label: 'Hotels' },
  { id: 'campsite', label: 'Campsites' },
  { id: 'geothermal-pool', label: 'Pools' },
]

interface RegionOption {
  id: RegionFilter
  label: string
}

const REGION_OPTIONS: RegionOption[] = [
  { id: 'all', label: 'All' },
  { id: 'reykjanes', label: 'Reykjavik' },
  { id: 'south', label: 'South' },
  { id: 'ring-road', label: 'Ring Road' },
  { id: 'north', label: 'North' },
  { id: 'east', label: 'East' },
  { id: 'westfjords', label: 'Westfjords' },
  { id: 'snaefellsnes', label: 'Snæfellsnes' },
  { id: 'highlands', label: 'Highlands' },
]

export default function PlacesTab() {
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null)
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')
  const [regionFilter, setRegionFilter] = useState<RegionFilter>('all')

  const filtered = useMemo(
    () =>
      places.filter((p) => {
        if (typeFilter !== 'all' && p.type !== typeFilter) return false
        if (regionFilter !== 'all' && p.region !== regionFilter) return false
        return true
      }),
    [typeFilter, regionFilter],
  )

  const countByType = useMemo(() => {
    const counts: Record<string, number> = { restaurant: 0, cafe: 0, hotel: 0, campsite: 0, 'geothermal-pool': 0 }
    places.forEach((p) => { counts[p.type] = (counts[p.type] || 0) + 1 })
    return counts
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#0a0b0e' }}>
      {/* Header */}
      <div style={{ padding: '12px 16px 8px' }}>
        <div style={{ color: '#ffffff', fontSize: 18, fontWeight: 700, lineHeight: '1.2' }}>Places</div>
        <div style={{ color: '#8a8f9e', fontSize: 12, marginTop: 2 }}>
          {places.length} restaurants, cafes, hotels &amp; more
        </div>
      </div>

      {/* Type filter pills */}
      <div style={{ display: 'flex', gap: 8, padding: '8px 12px', flexShrink: 0 }}>
        {TYPE_LABELS.map(({ id, label }) => {
          const active = typeFilter === id
          const count = id === 'all' ? places.length : countByType[id] || 0
          return (
            <button
              key={id}
              onClick={() => setTypeFilter(id)}
              style={{
                borderRadius: 9999,
                padding: '4px 12px',
                fontSize: 12,
                fontWeight: active ? 600 : 400,
                background: active ? '#f5a623' : 'rgba(255,255,255,0.06)',
                color: active ? '#0a0b0e' : '#8a8f9e',
                border: 'none',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {label} ({count})
            </button>
          )
        })}
      </div>

      {/* Region filter pills */}
      <div style={{ overflowX: 'auto', scrollbarWidth: 'none', flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: 6, padding: '6px 12px', width: 'max-content' }}>
          {REGION_OPTIONS.map(({ id, label }) => {
            const active = regionFilter === id
            return (
              <button
                key={id}
                onClick={() => setRegionFilter(id)}
                style={{
                  borderRadius: 9999,
                  padding: '3px 10px',
                  fontSize: 11,
                  fontWeight: active ? 600 : 400,
                  background: active ? '#f5a623' : 'rgba(255,255,255,0.06)',
                  color: active ? '#0a0b0e' : '#8a8f9e',
                  border: 'none',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                {label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Map */}
      <PlacesMap
        places={filtered}
        selectedPlace={selectedPlace}
        onPlaceSelect={setSelectedPlace}
      />

      {/* Place cards list */}
      <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'none' }}>
        {filtered.length === 0 ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: 120,
              color: '#8a8f9e',
              fontSize: 14,
            }}
          >
            No places found
          </div>
        ) : (
          filtered.map((place) => {
            const isSelected = selectedPlace?.id === place.id
            return (
              <div
                key={place.id}
                onClick={() => setSelectedPlace(isSelected ? null : place)}
                style={{
                  display: 'flex',
                  gap: 10,
                  padding: 12,
                  cursor: 'pointer',
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                  background: isSelected ? 'rgba(245,166,35,0.08)' : 'transparent',
                  borderLeft: isSelected ? '3px solid #f5a623' : '3px solid transparent',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.03)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    (e.currentTarget as HTMLDivElement).style.background = 'transparent'
                  }
                }}
              >
                {/* Thumbnail */}
                <img
                  src={place.thumbnail}
                  alt={place.name}
                  style={{
                    width: 68,
                    height: 68,
                    borderRadius: 8,
                    objectFit: 'cover',
                    flexShrink: 0,
                  }}
                />

                {/* Info */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3, minWidth: 0 }}>
                  {/* Row 1: badge + price + rating */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        padding: '2px 7px',
                        borderRadius: 4,
                        background:
                          place.type === 'hotel'
                            ? 'rgba(74,158,255,0.15)'
                            : place.type === 'campsite'
                            ? 'rgba(74,200,100,0.15)'
                            : place.type === 'geothermal-pool'
                            ? 'rgba(100,180,255,0.15)'
                            : 'rgba(245,166,35,0.15)',
                        color:
                          place.type === 'hotel'
                            ? '#4a9eff'
                            : place.type === 'campsite'
                            ? '#4ac864'
                            : place.type === 'geothermal-pool'
                            ? '#64b4ff'
                            : '#f5a623',
                      }}
                    >
                      {place.type === 'geothermal-pool' ? 'pool' : place.type}
                    </span>
                    <span style={{ color: '#8a8f9e', fontSize: 12, marginLeft: 'auto' }}>
                      {place.priceRange}
                    </span>
                    {place.rating != null && (
                      <span style={{ color: '#f5a623', fontSize: 11 }}>★ {place.rating.toFixed(1)}</span>
                    )}
                  </div>

                  {/* Row 2: Name */}
                  <div
                    style={{
                      color: '#ffffff',
                      fontSize: 14,
                      fontWeight: 600,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {place.name}
                  </div>

                  {/* Row 3: Cuisine or opening hours */}
                  {(place.type === 'campsite' || place.type === 'geothermal-pool')
                    ? place.openingHours && (
                        <div style={{ color: '#8a8f9e', fontSize: 11 }}>
                          🕐 {place.openingHours}
                        </div>
                      )
                    : place.cuisine && (
                        <div style={{ color: '#8a8f9e', fontSize: 11, fontStyle: 'italic' }}>
                          {place.cuisine}
                        </div>
                      )
                  }

                  {/* Row 4: Description (2-line clamp) */}
                  <div
                    style={{
                      color: '#6b7280',
                      fontSize: 12,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    } as React.CSSProperties}
                  >
                    {place.description}
                  </div>

                  {/* Row 5: Address */}
                  <div
                    style={{
                      color: '#4b5563',
                      fontSize: 11,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {place.address}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
