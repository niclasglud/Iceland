'use client'

import { useEffect, useRef } from 'react'
import {
  MAPTILER_KEY,
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
  [-18.9, 65.7],
  [-22.9, 63.8],
  [-14.4, 65.3],
  [-24.0, 65.5],
  [-18.0, 66.2],
  [-15.5, 66.1],
]

// Module-level marker store (survives re-renders)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const markersRef = { current: new Map<string, any>() }

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null)
  const sunAzimuthRef = useRef(sunAzimuth)
  const sunAltitudeRef = useRef(sunAltitude)

  sunAzimuthRef.current = sunAzimuth
  sunAltitudeRef.current = sunAltitude

  // ── Initialise MapTiler map ──────────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!mapContainerRef.current) return
    if (mapRef.current) return

    const initMap = async () => {
      const maptilerSdk = await import('@maptiler/sdk')
      await import('@maptiler/sdk/dist/maptiler-sdk.css')

      maptilerSdk.config.apiKey = MAPTILER_KEY

      const map = new maptilerSdk.Map({
        container: mapContainerRef.current!,
        style: maptilerSdk.MapStyle.SATELLITE,
        center: ICELAND_CENTER,
        zoom: ICELAND_ZOOM,
        pitch: ICELAND_PITCH,
        bearing: ICELAND_BEARING,
        attributionControl: false,
        geolocateControl: false,
        navigationControl: false,
        terrainControl: false,
      })

      mapRef.current = map

      map.on('load', () => {
        // 3D terrain via MapTiler terrain-rgb tiles
        map.addSource('maptiler-dem', {
          type: 'raster-dem',
          url: `https://api.maptiler.com/tiles/terrain-rgb/tiles.json?key=${MAPTILER_KEY}`,
          tileSize: 256,
        })
        map.setTerrain({ source: 'maptiler-dem', exaggeration: 1.8 })

        // Atmospheric sky layer (cast required — MapTiler types omit 'sky')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        map.addLayer({
          id: 'sky',
          type: 'sky',
          paint: {
            'sky-type': 'atmosphere',
            'sky-atmosphere-sun': [sunAzimuthRef.current, 90 - sunAltitudeRef.current],
            'sky-atmosphere-sun-intensity': 15,
          },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any)

        // Aurora overlay GeoJSON
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
          },
          layout: { visibility: activeTab === 'aurora' ? 'visible' : 'none' },
        })

        applyLighting(map, sunAzimuthRef.current, sunAltitudeRef.current)
        addMarkers(map, locations, selectedLocation, onLocationSelect, maptilerSdk)
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

  // ── Update sun lighting ──────────────────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current
    if (!map || !map.isStyleLoaded()) return
    if (map.getLayer('sky')) {
      map.setPaintProperty('sky', 'sky-atmosphere-sun', [sunAzimuth, 90 - sunAltitude])
    }
    applyLighting(map, sunAzimuth, sunAltitude)
  }, [scrubTime, sunAzimuth, sunAltitude])

  // ── Aurora overlay visibility ────────────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current
    if (!map || !map.isStyleLoaded()) return
    const vis = activeTab === 'aurora' ? 'visible' : 'none'
    if (map.getLayer('aurora-fill')) map.setLayoutProperty('aurora-fill', 'visibility', vis)
    if (map.getLayer('aurora-stroke')) map.setLayoutProperty('aurora-stroke', 'visibility', vis)
    if (map.getSource('aurora-zones') && activeTab === 'aurora') {
      map.getSource('aurora-zones').setData(buildAuroraGeoJSON(auroraData?.kpIndex ?? 0))
    }
  }, [activeTab, auroraData])

  // ── Fly to selected location ─────────────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current
    if (!map || !selectedLocation) return
    map.flyTo({ center: selectedLocation.coordinates, zoom: 12, pitch: 55, speed: 0.8 })
    markersRef.current.forEach((marker, id) => {
      styleMarkerElement(marker.getElement(), id === selectedLocation.id)
    })
  }, [selectedLocation])

  // ── Re-add markers when locations change ────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current
    if (!map || !map.isStyleLoaded()) return
    const addMarkersAsync = async () => {
      const maptilerSdk = await import('@maptiler/sdk')
      addMarkers(map, locations, selectedLocation, onLocationSelect, maptilerSdk)
    }
    addMarkersAsync()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locations])

  // ── Resize on layout change ──────────────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    setTimeout(() => map.resize(), 100)
  }, [isExpanded])

  return (
    <div className="relative w-full h-full overflow-hidden" style={{ background: '#0a0b0e' }}>
      <div ref={mapContainerRef} className="absolute inset-0" />

      {/* Zoom controls */}
      <div className="absolute flex flex-col gap-1 z-10" style={{ top: 12, right: 12 }}>
        <button
          onClick={() => mapRef.current?.zoomIn()}
          className="flex items-center justify-center text-white font-bold text-lg"
          style={{
            width: 36, height: 36, borderRadius: 8,
            background: 'rgba(18,20,28,0.95)',
            border: '1px solid rgba(255,255,255,0.12)',
          }}
        >+</button>
        <button
          onClick={() => mapRef.current?.zoomOut()}
          className="flex items-center justify-center text-white font-bold text-lg"
          style={{
            width: 36, height: 36, borderRadius: 8,
            background: 'rgba(18,20,28,0.95)',
            border: '1px solid rgba(255,255,255,0.12)',
          }}
        >−</button>
        {/* Compass */}
        <button
          onClick={() => mapRef.current?.resetNorth()}
          className="flex items-center justify-center"
          style={{
            width: 36, height: 36, borderRadius: 8,
            background: 'rgba(18,20,28,0.95)',
            border: '1px solid rgba(255,255,255,0.12)',
          }}
          title="Reset north"
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
        <div
          className="absolute z-10 flex items-center gap-2 px-3 py-1.5"
          style={{
            top: 12, left: 12, borderRadius: 10,
            background: 'rgba(18,20,28,0.95)',
            border: '1px solid rgba(0,255,136,0.3)',
          }}
        >
          <span style={{ color: '#00ff88', fontSize: 11, fontWeight: 600 }}>Aurora</span>
          <span className="font-bold text-sm" style={{ color: kpIndexColor(auroraData.kpIndex) }}>
            Kp {auroraData.kpIndex.toFixed(1)}
          </span>
        </div>
      )}

      {/* Sun bearing indicator */}
      {showSunBearing && (
        <div
          className="absolute pointer-events-none z-10 flex items-center justify-center"
          style={{
            bottom: 24, right: 12, width: 36, height: 36,
            borderRadius: '50%',
            background: 'rgba(18,20,28,0.8)',
            border: '1px solid rgba(245,166,35,0.5)',
          }}
          title={`Sun azimuth: ${Math.round(sunAzimuth)}°`}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" style={{ transform: `rotate(${sunAzimuth}deg)` }}>
            <line x1="10" y1="10" x2="10" y2="2" stroke="#f5a623" strokeWidth="2" strokeLinecap="round" />
            <circle cx="10" cy="10" r="2.5" fill="#f5a623" />
          </svg>
        </div>
      )}
    </div>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function applyLighting(map: any, azimuth: number, altitude: number) {
  const lightColor = altitude > 10 ? '#ffffff' : altitude > 0 ? '#ffd580' : '#334455'
  const intensity = Math.max(0.1, Math.min(1, (altitude + 10) / 70))
  map.setLight({ anchor: 'map', color: lightColor, intensity, position: [1.5, azimuth, 45 - altitude * 0.5] })
}

