'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { ActiveTab, Location, AuroraData, WeatherData, SunInfo, MoonInfo, RouteData } from '@/types'
import { getSunInfo, getMoonInfo, ICELAND_CENTER } from '@/lib/suncalc-utils'
import { getMockAuroraData } from '@/lib/aurora'
import { getMockWeatherData } from '@/lib/weather'
import { getBestSpotsToday } from '@/lib/spot-scoring'
import { locations } from '@/data/locations'
import TopNav from '@/components/layout/TopNav'
import BottomPanel from '@/components/layout/BottomPanel'
import ToolsDrawer from '@/components/layout/ToolsDrawer'
import SpotsList from '@/components/spots/SpotsList'
import SpotDetail from '@/components/spots/SpotDetail'
import AuroraBar from '@/components/aurora/AuroraBar'
import ItinerariesList from '@/components/itineraries/ItinerariesList'
import ItineraryDetail from '@/components/itineraries/ItineraryDetail'
import SafetyPanel from '@/components/safety/SafetyPanel'
import WildlifeCalendar from '@/components/wildlife/WildlifeCalendar'
import TripPlanner from '@/components/planner/TripPlanner'
import { itineraries } from '@/data/itineraries'
import { loadTrip, saveTrip, generateStopId } from '@/data/custom-trip'
import type { CustomTripStop } from '@/types'

