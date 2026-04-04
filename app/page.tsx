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

  const showMap = ['map', 'route', 'compass'].includes(activeTab)
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
          <div className="flex-1 overflow-y-auto">
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
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
            <CompassDisplay azimuth={sunInfo.azimuth} />
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

function CompassDisplay({ azimuth }: { azimuth: number }) {
  return (
    <div className="flex flex-col items-center gap-6">
      <div
        className="w-56 h-56 rounded-full border border-white/20 flex items-center justify-center relative"
        style={{ background: 'rgba(10,11,14,0.85)' }}
      >
        {(['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'] as const).map((dir, i) => {
          const angle = i * 45
          const r = 90
          const x = Math.sin((angle * Math.PI) / 180) * r
          const y = -Math.cos((angle * Math.PI) / 180) * r
          return (
            <span
              key={dir}
              className="absolute text-[10px] font-bold"
              style={{
                transform: `translate(${x}px, ${y}px) translate(-50%, -50%)`,
                color: dir === 'N' ? '#ef4444' : '#6b7280',
              }}
            >
              {dir}
            </span>
          )
        })}
        <div
          className="absolute w-0.5 bg-gradient-to-t from-transparent to-[#f5a623] origin-bottom rounded-full"
          style={{
            height: '80px',
            transform: `rotate(${azimuth}deg)`,
            bottom: '50%',
            left: 'calc(50% - 1px)',
            boxShadow: '0 0 8px rgba(245,166,35,0.6)',
          }}
        />
        <div className="w-4 h-4 rounded-full bg-[#f5a623] shadow-[0_0_16px_rgba(245,166,35,0.8)] z-10" />
      </div>
      <div className="text-center">
        <div className="text-[#f5a623] text-2xl font-light">{Math.round(azimuth)}°</div>
        <div className="text-[#8a8f9e] text-xs">Sun Azimuth</div>
      </div>
    </div>
  )
}