function styleMarkerElement(el: HTMLElement, isSelected: boolean) {
  el.style.width = isSelected ? '16px' : '12px'
  el.style.height = isSelected ? '16px' : '12px'
  el.style.borderRadius = '50%'
  el.style.boxShadow = isSelected
    ? '0 0 0 3px #f5a623, 0 2px 8px rgba(0,0,0,0.6)'
    : '0 1px 4px rgba(0,0,0,0.5)'
  el.style.border = isSelected ? '2px solid #f5a623' : '1.5px solid rgba(255,255,255,0.3)'
  el.style.zIndex = isSelected ? '10' : '1'
}

function addMarkers(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  map: any,
  locations: Location[],
  selectedLocation: Location | null,
  onLocationSelect: (loc: Location) => void,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sdk: any
) {
  const locationIds = new Set(locations.map((l) => l.id))
  markersRef.current.forEach((marker, id) => {
    if (!locationIds.has(id)) { marker.remove(); markersRef.current.delete(id) }
  })

  locations.forEach((location) => {
    if (markersRef.current.has(location.id)) {
      styleMarkerElement(markersRef.current.get(location.id)!.getElement(), location.id === selectedLocation?.id)
      return
    }

    const color = MARKER_COLORS[location.type as keyof typeof MARKER_COLORS] ?? '#8a8f9e'
    const el = document.createElement('div')
    el.style.background = color
    el.style.cursor = 'pointer'
    el.style.transition = 'all 0.2s ease'
    styleMarkerElement(el, location.id === selectedLocation?.id)
    el.title = location.name
    el.addEventListener('click', (e) => { e.stopPropagation(); onLocationSelect(location) })

    const marker = new sdk.Marker({ element: el, anchor: 'center' })
      .setLngLat(location.coordinates)
      .addTo(map)

    markersRef.current.set(location.id, marker)
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

function kpIndexColor(kp: number): string {
  if (kp >= 7) return '#ef4444'
  if (kp >= 5) return '#f5a623'
  if (kp >= 3) return '#00ff88'
  return '#4a9eff'
}