// Dynamically import Mapbox component (no SSR)
const IcelandMap = dynamic(() => import('@/components/map/IcelandMap'), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center bg-[#0a0b0e]">
      <div className="text-center space-y-3">
        <div className="w-12 h-12 rounded-full border-2 border-[#f5a623] border-t-transparent animate-spin mx-auto" />
        <p className="text-[#8a8f9e] text-sm">Loading 3D Map…</p>
      </div>
    </div>
  ),
})

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('map')
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
  const [scrubTime, setScrubTime] = useState(new Date())
  const [isToolsOpen, setIsToolsOpen] = useState(false)
  const [typeFilter, setTypeFilter] = useState('all')
  const [lightFilter, setLightFilter] = useState('all')
  const [showSunBearing, setShowSunBearing] = useState(false)
  const [showCloudCover, setShowCloudCover] = useState(false)
  const [fRoadFilter, setFRoadFilter] = useState(false)
  const [isNightMode, setIsNightMode] = useState(false)
  const [detailLocation, setDetailLocation] = useState<Location | null>(null)
  const [selectedWeatherDay, setSelectedWeatherDay] = useState<number | null>(null)
  const [navigationTarget, setNavigationTarget] = useState<Location | null>(null)
  const [navigationFrom, setNavigationFrom] = useState<Location | null>(null)
  const [routeData, setRouteData] = useState<RouteData | null>(null)
  const [routeLoading, setRouteLoading] = useState(false)
  const [userCoords, setUserCoords] = useState<[number, number] | null>(null)
  const watchIdRef = useRef<number | null>(null)

  // Bearing from user to next route step (for vehicle marker direction)
  const userBearing = useMemo(() => {
    if (!userCoords || !routeData?.steps?.length) return 0
    const next = routeData.steps.find(s => s.maneuver !== 'depart' && haversineMeters(userCoords, s.location) > 30)
    if (!next) return 0
    const [fx, fy] = userCoords, [tx, ty] = next.location
    const lat1 = fy * Math.PI / 180, lat2 = ty * Math.PI / 180
    const dLng = (tx - fx) * Math.PI / 180
    return (Math.atan2(Math.sin(dLng) * Math.cos(lat2), Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng)) * 180 / Math.PI + 360) % 360
  }, [userCoords, routeData])

  const [sunInfo, setSunInfo] = useState<SunInfo>(() =>
    getSunInfo(new Date(), ICELAND_CENTER[0], ICELAND_CENTER[1])
  )
  const [moonInfo, setMoonInfo] = useState<MoonInfo>(() =>
    getMoonInfo(new Date(), ICELAND_CENTER[0], ICELAND_CENTER[1])
  )
  const [auroraData, setAuroraData] = useState<AuroraData>(getMockAuroraData())
  const [weather, setWeather] = useState<WeatherData>(getMockWeatherData())
  const [selectedItineraryId, setSelectedItineraryId] = useState<string | null>(null)
  const [planStops, setPlanStops] = useState<CustomTripStop[]>(() => loadTrip())

  const bestSpotsToday = useMemo(
    () => getBestSpotsToday(locations, weather, sunInfo, auroraData, 5),
    [weather, sunInfo, auroraData]
  )

  // Update sun/moon info when scrub time or selected location changes
  useEffect(() => {
    const coords = selectedLocation?.coordinates ?? ICELAND_CENTER
    setSunInfo(getSunInfo(scrubTime, coords[0], coords[1]))
    setMoonInfo(getMoonInfo(scrubTime, coords[0], coords[1]))
  }, [scrubTime, selectedLocation])

  // Auto-update current time every minute
  useEffect(() => {
    const interval = setInterval(() => setScrubTime(new Date()), 60000)
    return () => clearInterval(interval)
  }, [])

  // Fetch aurora data
  useEffect(() => {
    fetch('/api/aurora')
      .then((r) => r.json())
      .then(setAuroraData)
      .catch(() => setAuroraData(getMockAuroraData()))
  }, [])

  // Fetch weather
  useEffect(() => {
    const coords = selectedLocation?.coordinates ?? ICELAND_CENTER
    fetch(`/api/weather?lat=${coords[1]}&lng=${coords[0]}`)
      .then((r) => r.json())
      .then(setWeather)
      .catch(() => setWeather(getMockWeatherData(coords[1], coords[0])))
  }, [selectedLocation])

  // Fetch real road route when navigationTarget/From changes
  useEffect(() => {
    if (!navigationTarget) {
      setRouteData(null)
      setUserCoords(null)
      if (watchIdRef.current != null) {
        navigator.geolocation?.clearWatch(watchIdRef.current)
        watchIdRef.current = null
      }
      return
    }

    setRouteLoading(true)
    const [toLng, toLat] = navigationTarget.coordinates

    const fetchRoute = (fromLng: number, fromLat: number) => {
      fetch(`/api/route?fromLng=${fromLng}&fromLat=${fromLat}&toLng=${toLng}&toLat=${toLat}`)
        .then((r) => r.json())
        .then((data: RouteData) => { if (data.geometry) setRouteData(data) })
        .catch(console.error)
        .finally(() => setRouteLoading(false))
    }

    // If user picked a manual start location, use it directly (no GPS watch)
    if (navigationFrom) {
      const [fLng, fLat] = navigationFrom.coordinates
      setUserCoords([fLng, fLat])
      fetchRoute(fLng, fLat)
      return
    }

    // Otherwise track GPS
    if (navigator.geolocation) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          const coords: [number, number] = [pos.coords.longitude, pos.coords.latitude]
          setUserCoords(coords)
          fetchRoute(coords[0], coords[1])
        },
        () => {
          // GPS denied — fall back to Reykjavik
          const reykjavik: [number, number] = [-21.9426, 64.1355]
          setUserCoords(reykjavik)
          fetchRoute(reykjavik[0], reykjavik[1])
          setRouteLoading(false)
        },
        { enableHighAccuracy: true, maximumAge: 30000 }
      )
    } else {
      const reykjavik: [number, number] = [-21.9426, 64.1355]
      setUserCoords(reykjavik)
      fetchRoute(reykjavik[0], reykjavik[1])
    }

    return () => {
      if (watchIdRef.current != null) {
        navigator.geolocation?.clearWatch(watchIdRef.current)
        watchIdRef.current = null
      }
    }
  }, [navigationTarget, navigationFrom])

  const handleLocationSelect = useCallback(
    (location: Location) => {
      setSelectedLocation(location)
      setDetailLocation(location)
    },
    []
  )

  const handleCloseDetail = useCallback(() => setDetailLocation(null), [])

  const handleAddToTrip = useCallback((location: Location) => {
    setPlanStops((prev) => {
      // Determine which day to add to (last day used, or day 1)
      const lastDay = prev.length > 0 ? Math.max(...prev.map((s) => s.day)) : 1
      const day = prev.length === 0 ? 1 : lastDay
      const newStop: CustomTripStop = {
        id: generateStopId(),
        locationId: location.id,
        name: location.name,
        thumbnail: location.thumbnail,
        coordinates: location.coordinates,
        region: location.region,
        type: location.type,
        day,
      }
      // Auto-calculate drive time from previous stop in same day (fire-and-forget)
      const prevInDay = prev.filter((s) => s.day === day)
      if (prevInDay.length > 0) {
        const last = prevInDay[prevInDay.length - 1]
        const [fromLng, fromLat] = last.coordinates
        const [toLng, toLat] = location.coordinates
        fetch(`/api/route?fromLng=${fromLng}&fromLat=${fromLat}&toLng=${toLng}&toLat=${toLat}`)
          .then((r) => r.json())
          .then((data) => {
            if (data?.distance && data?.duration) {
              setPlanStops((cur) => {
                const updated = cur.map((s) =>
                  s.id === newStop.id
                    ? { ...s, driveFromPrev: { km: Math.round(data.distance / 1000), minutes: Math.round(data.duration / 60) } }
                    : s
                )
                saveTrip(updated)
                return updated
              })
            }
          })
          .catch(() => {})
      }
      const updated = [...prev, newStop]
      saveTrip(updated)
      return updated
    })
  }, [])

  const handleViewOnMap = useCallback(() => {
    setDetailLocation(null)
    setActiveTab('map')
  }, [])

  const showMap = ['map', 'compass'].includes(activeTab)
  const showSpots = activeTab === 'spots'
  const elevationBadge = selectedLocation?.elevation
    ? `▲ ${selectedLocation.elevation.toLocaleString()}m est.`
    : null

  return (
    <div className="flex flex-col h-[100dvh] w-screen overflow-hidden bg-[#0a0b0e] select-none safe-pt">
      {/* Hide top nav during navigation for full-screen map */}
      {!navigationTarget && (
        <TopNav
          activeTab={activeTab}
          onTabChange={setActiveTab}
          selectedLocation={selectedLocation}
          onMenuClick={() => setIsToolsOpen(true)}
          onToolsClick={() => setIsToolsOpen(true)}
        />
      )}

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Spots Panel */}
        {showSpots && (
          <div className="flex flex-col overflow-hidden w-full">
            <SpotsList
              locations={locations}
              selectedLocation={selectedLocation}
              onLocationSelect={handleLocationSelect}
              isExpanded={true}
              onExpandToggle={() => setActiveTab('map')}
              typeFilter={typeFilter}
              lightFilter={lightFilter}
              onTypeFilterChange={setTypeFilter}
              onLightFilterChange={setLightFilter}
              fRoadFilter={fRoadFilter}
              onFRoadFilterChange={setFRoadFilter}
              featuredSpots={bestSpotsToday}
              onAddToTrip={handleAddToTrip}
            />
          </div>
        )}

        {/* Map Panel */}
        {showMap && (
          <div className="relative flex-1 overflow-hidden">
            <IcelandMap
              locations={locations}
              selectedLocation={selectedLocation}
              onLocationSelect={handleLocationSelect}
              scrubTime={scrubTime}
              showSunBearing={showSunBearing}
              sunAzimuth={sunInfo.azimuth}
              sunAltitude={sunInfo.altitude}
              sunriseAzimuth={sunInfo.sunriseAzimuth}
              sunsetAzimuth={sunInfo.sunsetAzimuth}
              isExpanded={true}
              activeTab={activeTab}
              auroraData={auroraData}
              navigationTarget={navigationTarget}
              routeGeometry={routeData?.geometry ?? null}
              userCoords={userCoords}
              userBearing={userBearing}
              followUser={!!navigationTarget}
              showCloudCover={showCloudCover}
              cloudCover={weather.cloudCover}
              fRoadFilter={fRoadFilter}
            />

            {/* Navigation HUD */}
            {navigationTarget && (
              <NavigationHUD
                target={navigationTarget}
                routeData={routeData}
                loading={routeLoading}
                userCoords={userCoords}
                onClose={() => {
                  setNavigationTarget(null)
                  setNavigationFrom(null)
                  setRouteData(null)
                }}
              />
            )}

            {/* Elevation badge */}
            {elevationBadge && (
              <div className="absolute bottom-4 right-4 flex items-center gap-1 px-3 py-1.5 rounded-full bg-black/70 border border-white/10 text-white text-xs font-medium z-10">
                {elevationBadge}
              </div>
            )}
          </div>
        )}

        {/* Itineraries Panel */}
        {activeTab === 'itineraries' && (
          <div className="flex-1 overflow-hidden flex flex-col">
            {selectedItineraryId ? (() => {
              const it = itineraries.find(i => i.id === selectedItineraryId)
              return it ? (
                <ItineraryDetail itinerary={it} onBack={() => setSelectedItineraryId(null)} />
              ) : null
            })() : (
              <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
                <ItinerariesList onSelect={(id) => setSelectedItineraryId(id)} />
              </div>
            )}
          </div>
        )}

        {/* Aurora Panel */}
        {activeTab === 'aurora' && (
          <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
            <AuroraBar
              kpIndex={auroraData.kpIndex}
              probability={auroraData.probability}
              bestViewingTime={auroraData.bestViewingTime}
              cloudCover={auroraData.cloudCover ?? 20}
              forecast={auroraData.kpForecast}
              dataSource={auroraData.dataSource}
              onViewMap={() => setActiveTab('map')}
            />
          </div>
        )}

        {/* Weather Panel */}
        {activeTab === 'weather' && (
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            <WeatherPanel sunInfo={sunInfo} />
          </div>
        )}

        {/* Compass overlay */}
        {activeTab === 'compass' && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-auto z-20">
            <CompassDisplay sunAzimuth={sunInfo.azimuth} />
          </div>
        )}

        {/* Safety Panel */}
        {activeTab === 'safety' && (
          <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
            <SafetyPanel />
          </div>
        )}

        {/* Wildlife Panel */}
        {activeTab === 'wildlife' && (
          <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
            <WildlifeCalendar />
          </div>
        )}

        {/* Trip Planner Panel */}
        {activeTab === 'plan' && (
          <div className="flex-1 overflow-hidden flex flex-col">
            <TripPlanner
              stops={planStops}
              onStopsChange={setPlanStops}
              onSwitchToSpots={() => setActiveTab('spots')}
            />
          </div>
        )}
      </div>

      {/* Hide bottom panel during navigation or on spots tab (more room for spots) */}
      {!navigationTarget && activeTab !== 'spots' && (
        <BottomPanel
          sunInfo={sunInfo}
          moonInfo={moonInfo}
          weather={weather}
          scrubTime={scrubTime}
          onScrub={(d) => setScrubTime(d)}
          isNightMode={isNightMode}
          onNightModeToggle={() => setIsNightMode((v) => !v)}
          onDaySelect={(idx) => setSelectedWeatherDay(idx < 0 ? null : idx)}
          selectedDayIndex={selectedWeatherDay}
        />
      )}

      {/* Full-screen spot detail overlay */}
      {detailLocation && (
        <SpotDetail
          location={detailLocation}
          onClose={handleCloseDetail}
          onViewOnMap={handleViewOnMap}
          onNavigate={(loc) => {
            setNavigationTarget(loc)
            setActiveTab('map')
            setDetailLocation(null)
          }}
          onAddToTrip={(loc) => {
            handleAddToTrip(loc)
            handleCloseDetail()
          }}
        />
      )}

      <ToolsDrawer
        isOpen={isToolsOpen}
        onClose={() => setIsToolsOpen(false)}
        sunInfo={sunInfo}
        auroraData={auroraData}
        weather={weather}
        locations={locations}
        selectedLocation={selectedLocation}
        onShowSunBearing={(v: boolean) => {
          setShowSunBearing(v)
          if (v) {
            setActiveTab('map')
            setIsToolsOpen(false)
          }
        }}
        showSunBearing={showSunBearing}
        onShowCloudCover={(v: boolean) => {
          setShowCloudCover(v)
          if (v) {
            setActiveTab('map')
            setIsToolsOpen(false)
          }
        }}
        showCloudCover={showCloudCover}
        onNavigate={(dest, fromLoc) => {
          setNavigationTarget(dest)
          setNavigationFrom(fromLoc ?? null)
          setActiveTab('map')
          setIsToolsOpen(false)
        }}
      />
    </div>
  )
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function haversineMeters(a: [number, number], b: [number, number]): number {
  const R = 6371000
  const lat1 = (a[1] * Math.PI) / 180
  const lat2 = (b[1] * Math.PI) / 180
  const dLat = lat2 - lat1
  const dLng = ((b[0] - a[0]) * Math.PI) / 180
  return R * 2 * Math.asin(Math.sqrt(Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2))
}

