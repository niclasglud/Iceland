'use client'

import { useState, useEffect, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { ActiveTab, Location, AuroraData, WeatherData, SunInfo, MoonInfo } from '@/types'
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
            />

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
