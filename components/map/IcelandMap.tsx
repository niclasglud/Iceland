'use client'

import { useEffect, useRef, useState } from 'react'
import * as maplibregl from 'maplibre-gl'
import {
  ICELAND_CENTER,
  ICELAND_ZOOM,
  ICELAND_PITCH,
  ICELAND_BEARING,
  MARKER_COLORS,
} from '@/lib/mapbox-config'
import { Location } from '@/types'

interface IcelandMapProps {
  locations: Location[]
  selectedLocation: Location | null
  onLocationSelect: (location: Location) => void
  scrubTime: Date
  showSunBearing: boolean
  sunAzimuth: number
  sunAltitude: number
  isExpanded: boolean
  activeTab: string
  auroraData?: { kpIndex: number }
}

const AURORA_ZONES: [number, number][] = [
  [-18.9, 65.7], [-22.9, 63.8], [-14.4, 65.3],
  [-24.0, 65.5], [-18.0, 66.2], [-15.5, 66.1],
]

const markerStore = new Map<string, maplibregl.Marker>()

export default function IcelandMap({
  locations,
  selectedLocation,
  onLocationSelect,
  scrubTime,
  showSunBearing,
  sunAzimuth,
  sunAltitude,
  isExpanded,
  activeTab,
  auroraData,
}: IcelandMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const [mapError, setMapError] = useState<string | null>(null)
  const [mapReady, setMapReady] = useState(false)

  // ── Init map ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const init = async () => {
      // Fetch key at runtime from server-side API (avoids NEXT_PUBLIC_ build-time issues)
      let apiKey = ''
      try {
        const res = await fetch('/api/config')
        const data = await res.json()
        apiKey = data.maptilerKey || ''
      } catch {
        // ignore fetch error, will show key-missing error below
      }

      if (!apiKey) {
        setMapError('MapTiler API key missing. Set MAPTILER_KEY in Railway environment variables.')
        return
      }

      try {
      const map = new maplibregl.Map({
        container: containerRef.current!,
        style: `https://api.maptiler.com/maps/satellite/style.json?key=${apiKey}`,
        center: ICELAND_CENTER as [number, number],
        zoom: ICELAND_ZOOM,
        pitch: ICELAND_PITCH,
        bearing: ICELAND_BEARING,
        attributionControl: false,
      })

      mapRef.current = map

      map.on('load', () => {
        // 3-D terrain
        map.addSource('maptiler-dem', {
          type: 'raster-dem',
          url: `https://api.maptiler.com/tiles/terrain-rgb/tiles.json?key=${apiKey}`,
          tileSize: 256,
        })
        map.setTerrain({ source: 'maptiler-dem', exaggeration: 1.8 })

        // Aurora GeoJSON
        map.addSource('aurora-zones', {
          type: 'geojson',
          data: buildAuroraGeoJSON(auroraData?.kpIndex ?? 0),
        })
        map.addLayer({
          id: 'aurora-fill',
          type: 'circle',
          source: 'aurora-zones',
          paint: {
            'circle-radius': 60,
            'circle-color': '#00ff88',
            'circle-opacity': 0.12,
            'circle-blur': 1,
          },
          layout: { visibility: activeTab === 'aurora' ? 'visible' : 'none' },
        })

        addMarkers(map, locations, selectedLocation, onLocationSelect)
        setMapReady(true)
      })

      map.on('error', (e) => {
        console.error('[IcelandMap] error:', e)
        setMapError(`Map error: ${e.error?.message ?? JSON.stringify(e)}`)
      })
    } catch (err) {
      console.error('[IcelandMap] init failed:', err)
      setMapError(`Init failed: ${err instanceof Error ? err.message : String(err)}`)
    }
    } // end init()

    init()

    return () => {
      mapRef.current?.remove()
      mapRef.current = null
      markerStore.clear()
      setMapReady(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Sun lighting ──────────────────────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current
    if (!map || !mapReady) return
const lightColor = sunAltitude > 10 ? '#ffffff' : sunAltitude > 0 ? '#ffd580' : '#334455'
    const intensity = Math.max(0.1, Math.min(1, (sunAltitude + 10) / 70))
    map.setLight({ anchor: 'map', color: lightColor, intensity })
  }, [scrubTime, sunAzimuth, sunAltitude, mapReady])

  // ── Aurora visibility ─────────────────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current
    if (!map || !mapReady) return
    const vis = activeTab === 'aurora' ? 'visible' : 'none'
    if (map.getLayer('aurora-fill')) map.setLayoutProperty('aurora-fill', 'visibility', vis)
    if (map.getSource('aurora-zones') && activeTab === 'aurora') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(map.getSource('aurora-zones') as any).setData(buildAuroraGeoJSON(auroraData?.kpIndex ?? 0))
    }
  }, [activeTab, auroraData, mapReady])

  // ── Fly to selected location ──────────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current
    if (!map || !selectedLocation) return
    map.flyTo({ center: selectedLocation.coordinates as [number, number], zoom: 12, pitch: 55, speed: 0.8 })
    markerStore.forEach((marker, id) => {
      styleMarker(marker.getElement(), id === selectedLocation.id)
    })
  }, [selectedLocation])

  // ── Update markers ────────────────────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current
    if (!map || !mapReady) return
    addMarkers(map, locations, selectedLocation, onLocationSelect)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locations, mapReady])

  // ── Resize ────────────────────────────────────────────────────────────────
  useEffect(() => {
    setTimeout(() => mapRef.current?.resize(), 100)
  }, [isExpanded])

  if (mapError) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-[#0a0b0e] p-6">
        <div className="text-center space-y-3 max-w-sm">
          <div className="text-2xl">⚠️</div>
          <p className="text-red-400 text-sm font-mono break-words">{mapError}</p>
          <p className="text-[#8a8f9e] text-xs">Check Railway env vars: NEXT_PUBLIC_MAPTILER_KEY</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full" style={{ background: '#0a0b0e' }}>
      <div ref={containerRef} style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }} />

      {/* Zoom controls */}
      <div style={{ position: 'absolute', top: 12, right: 12, zIndex: 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
        {[{ label: '+', action: () => mapRef.current?.zoomIn() }, { label: '−', action: () => mapRef.current?.zoomOut() }].map(({ label, action }) => (
          <button
            key={label}
            onClick={action}
            style={{
              width: 36, height: 36, borderRadius: 8,
              background: 'rgba(18,20,28,0.95)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: 'white', fontWeight: 700, fontSize: 18, cursor: 'pointer',
            }}
          >{label}</button>
        ))}
        <button
          onClick={() => mapRef.current?.resetNorth()}
          style={{
            width: 36, height: 36, borderRadius: 8,
            background: 'rgba(18,20,28,0.95)',
            border: '1px solid rgba(255,255,255,0.12)',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18">
            <polygon points="9,2 11.5,9 9,7.5 6.5,9" fill="#f5a623" />
            <polygon points="9,16 11.5,9 9,10.5 6.5,9" fill="#8a8f9e" />
            <circle cx="9" cy="9" r="1.5" fill="white" />
          </svg>
        </button>
      </div>

      {/* Aurora KP badge */}
      {activeTab === 'aurora' && auroraData && (
        <div style={{
          position: 'absolute', top: 12, left: 12, zIndex: 10,
          display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px',
          borderRadius: 10, background: 'rgba(18,20,28,0.95)',
          border: '1px solid rgba(0,255,136,0.3)',
        }}>
          <span style={{ color: '#00ff88', fontSize: 11, fontWeight: 600 }}>Aurora</span>
          <span style={{ color: kpIndexColor(auroraData.kpIndex), fontWeight: 700, fontSize: 14 }}>
            Kp {auroraData.kpIndex.toFixed(1)}
          </span>
        </div>
      )}

      {/* Sun direction indicator */}
      {showSunBearing && (
        <div style={{
          position: 'absolute', bottom: 24, right: 12, zIndex: 10,
          width: 36, height: 36, borderRadius: '50%',
          background: 'rgba(18,20,28,0.8)',
          border: '1px solid rgba(245,166,35,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          pointerEvents: 'none',
        }}>
          <svg width="20" height="20" viewBox="0 0 20 20" style={{ transform: `rotate(${sunAzimuth}deg)` }}>
            <line x1="10" y1="10" x2="10" y2="2" stroke="#f5a623" strokeWidth="2" strokeLinecap="round" />
            <circle cx="10" cy="10" r="2.5" fill="#f5a623" />
          </svg>
        </div>
      )}
    </div>
  )
}

function styleMarker(el: HTMLElement, selected: boolean) {
  el.style.width = selected ? '16px' : '12px'
  el.style.height = selected ? '16px' : '12px'
  el.style.borderRadius = '50%'
  el.style.border = selected ? '2px solid #f5a623' : '1.5px solid rgba(255,255,255,0.3)'
  el.style.boxShadow = selected ? '0 0 0 3px #f5a623, 0 2px 8px rgba(0,0,0,0.6)' : '0 1px 4px rgba(0,0,0,0.5)'
  el.style.zIndex = selected ? '10' : '1'
}

function addMarkers(
  map: maplibregl.Map,
  locations: Location[],
  selectedLocation: Location | null,
  onSelect: (loc: Location) => void
) {
  const ids = new Set(locations.map((l) => l.id))
  markerStore.forEach((m, id) => { if (!ids.has(id)) { m.remove(); markerStore.delete(id) } })

  locations.forEach((loc) => {
    if (markerStore.has(loc.id)) {
      styleMarker(markerStore.get(loc.id)!.getElement(), loc.id === selectedLocation?.id)
      return
    }
    const color = MARKER_COLORS[loc.type as keyof typeof MARKER_COLORS] ?? '#8a8f9e'
    const el = document.createElement('div')
    el.style.background = color
    el.style.cursor = 'pointer'
    styleMarker(el, loc.id === selectedLocation?.id)
    el.addEventListener('click', (e) => { e.stopPropagation(); onSelect(loc) })
    const marker = new maplibregl.Marker({ element: el, anchor: 'center' })
      .setLngLat(loc.coordinates as [number, number])
      .addTo(map)
    markerStore.set(loc.id, marker)
  })
}

function buildAuroraGeoJSON(kpIndex: number): GeoJSON.FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: AURORA_ZONES.map(([lng, lat], i) => ({
      type: 'Feature',
      properties: { kp: kpIndex, id: i },
      geometry: { type: 'Point', coordinates: [lng, lat] },
    })),
  }
}

function kpIndexColor(kp: number) {
  if (kp >= 7) return '#ef4444'
  if (kp >= 5) return '#f5a623'
  if (kp >= 3) return '#00ff88'
  return '#4a9eff'
}
