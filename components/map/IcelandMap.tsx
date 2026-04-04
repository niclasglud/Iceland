'use client'

import { useEffect, useRef } from 'react'
import {
  MAPBOX_TOKEN,
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

// Aurora viewing zones across Iceland (lng, lat)
const AURORA_ZONES: [number, number][] = [
  [-18.9, 65.7],  // Central highlands
  [-22.9, 63.8],  // Reykjanes
  [-14.4, 65.3],  // East fjords
  [-24.0, 65.5],  // Westfjords south
  [-18.0, 66.2],  // North central
  [-15.5, 66.1],  // Northeast
]

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
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const markersRef = useRef<Map<string, mapboxgl.Marker>>(new Map())
  const sunAzimuthRef = useRef(sunAzimuth)
  const sunAltitudeRef = useRef(sunAltitude)

  // Keep sun refs current without re-initialising map
  sunAzimuthRef.current = sunAzimuth
  sunAltitudeRef.current = sunAltitude

  // ── Initialise map ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!mapContainerRef.current) return
    if (mapRef.current) return // already initialised

    const initMap = async () => {
      const mapboxgl = (await import('mapbox-gl')).default
      // CSS loaded via CDN in layout.tsx

      mapboxgl.accessToken = MAPBOX_TOKEN

      const map = new mapboxgl.Map({
        container: mapContainerRef.current!,
        style: 'mapbox://styles/mapbox/satellite-streets-v12',
        center: ICELAND_CENTER,
        zoom: ICELAND_ZOOM,
        pitch: ICELAND_PITCH,
        bearing: ICELAND_BEARING,
        antialias: true,
        attributionControl: false,
      })

      mapRef.current = map

      map.on('style.load', () => {
        // 3D terrain
        map.addSource('mapbox-dem', {
          type: 'raster-dem',
          url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
          tileSize: 512,
          maxzoom: 14,
        })
        map.setTerrain({ source: 'mapbox-dem', exaggeration: 1.8 })

        // Atmospheric sky
        map.addLayer({
          id: 'sky',
          type: 'sky',
          paint: {
            'sky-type': 'atmosphere',
            'sky-atmosphere-sun': [sunAzimuthRef.current, 90 - sunAltitudeRef.current],
            'sky-atmosphere-sun-intensity': 15,
          } as mapboxgl.SkyPaint,
        })

        // Aurora overlay source (always added; toggled by visibility)
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
          layout: {
            visibility: activeTab === 'aurora' ? 'visible' : 'none',
          },
        })
        map.addLayer({
          id: 'aurora-stroke',
          type: 'circle',
          source: 'aurora-zones',
          paint: {
            'circle-radius': 60,
            'circle-color': 'transparent',
            'circle-stroke-width': 1.5,
            'circle-stroke-color': '#00ff88',
            'circle-stroke-opacity': 0.3,
            'circle-blur': 0,
          },
          layout: {
            visibility: activeTab === 'aurora' ? 'visible' : 'none',
          },
        })

        // Apply initial lighting
        applyLighting(map, sunAzimuthRef.current, sunAltitudeRef.current)

        // Add location markers
        addMarkers(map, locations, selectedLocation, onLocationSelect, mapboxgl)
      })
    }

    initMap()

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
        markersRef.current.clear()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Update sun / lighting when scrubTime changes ─────────────────────────────
  useEffect(() => {
    const map = mapRef.current
    if (!map || !map.isStyleLoaded()) return

    if (map.getLayer('sky')) {
      map.setPaintProperty('sky', 'sky-atmosphere-sun', [
        sunAzimuth,
        90 - sunAltitude,
      ])
    }
    applyLighting(map, sunAzimuth, sunAltitude)
  }, [scrubTime, sunAzimuth, sunAltitude])

  // ── Update aurora overlay visibility ─────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current
    if (!map || !map.isStyleLoaded()) return

    const vis = activeTab === 'aurora' ? 'visible' : 'none'
    if (map.getLayer('aurora-fill')) map.setLayoutProperty('aurora-fill', 'visibility', vis)
    if (map.getLayer('aurora-stroke')) map.setLayoutProperty('aurora-stroke', 'visibility', vis)

    // Update GeoJSON data with current KP index
    if (map.getSource('aurora-zones') && activeTab === 'aurora') {
      const src = map.getSource('aurora-zones') as mapboxgl.GeoJSONSource
      src.setData(buildAuroraGeoJSON(auroraData?.kpIndex ?? 0))
    }
  }, [activeTab, auroraData])

  // ── Fly to selected location ──────────────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current
    if (!map || !selectedLocation) return

    map.flyTo({
      center: selectedLocation.coordinates,
      zoom: 12,
      pitch: 55,
      speed: 0.8,
    })

    // Update marker visual states
    markersRef.current.forEach((marker, id) => {
      const el = marker.getElement()
      const isSelected = id === selectedLocation.id
      styleMarkerElement(el, isSelected)
    })
  }, [selectedLocation])

  // ── Re-add markers when locations list changes ────────────────────────────────
  useEffect(() => {
    const map = mapRef.current
    if (!map || !map.isStyleLoaded()) return

    const addMarkersAsync = async () => {
      const mapboxgl = (await import('mapbox-gl')).default
      addMarkers(map, locations, selectedLocation, onLocationSelect, mapboxgl)
    }
    addMarkersAsync()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locations])

  // ── Resize map when container dimensions change ───────────────────────────────
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    setTimeout(() => map.resize(), 100)
  }, [isExpanded])

  return (
    <div className="relative w-full h-full overflow-hidden" style={{ background: '#0a0b0e' }}>
      {/* Mapbox canvas container */}
      <div ref={mapContainerRef} className="absolute inset-0" />

      {/* Custom zoom controls – top right */}
      <div
        className="absolute flex flex-col gap-1 z-10"
        style={{ top: 72, right: 12 }}
      >
        <button
          onClick={() => mapRef.current?.zoomIn()}
          className="flex items-center justify-center text-white font-bold text-lg transition-colors"
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: 'rgba(18,20,28,0.95)',
            border: '1px solid rgba(255,255,255,0.12)',
          }}
          aria-label="Zoom in"
        >
          +
        </button>
        <button
          onClick={() => mapRef.current?.zoomOut()}
          className="flex items-center justify-center text-white font-bold text-lg transition-colors"
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: 'rgba(18,20,28,0.95)',
            border: '1px solid rgba(255,255,255,0.12)',
          }}
          aria-label="Zoom out"
        >
          −
        </button>
      </div>

      {/* Compass – top right below zoom */}
      <div
        className="absolute flex items-center justify-center z-10"
        style={{
          top: 146,
          right: 12,
          width: 32,
          height: 32,
          borderRadius: 8,
          background: 'rgba(18,20,28,0.95)',
          border: '1px solid rgba(255,255,255,0.12)',
        }}
        title="Compass: North is up"
      >
        <svg width="18" height="18" viewBox="0 0 18 18">
          <polygon points="9,2 11.5,9 9,7.5 6.5,9" fill="#f5a623" />
          <polygon points="9,16 11.5,9 9,10.5 6.5,9" fill="#8a8f9e" />
          <circle cx="9" cy="9" r="1.5" fill="white" />
        </svg>
      </div>

      {/* Full-screen toggle – bottom left */}
      <button
        onClick={() => {
          // Signal to parent via a custom DOM event; parent wires isExpanded toggle
          mapContainerRef.current?.dispatchEvent(
            new CustomEvent('map-toggle-expand', { bubbles: true })
          )
        }}
        className="absolute z-10 flex items-center gap-1.5 font-semibold transition-all active:scale-95"
        style={{
          bottom: 24,
          left: 12,
          height: 30,
          padding: '0 14px',
          borderRadius: 999,
          background: '#f5a623',
          color: '#0a0b0e',
          fontSize: 12,
          boxShadow: '0 2px 12px rgba(245,166,35,0.4)',
        }}
        aria-label={isExpanded ? 'Collapse map' : 'Expand map'}
      >
        <span>{isExpanded ? '⊙ Collapse Map' : '⛶ Full Screen'}</span>
      </button>

      {/* Aurora KP badge – visible when aurora tab active */}
      {activeTab === 'aurora' && auroraData && (
        <div
          className="absolute z-10 flex items-center gap-2 px-3 py-1.5"
          style={{
            top: 72,
            left: 12,
            borderRadius: 10,
            background: 'rgba(18,20,28,0.95)',
            border: '1px solid rgba(0,255,136,0.3)',
          }}
        >
          <span style={{ color: '#00ff88', fontSize: 11, fontWeight: 600 }}>Aurora</span>
          <span
            className="font-bold text-sm"
            style={{ color: kpIndexColor(auroraData.kpIndex) }}
          >
            Kp {auroraData.kpIndex.toFixed(1)}
          </span>
        </div>
      )}

      {/* Sun bearing line (when enabled) */}
      {showSunBearing && (
        <div
          className="absolute pointer-events-none z-10"
          style={{
            bottom: 24,
            right: 12,
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: 'rgba(18,20,28,0.8)',
            border: '1px solid rgba(245,166,35,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          title={`Sun azimuth: ${Math.round(sunAzimuth)}°`}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            style={{ transform: `rotate(${sunAzimuth}deg)` }}
          >
            <line x1="10" y1="10" x2="10" y2="2" stroke="#f5a623" strokeWidth="2" strokeLinecap="round" />
            <circle cx="10" cy="10" r="2.5" fill="#f5a623" />
          </svg>
        </div>
      )}
    </div>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function applyLighting(map: mapboxgl.Map, azimuth: number, altitude: number) {
  const lightColor =
    altitude > 10 ? '#ffffff' : altitude > 0 ? '#ffd580' : '#334455'
  const intensity = Math.max(0.1, Math.min(1, (altitude + 10) / 70))

  map.setLight({
    anchor: 'map',
    color: lightColor,
    intensity,
    position: [1.5, azimuth, 45 - altitude * 0.5],
  })
}

function styleMarkerElement(el: HTMLElement, isSelected: boolean) {
  el.style.width = isSelected ? '16px' : '12px'
  el.style.height = isSelected ? '16px' : '12px'
  el.style.borderRadius = '50%'
  el.style.boxShadow = isSelected
    ? '0 0 0 3px #f5a623, 0 2px 8px rgba(0,0,0,0.6)'
    : '0 1px 4px rgba(0,0,0,0.5)'
  el.style.transform = isSelected ? 'scale(1.25)' : 'scale(1)'
  el.style.zIndex = isSelected ? '10' : '1'
  el.style.border = isSelected ? '2px solid #f5a623' : '1.5px solid rgba(255,255,255,0.3)'
}

function addMarkers(
  map: mapboxgl.Map,
  locations: Location[],
  selectedLocation: Location | null,
  onLocationSelect: (loc: Location) => void,
  mapboxgl: typeof import('mapbox-gl').default
) {
  // Remove stale markers that are no longer in locations
  const locationIds = new Set(locations.map((l) => l.id))
  markersRef.current.forEach((marker, id) => {
    if (!locationIds.has(id)) {
      marker.remove()
      markersRef.current.delete(id)
    }
  })

  locations.forEach((location) => {
    if (markersRef.current.has(location.id)) {
      // Update selection state for existing marker
      const existing = markersRef.current.get(location.id)!
      styleMarkerElement(existing.getElement(), location.id === selectedLocation?.id)
      return
    }

    const color = MARKER_COLORS[location.type as keyof typeof MARKER_COLORS] ?? '#8a8f9e'
    const isSelected = location.id === selectedLocation?.id

    const el = document.createElement('div')
    el.style.background = color
    el.style.cursor = 'pointer'
    el.style.transition = 'all 0.2s ease'
    styleMarkerElement(el, isSelected)

    el.addEventListener('click', (e) => {
      e.stopPropagation()
      onLocationSelect(location)
    })

    // Tooltip on hover
    el.title = location.name

    const marker = new mapboxgl.Marker({ element: el, anchor: 'center' })
      .setLngLat(location.coordinates)
      .addTo(map)

    markersRef.current.set(location.id, marker)
  })
}

// Keep the ref accessible inside the module
const markersRef = { current: new Map<string, mapboxgl.Marker>() }

function buildAuroraGeoJSON(kpIndex: number): GeoJSON.FeatureCollection {
  // Scale opacity / size by KP index (0–9)
  const scale = Math.max(0.3, kpIndex / 9)
  return {
    type: 'FeatureCollection',
    features: AURORA_ZONES.map(([lng, lat], i) => ({
      type: 'Feature',
      properties: { kp: kpIndex, scale, id: i },
      geometry: { type: 'Point', coordinates: [lng, lat] },
    })),
  }
}

function kpIndexColor(kp: number): string {
  if (kp >= 7) return '#ef4444'
  if (kp >= 5) return '#f5a623'
  if (kp >= 3) return '#00ff88'
  return '#4a9eff'
}
