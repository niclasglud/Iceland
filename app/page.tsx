'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import dynamic from 'next/dynamic'
import { ActiveTab, Location, AuroraData, WeatherData, SunInfo, MoonInfo, RouteData, RouteStep } from '@/types'
import { getSunInfo, getMoonInfo, ICELAND_CENTER } from '@/lib/suncalc-utils'
import { getMockAuroraData } from '@/lib/aurora'
import { getMockWeatherData } from '@/lib/weather'
import { locations } from '@/data/locations'
import TopNav from '@/components/layout/TopNav'
import BottomPanel from '@/components/layout/BottomPanel'
import ToolsDrawer from '@/components/layout/ToolsDrawer'
import SpotsList from '@/components/spots/SpotsList'
import SpotDetail from '@/components/spots/SpotDetail'
import AuroraBar from '@/components/aurora/AuroraBar'

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
  const [isNightMode, setIsNightMode] = useState(false)
  const [detailLocation, setDetailLocation] = useState<Location | null>(null)
  const [selectedWeatherDay, setSelectedWeatherDay] = useState<number | null>(null)
  const [navigationTarget, setNavigationTarget] = useState<Location | null>(null)
  const [routeData, setRouteData] = useState<RouteData | null>(null)
  const [routeLoading, setRouteLoading] = useState(false)
  const [userCoords, setUserCoords] = useState<[number, number] | null>(null)
  const watchIdRef = useRef<number | null>(null)

  const [sunInfo, setSunInfo] = useState<SunInfo>(() =>
    getSunInfo(new Date(), ICELAND_CENTER[0], ICELAND_CENTER[1])
  )
  const [moonInfo, setMoonInfo] = useState<MoonInfo>(() =>
    getMoonInfo(new Date(), ICELAND_CENTER[0], ICELAND_CENTER[1])
  )
  const [auroraData, setAuroraData] = useState<AuroraData>(getMockAuroraData())
  const [weather, setWeather] = useState<WeatherData>(getMockWeatherData())

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

  // Fetch real road route via OSRM when navigationTarget changes
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
        .then((data: RouteData) => {
          if (data.geometry) setRouteData(data)
        })
        .catch(console.error)
        .finally(() => setRouteLoading(false))
    }

    // Start GPS watch for live position updates
    if (navigator.geolocation) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          const coords: [number, number] = [pos.coords.longitude, pos.coords.latitude]
          setUserCoords(coords)
          fetchRoute(coords[0], coords[1])
        },
        () => {
          // GPS denied — use Reykjavik as start
          const defaultStart: [number, number] = [-21.9426, 64.1355]
          setUserCoords(null)
          fetchRoute(defaultStart[0], defaultStart[1])
          setRouteLoading(false)
        },
        { enableHighAccuracy: true, maximumAge: 30000 }
      )
    } else {
      const defaultStart: [number, number] = [-21.9426, 64.1355]
      fetchRoute(defaultStart[0], defaultStart[1])
    }

    return () => {
      if (watchIdRef.current != null) {
        navigator.geolocation?.clearWatch(watchIdRef.current)
        watchIdRef.current = null
      }
    }
  }, [navigationTarget])

  const handleLocationSelect = useCallback(
    (location: Location) => {
      setSelectedLocation(location)
      setDetailLocation(location)
    },
    []
  )

  const handleCloseDetail = useCallback(() => setDetailLocation(null), [])

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
    <div className="flex flex-col h-[100dvh] w-screen overflow-hidden bg-[#0a0b0e] select-none">
      <TopNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        selectedLocation={selectedLocation}
        onMenuClick={() => setIsToolsOpen(true)}
        onToolsClick={() => setIsToolsOpen(true)}
      />

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
              isExpanded={true}
              activeTab={activeTab}
              auroraData={auroraData}
              navigationTarget={navigationTarget}
              routeGeometry={routeData?.geometry ?? null}
              userCoords={userCoords}
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

        {/* Aurora Panel */}
        {activeTab === 'aurora' && (
          <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
            <AuroraBar
              kpIndex={auroraData.kpIndex}
              probability={auroraData.probability}
              bestViewingTime={auroraData.bestViewingTime}
              cloudCover={auroraData.cloudCover ?? 20}
              forecast={auroraData.kpForecast}
              onViewMap={() => setActiveTab('map')}
            />
          </div>
        )}

        {/* Weather Panel */}
        {activeTab === 'weather' && (
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            <WeatherPanel weather={weather} sunInfo={sunInfo} />
          </div>
        )}

        {/* Compass overlay */}
        {activeTab === 'compass' && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-auto z-20">
            <CompassDisplay sunAzimuth={sunInfo.azimuth} />
          </div>
        )}
      </div>

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
        />
      )}

      <ToolsDrawer
        isOpen={isToolsOpen}
        onClose={() => setIsToolsOpen(false)}
        sunInfo={sunInfo}
        auroraData={auroraData}
        selectedLocation={selectedLocation}
        onShowSunBearing={(v: boolean) => {
          setShowSunBearing(v)
          if (v) {
            setActiveTab('map')
            setIsToolsOpen(false)
          }
        }}
        showSunBearing={showSunBearing}
        onNavigate={(loc) => {
          setNavigationTarget(loc)
          if (loc) {
            setActiveTab('map')
            setIsToolsOpen(false)
          }
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

function ManeuverArrow({ maneuver }: { maneuver: string }) {
  const size = 32
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
  // Find next step based on proximity to user
  const nextStep: RouteStep | null = (() => {
    if (!routeData?.steps?.length) return null
    if (!userCoords) return routeData.steps[0] ?? null
    // Skip depart step, find nearest upcoming maneuver
    const steps = routeData.steps.filter((s) => s.maneuver !== 'depart')
    let closestIdx = 0
    let minDist = Infinity
    steps.forEach((step, i) => {
      const d = haversineMeters(userCoords, step.location)
      if (d < minDist) { minDist = d; closestIdx = i }
    })
    return steps[closestIdx] ?? null
  })()

  const distToNext = nextStep && userCoords
    ? haversineMeters(userCoords, nextStep.location)
    : null

  const totalDist = routeData?.distance ?? null
  const totalDur = routeData?.duration ?? null

  // Distance remaining (approx: from user to destination)
  const remainingDist = userCoords && target.coordinates
    ? haversineMeters(userCoords, target.coordinates as [number, number])
    : totalDist

  return (
    <>
      {/* Top instruction bar */}
      <div
        style={{
          position: 'absolute', top: 8, left: 12, right: 12, zIndex: 30,
          borderRadius: 16,
          background: 'rgba(10,11,14,0.97)',
          border: '1px solid rgba(255,255,255,0.1)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          padding: '12px 16px',
          display: 'flex', alignItems: 'center', gap: 14,
          boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
        }}
      >
        {loading ? (
          <div style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid #f5a623', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
        ) : (
          <ManeuverArrow maneuver={nextStep?.maneuver ?? 'straight'} />
        )}

        <div style={{ flex: 1, minWidth: 0 }}>
          {loading ? (
            <div style={{ color: '#8a8f9e', fontSize: 13 }}>Calculating route…</div>
          ) : nextStep ? (
            <>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: 15, lineHeight: 1.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {nextStep.instruction}
              </div>
              {distToNext != null && (
                <div style={{ color: '#f5a623', fontSize: 13, fontWeight: 600, marginTop: 2 }}>
                  in {fmtDist(distToNext)}
                </div>
              )}
            </>
          ) : (
            <div style={{ color: '#8a8f9e', fontSize: 13 }}>No route available</div>
          )}
        </div>
      </div>

      {/* Bottom info bar */}
      <div
        style={{
          position: 'absolute', bottom: 8, left: 12, right: 12, zIndex: 30,
          borderRadius: 16,
          background: 'rgba(10,11,14,0.97)',
          border: '1px solid rgba(255,255,255,0.1)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          padding: '12px 16px',
          display: 'flex', alignItems: 'center', gap: 10,
          boxShadow: '0 -4px 24px rgba(0,0,0,0.4)',
        }}
      >
        {/* Destination dot */}
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#f5a623', flexShrink: 0 }} />

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ color: '#fff', fontWeight: 700, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {target.name}
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 2 }}>
            {remainingDist != null && (
              <span style={{ color: '#8a8f9e', fontSize: 12 }}>{fmtDist(remainingDist)}</span>
            )}
            {totalDur != null && (
              <span style={{ color: '#8a8f9e', fontSize: 12 }}>~{fmtDuration(totalDur)}</span>
            )}
          </div>
        </div>

        {/* Step count */}
        {routeData?.steps && (
          <div style={{ color: '#8a8f9e', fontSize: 11, textAlign: 'center', flexShrink: 0 }}>
            <div style={{ color: '#fff', fontWeight: 600, fontSize: 13 }}>{routeData.steps.length}</div>
            <div>steps</div>
          </div>
        )}

        {/* Close */}
        <button
          onClick={onClose}
          style={{
            width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.12)',
            color: 'white', fontSize: 16, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          ✕
        </button>
      </div>

      {/* CSS for spinner */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  )
}

function WeatherPanel({ weather, sunInfo }: { weather: WeatherData; sunInfo: SunInfo }) {
  const fmt = (d: Date) =>
    !d || isNaN(d.getTime())
      ? '--:--'
      : d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="space-y-3 pb-4">
      <div className="card p-4 rounded-xl">
        <div className="flex justify-between items-start">
          <div>
            <div className="text-4xl font-light">{weather.temperature}°C</div>
            <div className="text-[#8a8f9e] text-sm mt-1">{weather.condition}</div>
            <div className="text-[#8a8f9e] text-sm mt-1">🌬 {weather.windSpeed} km/h</div>
          </div>
          <div className="text-[#4a9eff] text-sm text-right">{weather.location}</div>
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