function fmtDist(m: number): string {
  if (m < 1000) return `${Math.round(m)} m`
  return `${(m / 1000).toFixed(1)} km`
}

function fmtDuration(s: number): string {
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  if (h > 0) return `${h}h ${m}m`
  return `${m} min`
}

function ManeuverArrow({ maneuver, size = 32 }: { maneuver: string; size?: number }) {
  const c = '#f5a623'
  if (maneuver === 'arrive') {
    return (
      <svg width={size} height={size} viewBox="0 0 32 32">
        <circle cx="16" cy="16" r="7" fill={c} />
        <circle cx="16" cy="16" r="11" fill="none" stroke={c} strokeWidth="2" />
      </svg>
    )
  }
  if (maneuver === 'u-turn') {
    return (
      <svg width={size} height={size} viewBox="0 0 32 32">
        <path d="M10 24 L10 12 Q10 6 16 6 Q22 6 22 12 L22 16" fill="none" stroke={c} strokeWidth="3" strokeLinecap="round" />
        <polygon points="22,22 18,14 26,14" fill={c} />
      </svg>
    )
  }
  if (maneuver === 'turn-left' || maneuver === 'turn-sharp-left') {
    return (
      <svg width={size} height={size} viewBox="0 0 32 32">
        <path d="M22 26 L22 16 Q22 10 16 10 L10 10" fill="none" stroke={c} strokeWidth="3" strokeLinecap="round" />
        <polygon points="6,10 14,6 14,14" fill={c} />
      </svg>
    )
  }
  if (maneuver === 'turn-right' || maneuver === 'turn-sharp-right') {
    return (
      <svg width={size} height={size} viewBox="0 0 32 32">
        <path d="M10 26 L10 16 Q10 10 16 10 L22 10" fill="none" stroke={c} strokeWidth="3" strokeLinecap="round" />
        <polygon points="26,10 18,6 18,14" fill={c} />
      </svg>
    )
  }
  if (maneuver === 'turn-slight-left') {
    return (
      <svg width={size} height={size} viewBox="0 0 32 32">
        <path d="M20 26 L20 18 Q20 10 12 10" fill="none" stroke={c} strokeWidth="3" strokeLinecap="round" />
        <polygon points="8,10 16,6 16,14" fill={c} />
      </svg>
    )
  }
  if (maneuver === 'turn-slight-right') {
    return (
      <svg width={size} height={size} viewBox="0 0 32 32">
        <path d="M12 26 L12 18 Q12 10 20 10" fill="none" stroke={c} strokeWidth="3" strokeLinecap="round" />
        <polygon points="24,10 16,6 16,14" fill={c} />
      </svg>
    )
  }
  if (maneuver === 'roundabout') {
    return (
      <svg width={size} height={size} viewBox="0 0 32 32">
        <circle cx="16" cy="16" r="7" fill="none" stroke={c} strokeWidth="2.5" />
        <polygon points="16,4 20,10 12,10" fill={c} />
      </svg>
    )
  }
  // straight / depart / default
  return (
    <svg width={size} height={size} viewBox="0 0 32 32">
      <line x1="16" y1="26" x2="16" y2="8" stroke={c} strokeWidth="3" strokeLinecap="round" />
      <polygon points="16,4 11,12 21,12" fill={c} />
    </svg>
  )
}

