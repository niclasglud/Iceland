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
  sunriseAzimuth: number
  sunsetAzimuth: number
  isExpanded: boolean
  activeTab: string
  auroraData?: { kpIndex: number }
  navigationTarget?: Location | null
  routeGeometry?: { type: 'LineString'; coordinates: [number, number][] } | null
  userCoords?: [number, number] | null
  userBearing?: number   // degrees 0-360, direction of travel
  followUser?: boolean   // camera tracks user position in nav mode
  showCloudCover?: boolean
  cloudCover?: number    // 0–100% from weather data
  fRoadFilter?: boolean  // highlight F-road locations
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
  sunriseAzimuth,
  sunsetAzimuth,
  isExpanded,
  activeTab,
  auroraData,
  routeGeometry,
  userCoords,
  userBearing = 0,
  followUser = false,
  showCloudCover = false,
  cloudCover = 0,
  fRoadFilter = false,
}: IcelandMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const userMarkerRef = useRef<maplibregl.Marker | null>(null)
  const [mapError, setMapError] = useState<string | null>(null)
  const [mapReady, setMapReady] = useState(false)
  const [isFollowing, setIsFollowing] = useState(false)

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

        // Sunrise rays source/layer (yellow)
        map.addSource('sunrise-rays', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] },
        })
        map.addLayer({
          id: 'sunrise-rays-layer',
          type: 'line',
          source: 'sunrise-rays',
          paint: {
            'line-color': '#ffd700',
            'line-width': 2,
            'line-opacity': 0.65,
            'line-dasharray': [4, 3],
          },
        })

        // Sunset rays source/layer (orange)
        map.addSource('sunset-rays', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] },
        })
        map.addLayer({
          id: 'sunset-rays-layer',
          type: 'line',
          source: 'sunset-rays',
          paint: {
            'line-color': '#ff7820',
            'line-width': 2,
            'line-opacity': 0.65,
            'line-dasharray': [4, 3],
          },
        })

        // Navigation route source/layers
        map.addSource('nav-route', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] },
        })
        map.addLayer({
          id: 'nav-route-glow',
          type: 'line',
          source: 'nav-route',
          paint: {
            'line-color': '#f5a623',
            'line-width': 8,
            'line-opacity': 0.2,
          },
        })
        map.addLayer({
          id: 'nav-route-line',
          type: 'line',
          source: 'nav-route',
          paint: {
            'line-color': '#f5a623',
            'line-width': 3,
            'line-opacity': 0.85,
            'line-dasharray': [2, 2],
          },
        })

        // Cloud cover GeoJSON overlay — circles at key Iceland points
        map.addSource('cloud-cover', {
          type: 'geojson',
          data: buildCloudGeoJSON(cloudCover),
        })
        map.addLayer({
          id: 'cloud-cover-layer',
          type: 'circle',
          source: 'cloud-cover',
          paint: {
            'circle-radius': 80,
            'circle-color': ['get', 'color'],
            'circle-opacity': ['get', 'opacity'],
            'circle-blur': 1,
          },
          layout: { visibility: 'none' },
        })

        addMarkers(map, locations, selectedLocation, onLocationSelect)
        setMapReady(true)
      })

      // Detect user-initiated panning → exit follow mode
      map.on('dragstart', () => setIsFollowing(false))
      map.on('pitchstart', () => setIsFollowing(false))

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
      userMarkerRef.current?.remove()
      userMarkerRef.current = null
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
      (map.getSource('aurora-zones') as maplibregl.GeoJSONSource).setData(buildAuroraGeoJSON(auroraData?.kpIndex ?? 0))
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

  // ── Reset follow mode when navigation starts/stops ────────────────────────
  useEffect(() => {
    setIsFollowing(followUser)
  }, [followUser])

  // ── Follow user (Google Maps navigation camera) ───────────────────────────
  useEffect(() => {
    const map = mapRef.current
    if (!map || !mapReady || !userCoords || !isFollowing) return

    map.easeTo({
      center: userCoords,
      bearing: userBearing,
      pitch: 60,
      zoom: 15,
      duration: 800,
      easing: (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
    })
  }, [userCoords, userBearing, isFollowing, mapReady])

  // ── Sunrise / Sunset light direction rays ────────────────────────────────
  useEffect(() => {
    const map = mapRef.current
    if (!map || !mapReady) return
    const srcRise = map.getSource('sunrise-rays') as maplibregl.GeoJSONSource | undefined
    const srcSet  = map.getSource('sunset-rays')  as maplibregl.GeoJSONSource | undefined
    if (!srcRise || !srcSet) return

    if (!showSunBearing) {
      srcRise.setData({ type: 'FeatureCollection', features: [] })
      srcSet.setData({ type: 'FeatureCollection', features: [] })
      // Reset all marker styles
      markerStore.forEach((marker) => {
        const el = marker.getElement()
        el.style.opacity = '1'
        el.style.transform = 'scale(1)'
        el.style.boxShadow = ''
      })
      return
    }

    const buildRays = (azimuth: number): GeoJSON.Feature[] => {
      const azRad = (azimuth * Math.PI) / 180
      const rayLength = 0.14
      return locations.map(loc => {
        const [lng, lat] = loc.coordinates
        const dLng = Math.sin(azRad) * rayLength
        const dLat = Math.cos(azRad) * rayLength
        return {
          type: 'Feature' as const,
          properties: {},
          geometry: {
            type: 'LineString' as const,
            coordinates: [
              [lng - dLng * 0.25, lat - dLat * 0.25],
              [lng + dLng, lat + dLat],
            ],
          },
        }
      })
    }

    srcRise.setData({ type: 'FeatureCollection', features: buildRays(sunriseAzimuth) })
    srcSet.setData({ type: 'FeatureCollection', features: buildRays(sunsetAzimuth) })

    // Highlight markers: yellow = sunrise spots, orange = sunset spots
    markerStore.forEach((marker, id) => {
      const loc = locations.find(l => l.id === id)
      if (!loc) return
      const el = marker.getElement()

      const isSunriseSpot = loc.bestLight.includes('sunrise') || loc.bestLight.includes('golden-hour')
      const isSunsetSpot  = loc.bestLight.includes('sunset')

      if (isSunriseSpot) {
        el.style.opacity = '1'
        el.style.transform = 'scale(1.4)'
        el.style.boxShadow = '0 0 12px 5px rgba(255,215,0,0.85)'
      } else if (isSunsetSpot) {
        el.style.opacity = '1'
        el.style.transform = 'scale(1.4)'
        el.style.boxShadow = '0 0 12px 5px rgba(255,120,32,0.85)'
      } else {
        el.style.opacity = '0.3'
        el.style.transform = 'scale(0.8)'
        el.style.boxShadow = ''
      }
    })
  }, [showSunBearing, sunriseAzimuth, sunsetAzimuth, mapReady, locations])

  // ── Cloud cover overlay ───────────────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current
    if (!map || !mapReady) return
    if (map.getLayer('cloud-cover-layer')) {
      map.setLayoutProperty('cloud-cover-layer', 'visibility', showCloudCover ? 'visible' : 'none')
    }
    if (showCloudCover && map.getSource('cloud-cover')) {
      (map.getSource('cloud-cover') as maplibregl.GeoJSONSource).setData(buildCloudGeoJSON(cloudCover))
    }
  }, [showCloudCover, cloudCover, mapReady])

  // ── F-road filter marker highlight ───────────────────────────────────────
  useEffect(() => {
    if (!mapReady) return
    markerStore.forEach((marker, id) => {
      const loc = locations.find((l) => l.id === id)
      if (!loc) return
      const el = marker.getElement()
      if (!fRoadFilter) {
        // Reset to normal (let selected-location styling take over via its own effect)
        el.style.opacity = '1'
        el.style.transform = 'scale(1)'
        el.style.filter = ''
      } else if (loc.fRoad) {
        el.style.opacity = '1'
        el.style.transform = 'scale(1.5)'
        el.style.filter = 'drop-shadow(0 0 6px rgba(245,166,35,0.9))'
      } else {
        el.style.opacity = '0.2'
        el.style.transform = 'scale(0.8)'
        el.style.filter = ''
      }
    })
  }, [fRoadFilter, locations, mapReady])

  // ── Navigation route (road geometry from OSRM) ────────────────────────────
  useEffect(() => {
    const map = mapRef.current
    if (!map || !mapReady) return
    const source = map.getSource('nav-route') as maplibregl.GeoJSONSource | undefined
    if (!source) return

    if (!routeGeometry) {
      source.setData({ type: 'FeatureCollection', features: [] })
      return
    }

    source.setData({
      type: 'FeatureCollection',
      features: [{ type: 'Feature', properties: {}, geometry: routeGeometry }],
    })

    // Fit map to route bounds
    const coords = routeGeometry.coordinates
    const lngs = coords.map((c) => c[0])
    const lats = coords.map((c) => c[1])
    map.fitBounds(
      [[Math.min(...lngs) - 0.1, Math.min(...lats) - 0.05],
       [Math.max(...lngs) + 0.1, Math.max(...lats) + 0.05]],
      { padding: { top: 100, bottom: 180, left: 40, right: 40 }, pitch: 50, duration: 1200 }
    )
  }, [routeGeometry, mapReady])

  // ── User location blue dot ─────────────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current
    if (!map || !mapReady) return

    if (!userCoords) {
      userMarkerRef.current?.remove()
      userMarkerRef.current = null
      return
    }

    if (!userMarkerRef.current) {
      const el = document.createElement('div')
      el.style.cssText = 'width:28px;height:28px;position:relative;display:flex;align-items:center;justify-content:center;'
      el.innerHTML = `
        <svg width="28" height="28" viewBox="0 0 28 28" style="overflow:visible">
          <!-- pulsing halo -->
          <circle cx="14" cy="14" r="12" fill="rgba(74,158,255,0.18)" class="nav-pulse"/>
          <!-- direction cone -->
          <polygon points="14,2 18,11 14,9 10,11" fill="#4a9eff" opacity="0.9" class="nav-cone"/>
          <!-- position dot -->
          <circle cx="14" cy="14" r="7" fill="#4a9eff"/>
          <circle cx="14" cy="14" r="5" fill="white"/>
          <circle cx="14" cy="14" r="3.5" fill="#4a9eff"/>
        </svg>
      `
      el.style.transform = `rotate(${userBearing}deg)`
      userMarkerRef.current = new maplibregl.Marker({ element: el, anchor: 'center' })
        .setLngLat(userCoords)
        .addTo(map)
    } else {
      userMarkerRef.current.setLngLat(userCoords)
      const el = userMarkerRef.current.getElement()
      el.style.transform = `rotate(${userBearing}deg)`
    }
  }, [userCoords, userBearing, mapReady])

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

      {/* Zoom controls — pushed down during navigation so they don't overlap HUD */}
      <div style={{ position: 'absolute', top: followUser ? 'auto' : 12, bottom: followUser ? 80 : 'auto', right: 12, zIndex: 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
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

      {/* Cloud cover badge */}
      {showCloudCover && (
        <div style={{
          position: 'absolute', top: 12, left: activeTab === 'aurora' && auroraData ? 140 : 12, zIndex: 10,
          display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px',
          borderRadius: 10, background: 'rgba(18,20,28,0.95)',
          border: `1px solid ${cloudCover < 30 ? 'rgba(6,182,212,0.4)' : cloudCover < 70 ? 'rgba(139,151,168,0.4)' : 'rgba(71,85,105,0.5)'}`,
        }}>
          <span style={{ fontSize: 13 }}>☁️</span>
          <span style={{ color: '#8a8f9e', fontSize: 11, fontWeight: 600 }}>Cloud</span>
          <span style={{
            fontWeight: 700, fontSize: 14,
            color: cloudCover < 30 ? '#06b6d4' : cloudCover < 70 ? '#94a3b8' : '#64748b',
          }}>
            {Math.round(cloudCover)}%
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

      {/* Re-center button — appears when user pans away during navigation */}
      {followUser && !isFollowing && userCoords && (
        <button
          onClick={() => setIsFollowing(true)}
          style={{
            position: 'absolute', bottom: 80, left: '50%', transform: 'translateX(-50%)',
            zIndex: 20, display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 20px', borderRadius: 99,
            background: 'rgba(10,11,14,0.97)',
            border: '1px solid rgba(255,255,255,0.2)',
            color: '#4a9eff', fontWeight: 700, fontSize: 13, cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
          }}
        >
          {/* Target crosshair */}
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="5" stroke="#4a9eff" strokeWidth="1.5"/>
            <circle cx="8" cy="8" r="2" fill="#4a9eff"/>
            <line x1="8" y1="0" x2="8" y2="4" stroke="#4a9eff" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="8" y1="12" x2="8" y2="16" stroke="#4a9eff" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="0" y1="8" x2="4" y2="8" stroke="#4a9eff" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="12" y1="8" x2="16" y2="8" stroke="#4a9eff" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          Re-center
        </button>
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

// Iceland coverage points for cloud overlay
const CLOUD_POINTS: [number, number][] = [
  [-18.9, 65.0], [-22.5, 64.0], [-14.0, 65.5],
  [-24.0, 65.5], [-17.0, 66.2], [-20.5, 63.8],
  [-13.5, 64.5], [-21.0, 65.5],
]

function buildCloudGeoJSON(cloudCover: number): GeoJSON.FeatureCollection {
  // Color: clear=teal, partial=yellow, overcast=blue-gray
  const color = cloudCover < 30 ? '#06b6d4' : cloudCover < 70 ? '#8b97a8' : '#475569'
  const opacity = 0.08 + (cloudCover / 100) * 0.18

  return {
    type: 'FeatureCollection',
    features: CLOUD_POINTS.map(([lng, lat], i) => ({
      type: 'Feature',
      properties: { color, opacity, id: i },
      geometry: { type: 'Point', coordinates: [lng, lat] },
    })),
  }
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