function NavigationHUD({
  target,
  routeData,
  loading,
  userCoords,
  onClose,
}: {
  target: Location
  routeData: RouteData | null
  loading: boolean
  userCoords: [number, number] | null
  onClose: () => void
}) {
  const [showAllTurns, setShowAllTurns] = useState(false)

  // Find the current active step index based on user proximity
  const activeStepIdx = (() => {
    if (!routeData?.steps?.length || !userCoords) return 0
    const actionable = routeData.steps.map((s, i) => ({ s, i })).filter(({ s }) => s.maneuver !== 'depart')
    let best = 0, minDist = Infinity
    actionable.forEach(({ s, i }) => {
      const d = haversineMeters(userCoords, s.location)
      if (d < minDist) { minDist = d; best = i }
    })
    return best
  })()

  const steps = routeData?.steps ?? []
  const nextStep = steps[activeStepIdx] ?? null
  const upcoming = steps.slice(activeStepIdx + 1, activeStepIdx + 3)  // next 2 after current

  const distToNext = nextStep && userCoords ? haversineMeters(userCoords, nextStep.location) : null
  const remainingDist = userCoords ? haversineMeters(userCoords, target.coordinates as [number, number]) : (routeData?.distance ?? null)
  const remainingDur = routeData?.duration != null && routeData?.distance != null && remainingDist != null
    ? Math.round(routeData.duration * (remainingDist / routeData.distance))
    : (routeData?.duration ?? null)

  // ETA = now + remaining duration
  const eta = remainingDur != null ? (() => {
    const d = new Date(Date.now() + remainingDur * 1000)
    return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Atlantic/Reykjavik' })
  })() : null

  const hudBg = 'rgba(10,11,14,0.97)'
  const hudBorder = '1px solid rgba(255,255,255,0.1)'
  const blur = 'blur(16px)'

  return (
    <>
      {/* ── Top panel: next maneuver + 2 upcoming ── */}
      <div style={{
        position: 'absolute', top: 8, left: 12, right: 12, zIndex: 30,
        borderRadius: 16, background: hudBg, border: hudBorder,
        backdropFilter: blur, WebkitBackdropFilter: blur,
        boxShadow: '0 4px 24px rgba(0,0,0,0.5)', overflow: 'hidden',
      }}>
        {/* Primary instruction row */}
        <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 14 }}>
          {loading
            ? <div style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid #f5a623', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite', flexShrink: 0 }} />
            : <ManeuverArrow maneuver={nextStep?.maneuver ?? 'straight'} />
          }
          <div style={{ flex: 1, minWidth: 0 }}>
            {loading ? (
              <div style={{ color: '#8a8f9e', fontSize: 13 }}>Calculating route…</div>
            ) : nextStep ? (
              <>
                <div style={{ color: '#fff', fontWeight: 700, fontSize: 15, lineHeight: 1.25 }}>
                  {nextStep.instruction}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 3 }}>
                  {distToNext != null && (
                    <span style={{ color: '#f5a623', fontSize: 13, fontWeight: 700 }}>
                      {fmtDist(distToNext)}
                    </span>
                  )}
                  {nextStep.streetName && (
                    <span style={{ color: '#8a8f9e', fontSize: 12 }}>{nextStep.streetName}</span>
                  )}
                  {routeData?.isEstimate && (
                    <span style={{ color: '#8a8f9e', fontSize: 10, background: 'rgba(255,255,255,0.08)', padding: '1px 6px', borderRadius: 4 }}>
                      est.
                    </span>
                  )}
                </div>
              </>
            ) : (
              <div style={{ color: '#8a8f9e', fontSize: 13 }}>Calculating…</div>
            )}
          </div>
        </div>

        {/* Upcoming turns (next 2) */}
        {upcoming.length > 0 && !loading && (
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
            {upcoming.map((step, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 16px',
                borderTop: i > 0 ? '1px solid rgba(255,255,255,0.05)' : 'none',
              }}>
                <ManeuverArrow maneuver={step.maneuver} size={20} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: '#c8cad4', fontSize: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {step.instruction}
                  </div>
                </div>
                <div style={{ color: '#8a8f9e', fontSize: 11, flexShrink: 0 }}>
                  {fmtDist(step.distance)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── All turns panel (slides up when open) ── */}
      {showAllTurns && (
        <div style={{
          position: 'absolute', top: 8, left: 12, right: 12, bottom: 74, zIndex: 31,
          borderRadius: 16, background: 'rgba(10,11,14,0.99)', border: hudBorder,
          backdropFilter: blur, WebkitBackdropFilter: blur,
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
          boxShadow: '0 4px 32px rgba(0,0,0,0.7)',
        }}>
          <div style={{ padding: '14px 16px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
            <span style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>All Turns</span>
            <button onClick={() => setShowAllTurns(false)} style={{ background: 'none', border: 'none', color: '#8a8f9e', cursor: 'pointer', fontSize: 18, padding: 4 }}>✕</button>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'none' }}>
            {steps.map((step, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px',
                borderTop: i > 0 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                background: i === activeStepIdx ? 'rgba(245,166,35,0.08)' : 'transparent',
              }}>
                <ManeuverArrow maneuver={step.maneuver} size={22} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: i === activeStepIdx ? '#fff' : '#c8cad4', fontSize: 13, fontWeight: i === activeStepIdx ? 700 : 400 }}>
                    {step.instruction}
                  </div>
                  {step.streetName && (
                    <div style={{ color: '#8a8f9e', fontSize: 11, marginTop: 1 }}>{step.streetName}</div>
                  )}
                </div>
                {step.distance > 0 && (
                  <div style={{ color: i === activeStepIdx ? '#f5a623' : '#8a8f9e', fontSize: 12, fontWeight: 600, flexShrink: 0 }}>
                    {fmtDist(step.distance)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Bottom bar: destination + ETA ── */}
      <div style={{
        position: 'absolute', bottom: 8, left: 12, right: 12, zIndex: 30,
        borderRadius: 16, background: hudBg, border: hudBorder,
        backdropFilter: blur, WebkitBackdropFilter: blur,
        padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10,
        boxShadow: '0 -4px 24px rgba(0,0,0,0.4)',
      }}>
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#f5a623', flexShrink: 0 }} />

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ color: '#fff', fontWeight: 700, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {target.name}
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            {remainingDist != null && <span style={{ color: '#8a8f9e', fontSize: 12 }}>{fmtDist(remainingDist)}</span>}
            {remainingDur != null && <span style={{ color: '#8a8f9e', fontSize: 12 }}>·  {fmtDuration(remainingDur)}</span>}
            {eta && <span style={{ color: '#4a9eff', fontSize: 12, fontWeight: 600 }}>· ETA {eta}</span>}
          </div>
        </div>

        {/* All turns button */}
        <button
          onClick={() => setShowAllTurns(v => !v)}
          style={{
            flexShrink: 0, height: 32, padding: '0 10px', borderRadius: 8, fontSize: 11, fontWeight: 600,
            background: showAllTurns ? 'rgba(245,166,35,0.15)' : 'rgba(255,255,255,0.08)',
            border: showAllTurns ? '1px solid rgba(245,166,35,0.4)' : '1px solid rgba(255,255,255,0.12)',
            color: showAllTurns ? '#f5a623' : '#8a8f9e', cursor: 'pointer',
          }}
        >
          Turns {steps.length > 0 ? `(${steps.length})` : ''}
        </button>

        <button onClick={onClose} style={{
          width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
          background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
          color: 'white', fontSize: 15, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>✕</button>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .nav-pulse { animation: navPulse 2s ease-in-out infinite; }
        @keyframes navPulse { 0%,100% { opacity:0.2; r:12 } 50% { opacity:0.5; r:14 } }
      `}</style>
    </>
  )
}

const WEATHER_LOCATIONS = [
  { name: 'Reykjavík', lat: 64.1355, lng: -21.8954 },
  { name: 'Vík',       lat: 63.4188, lng: -19.0057 },
  { name: 'Húsavík',   lat: 66.0449, lng: -17.3391 },
  { name: 'Höfn',      lat: 64.2539, lng: -15.2082 },
  { name: 'Grundarf.',  lat: 64.9236, lng: -23.2386 },
]

function WeatherPanel({ sunInfo }: { sunInfo: SunInfo }) {
  const [selectedIdx, setSelectedIdx] = useState(0)
  const [weatherCache, setWeatherCache] = useState<Record<number, WeatherData>>({})
  const [loading, setLoading] = useState(false)
  const fetchedRef = useRef<Set<number>>(new Set())

  const fmt = (d: Date) =>
    !d || isNaN(d.getTime())
      ? '--:--'
      : d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Atlantic/Reykjavik' })

  useEffect(() => {
    if (fetchedRef.current.has(selectedIdx)) return
    fetchedRef.current.add(selectedIdx)
    setLoading(true)
    const loc = WEATHER_LOCATIONS[selectedIdx]
    fetch(`/api/weather?lat=${loc.lat}&lng=${loc.lng}`)
      .then((r) => r.json())
      .then((d: WeatherData) => {
        setWeatherCache((prev) => ({ ...prev, [selectedIdx]: d }))
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [selectedIdx])

  const weather = weatherCache[selectedIdx]

  return (
    <div className="space-y-3 pb-4">
      {/* Location tabs */}
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2, scrollbarWidth: 'none' }}>
        {WEATHER_LOCATIONS.map((loc, i) => (
          <button
            key={loc.name}
            onClick={() => setSelectedIdx(i)}
            style={{
              flexShrink: 0,
              padding: '6px 14px',
              borderRadius: 999,
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              border: 'none',
              background: selectedIdx === i ? '#f5a623' : 'rgba(255,255,255,0.07)',
              color: selectedIdx === i ? '#0a0b0e' : '#8a8f9e',
              transition: 'all 0.15s',
            }}
          >
            {loc.name}
          </button>
        ))}
      </div>

      {loading || !weather ? (
        <div style={{ textAlign: 'center', padding: '32px 0', color: '#5a5f6e', fontSize: 13 }}>
          Loading weather…
        </div>
      ) : (
        <>
          <div className="card p-4 rounded-xl">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-4xl font-light">{weather.temperature}°C</div>
                <div className="text-[#8a8f9e] text-sm mt-1">{weather.condition}</div>
                <div className="text-[#8a8f9e] text-sm mt-1">🌬 {weather.windSpeed} km/h</div>
              </div>
              <div className="text-[#4a9eff] text-sm text-right font-semibold">
                {WEATHER_LOCATIONS[selectedIdx].name}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {weather.forecast.map((day, i) => (
              <div
                key={i}
                className={`card p-2 rounded-xl flex flex-col items-center gap-0.5 ${i === 0 ? 'border-[#f5a623]' : ''}`}
              >
                <div className="text-[9px] text-[#8a8f9e] font-medium">{day.day.slice(0, 3)}</div>
                <div className="text-sm">{day.icon}</div>
                <div className="text-white text-xs font-semibold">{day.high}°</div>
                <div className="text-[#8a8f9e] text-[10px]">{day.low}°</div>
                <div
                  className="text-[8px] font-bold px-1 py-0.5 rounded-full mt-0.5"
                  style={{
                    color: day.quality === 'excellent' || day.quality === 'good' ? '#10b981' : '#6b7280',
                  }}
                >
                  {day.quality === 'excellent' ? 'Exc' : day.quality === 'good' ? 'Good' : day.quality === 'fair' ? 'Fair' : 'Poor'}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="card p-4 rounded-xl">
        <div className="font-semibold text-sm mb-3">☀️ Light Schedule</div>
        <div className="space-y-2">
          {[
            { label: 'Sunrise', time: sunInfo.sunrise, color: '#f5a623' },
            { label: 'Golden Hour AM end', time: sunInfo.goldenHourEnd, color: '#8a8f9e' },
            { label: 'Golden Hour PM start', time: sunInfo.goldenHour, color: '#f5a623' },
            { label: 'Sunset', time: sunInfo.sunset, color: '#f5a623' },
            { label: 'Night', time: sunInfo.night, color: '#4a9eff' },
          ].map(({ label, time, color }) => (
            <div key={label} className="flex justify-between text-sm">
              <span className="text-[#8a8f9e]">{label}</span>
              <span style={{ color }}>{fmt(time)}</span>
            </div>
          ))}
        </div>
        {sunInfo.isMidnightSun && (
          <div className="mt-3 text-[#f5a623] text-xs text-center font-medium">
            ☀️ Midnight Sun — No darkness tonight
          </div>
        )}
        {sunInfo.isPolarNight && (
          <div className="mt-3 text-[#4a9eff] text-xs text-center font-medium">
            🌑 Polar Night — No sunrise today
          </div>
        )}
      </div>
    </div>
  )
}

function CompassDisplay({ sunAzimuth }: { sunAzimuth: number }) {
  const [heading, setHeading] = useState<number | null>(null)
  const [permissionNeeded, setPermissionNeeded] = useState(false)

  useEffect(() => {
    // Check if iOS permission needed
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      setPermissionNeeded(true)
      return
    }
    const handler = (e: DeviceOrientationEvent) => {
      // webkitCompassHeading is iOS, alpha is Android (needs conversion)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const compassHeading = (e as any).webkitCompassHeading ??
        (e.alpha != null ? (360 - e.alpha) % 360 : null)
      if (compassHeading != null) setHeading(Math.round(compassHeading))
    }
    window.addEventListener('deviceorientation', handler, true)
    return () => window.removeEventListener('deviceorientation', handler, true)
  }, [])

  const requestPermission = async () => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await (DeviceOrientationEvent as any).requestPermission()
      if (result === 'granted') {
        setPermissionNeeded(false)
        const handler = (e: DeviceOrientationEvent) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const compassHeading = (e as any).webkitCompassHeading ??
            (e.alpha != null ? (360 - e.alpha) % 360 : null)
          if (compassHeading != null) setHeading(Math.round(compassHeading))
        }
        window.addEventListener('deviceorientation', handler, true)
      }
    } catch {}
  }

  const cardinals = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
  const deviceBearing = heading ?? 0

  // Direction label from heading
  const idx = Math.round(deviceBearing / 45) % 8
  const dirLabel = cardinals[idx]

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      {/* Compass rose */}
      <div
        style={{
          width: 220, height: 220, borderRadius: '50%',
          background: 'rgba(18,20,28,0.95)',
          border: '2px solid rgba(255,255,255,0.12)',
          position: 'relative',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        {/* Cardinal labels — rotate opposite to heading so N always faces up on screen */}
        <div
          style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            transform: `rotate(${-deviceBearing}deg)`,
            transition: 'transform 0.15s ease-out',
          }}
        >
          {cardinals.map((dir, i) => {
            const angle = i * 45
            const r = 88
            const x = Math.sin((angle * Math.PI) / 180) * r
            const y = -Math.cos((angle * Math.PI) / 180) * r
            return (
              <span
                key={dir}
                style={{
                  position: 'absolute',
                  left: '50%', top: '50%',
                  transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                  fontSize: dir === 'N' ? 14 : 11,
                  fontWeight: 700,
                  color: dir === 'N' ? '#ef4444' : '#6b7280',
                }}
              >
                {dir}
              </span>
            )
          })}
          {/* Tick marks */}
          {Array.from({ length: 36 }).map((_, i) => {
            const angle = i * 10
            const isMajor = angle % 90 === 0
            const x1 = Math.sin((angle * Math.PI) / 180) * 100
            const y1 = -Math.cos((angle * Math.PI) / 180) * 100
            const x2 = Math.sin((angle * Math.PI) / 180) * (isMajor ? 92 : 96)
            const y2 = -Math.cos((angle * Math.PI) / 180) * (isMajor ? 92 : 96)
            return (
              <svg key={i} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible' }}>
                <line
                  x1={`calc(50% + ${x1}px)`} y1={`calc(50% + ${y1}px)`}
                  x2={`calc(50% + ${x2}px)`} y2={`calc(50% + ${y2}px)`}
                  stroke={isMajor ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)'}
                  strokeWidth={isMajor ? 2 : 1}
                />
              </svg>
            )
          })}
        </div>

        {/* Fixed north needle */}
        <svg width="220" height="220" style={{ position: 'absolute', inset: 0 }}>
          {/* North needle (red) */}
          <polygon
            points="110,28 105,110 110,95 115,110"
            fill="#ef4444"
            opacity={0.9}
          />
          {/* South needle (white) */}
          <polygon
            points="110,192 105,110 110,125 115,110"
            fill="rgba(255,255,255,0.3)"
          />
        </svg>

        {/* Sun direction indicator */}
        <div
          style={{
            position: 'absolute', inset: 0,
            transform: `rotate(${sunAzimuth - deviceBearing}deg)`,
            transition: 'transform 0.3s ease-out',
          }}
        >
          <svg width="220" height="220" style={{ position: 'absolute', inset: 0 }}>
            <line
              x1="110" y1="110" x2="110" y2="35"
              stroke="#f5a623" strokeWidth="2" strokeDasharray="4,3"
              strokeLinecap="round" opacity={0.8}
            />
            <circle cx="110" cy="35" r="6" fill="#f5a623" opacity={0.9} />
          </svg>
        </div>

        {/* Center dot */}
        <div style={{
          width: 12, height: 12, borderRadius: '50%',
          background: '#fff', zIndex: 10,
          boxShadow: '0 0 8px rgba(255,255,255,0.5)',
        }} />
      </div>

      {/* Heading readout */}
      <div className="text-center">
        {permissionNeeded ? (
          <button
            onClick={requestPermission}
            style={{
              padding: '10px 24px', borderRadius: 999,
              background: '#f5a623', color: '#0a0b0e',
              fontWeight: 700, fontSize: 14, border: 'none', cursor: 'pointer',
            }}
          >
            Enable Compass
          </button>
        ) : (
          <>
            <div style={{ fontSize: 36, fontWeight: 800, color: '#fff', lineHeight: 1 }}>
              {heading != null ? `${heading}°` : '--°'}
            </div>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#8a8f9e', marginTop: 4 }}>
              {heading != null ? dirLabel : 'Waiting…'}
            </div>
            <div style={{ fontSize: 12, color: '#5a5f6e', marginTop: 8 }}>
              ☀ Sun at {Math.round(sunAzimuth)}° Az
            </div>
          </>
        )}
      </div>
    </div>
  )
}
