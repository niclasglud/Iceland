'use client'

import { useState, useEffect, useRef } from 'react'
import { useUpdateReady } from '@/lib/use-update-ready'
import {
  X,
  Navigation,
  Clock,
  Sparkles,
  Compass,
  Settings,
  Search,
  Download,
  MapPin,
  LocateFixed,
} from 'lucide-react'
import { SunInfo, AuroraData, Location, WeatherData } from '@/types'
import { formatTime, getCountdown, getCurrentLightPhase } from '@/lib/suncalc-utils'
import { getKpColor, getKpLabel, getAuroraDescription } from '@/lib/aurora'

interface ToolsDrawerProps {
  isOpen: boolean
  onClose: () => void
  sunInfo: SunInfo
  auroraData: AuroraData
  weather: WeatherData
  locations: Location[]
  selectedLocation?: Location | null
  onShowSunBearing: (show: boolean) => void
  showSunBearing: boolean
  onShowCloudCover: (show: boolean) => void
  showCloudCover: boolean
  onNavigate?: (dest: Location, fromLocation?: Location | null) => void
}

// ── Internal sub-components ─────────────────────────────────────────────────

const TYPE_ICONS: Record<string, string> = {
  waterfall: '💧', glacier: '🧊', volcano: '🌋', lake: '🏞️',
  canyon: '🏜️', beach: '🏖️', 'hot-spring': '♨️', lava: '🔥',
  mountain: '⛰️', ruins: '🏛️', geothermal: '💨', valley: '🌿',
}

function LocationRow({ loc, isFirst, onSelect }: { loc: Location; isFirst: boolean; onSelect: () => void }) {
  return (
    <button
      onClick={onSelect}
      style={{
        width: '100%', textAlign: 'left', background: 'none', border: 'none',
        borderTop: isFirst ? 'none' : '1px solid rgba(255,255,255,0.06)',
        padding: '9px 12px', cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: 10,
      }}
    >
      <span style={{ fontSize: 15, flexShrink: 0 }}>{TYPE_ICONS[loc.type] ?? '📍'}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {loc.name}
        </div>
        <div style={{ fontSize: 11, color: '#8a8f9e' }}>
          {loc.region.replace(/-/g, ' ')} · {loc.distance ? `${loc.distance} km` : loc.type}
        </div>
      </div>
      <svg width="14" height="14" viewBox="0 0 14 14" style={{ flexShrink: 0, color: '#8a8f9e' }}>
        <path d="M4 7h6M7 4l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </svg>
    </button>
  )
}

interface SectionProps {
  icon: React.ReactNode
  title: string
  children: React.ReactNode
}

function Section({ icon, title, children }: SectionProps) {
  return (
    <div className="flex flex-col gap-2">
      {/* Section header */}
      <div className="flex items-center gap-2">
        <span style={{ color: '#f5a623' }}>{icon}</span>
        <span className="text-sm font-semibold text-white">{title}</span>
      </div>

      {/* Card body */}
      <div
        className="rounded-xl px-3 py-3 flex flex-col gap-2.5"
        style={{
          background: 'rgba(18,20,28,0.95)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        {children}
      </div>
    </div>
  )
}

interface ToggleSwitchProps {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
  description?: string
}

function ToggleSwitch({ checked, onChange, label, description }: ToggleSwitchProps) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex flex-col gap-0.5 flex-1 min-w-0">
        <span className="text-xs font-medium text-white">{label}</span>
        {description && (
          <span className="text-[11px] leading-tight" style={{ color: '#8a8f9e' }}>
            {description}
          </span>
        )}
      </div>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className="relative shrink-0 rounded-full transition-colors duration-200 focus:outline-none"
        style={{
          width: '40px',
          height: '22px',
          background: checked ? '#f5a623' : 'rgba(255,255,255,0.15)',
          marginTop: '1px',
        }}
      >
        <span
          className="absolute top-0.5 rounded-full bg-white shadow transition-transform duration-200"
          style={{
            width: '18px',
            height: '18px',
            left: '2px',
            transform: checked ? 'translateX(18px)' : 'translateX(0px)',
          }}
        />
      </button>
    </div>
  )
}

// KP gauge bar (0-9 scale)
interface KpGaugeProps {
  kp: number
}

function KpGauge({ kp }: KpGaugeProps) {
  const pct = (Math.min(9, Math.max(0, kp)) / 9) * 100
  return (
    <div className="flex flex-col gap-1">
      {/* Gradient bar */}
      <div
        className="relative w-full rounded-full overflow-hidden"
        style={{ height: '10px', background: 'rgba(255,255,255,0.1)' }}
      >
        <div
          className="absolute left-0 top-0 h-full rounded-full transition-all duration-500"
          style={{
            width: `${pct}%`,
            background: 'linear-gradient(to right, #00ff88, #f5a623, #ef4444)',
          }}
        />
        {/* Indicator tick */}
        <div
          className="absolute top-0 h-full w-0.5 rounded-full"
          style={{
            left: `${pct}%`,
            background: '#ffffff',
            transform: 'translateX(-50%)',
          }}
        />
      </div>

      {/* Scale labels 0-9 */}
      <div className="flex justify-between">
        {Array.from({ length: 10 }, (_, i) => (
          <span
            key={i}
            className="text-[9px] font-medium"
            style={{ color: i <= Math.round(kp) ? getKpColor(i) : '#4b5563' }}
          >
            {i}
          </span>
        ))}
      </div>
    </div>
  )
}

// ── Light countdown rows ────────────────────────────────────────────────────

interface CountdownRowProps {
  emoji: string
  label: string
  time: string
  countdown: string
  color: string
}

function CountdownRow({ emoji, label, time, countdown, color }: CountdownRowProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm leading-none w-5 text-center">{emoji}</span>
      <span className="flex-1 text-xs" style={{ color: '#8a8f9e' }}>
        {label}
      </span>
      <span className="text-xs tabular-nums font-medium" style={{ color: '#8a8f9e' }}>
        {time}
      </span>
      <span
        className="text-xs tabular-nums font-semibold min-w-[52px] text-right"
        style={{ color }}
      >
        {countdown}
      </span>
    </div>
  )
}

// ── Main drawer ─────────────────────────────────────────────────────────────

export default function ToolsDrawer({
  isOpen,
  onClose,
  sunInfo,
  auroraData,
  weather,
  locations,
  selectedLocation,
  onShowSunBearing,
  showSunBearing,
  onShowCloudCover,
  showCloudCover,
  onNavigate,
}: ToolsDrawerProps) {
  const updateReady = useUpdateReady()
  const [fromMode, setFromMode] = useState<'current' | 'search'>('current')
  const [fromSearch, setFromSearch] = useState('')
  const [fromLoc, setFromLoc] = useState<Location | null>(null)
  const [toSearch, setToSearch] = useState('')
  const [navDest, setNavDest] = useState<Location | null>(null)
  const [dlState, setDlState] = useState<'idle' | 'downloading' | 'done'>('idle')
  const [dlProgress, setDlProgress] = useState(0)
  const drawerRef = useRef<HTMLDivElement>(null)

  const filterLocs = (q: string) =>
    q.trim().length > 0
      ? locations.filter(l =>
          l.name.toLowerCase().includes(q.toLowerCase()) ||
          (l.icelandicName ?? '').toLowerCase().includes(q.toLowerCase()) ||
          l.type.toLowerCase().includes(q.toLowerCase())
        ).slice(0, 5)
      : []

  const fromResults = filterLocs(fromSearch)
  const toResults   = filterLocs(toSearch)

  // Active destination: either searched+selected, or pre-selected spot
  const destination = navDest ?? selectedLocation ?? null

  // Reset when drawer closes
  useEffect(() => {
    if (!isOpen) {
      setToSearch(''); setNavDest(null)
      setFromSearch(''); setFromLoc(null); setFromMode('current')
    }
  }, [isOpen])

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  // Close on Escape key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    if (isOpen) window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  // Click outside to close
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose()
  }

  // Current light phase
  const lightPhase = getCurrentLightPhase(sunInfo)

  // Light countdown rows
  const countdownRows: CountdownRowProps[] = [
    {
      emoji: '🌅',
      label: 'Golden Hour AM',
      time: formatTime(sunInfo.goldenHourEnd),
      countdown: getCountdown(sunInfo.goldenHourEnd),
      color: '#f5a623',
    },
    {
      emoji: '🌇',
      label: 'Golden Hour PM',
      time: formatTime(sunInfo.goldenHour),
      countdown: getCountdown(sunInfo.goldenHour),
      color: '#ef4444',
    },
    {
      emoji: '🌅',
      label: 'Sunrise',
      time: formatTime(sunInfo.sunrise),
      countdown: getCountdown(sunInfo.sunrise),
      color: '#f5a623',
    },
    {
      emoji: '🌇',
      label: 'Sunset',
      time: formatTime(sunInfo.sunset),
      countdown: getCountdown(sunInfo.sunset),
      color: '#ffffff',
    },
    {
      emoji: '🌙',
      label: 'Night',
      time: formatTime(sunInfo.night),
      countdown: getCountdown(sunInfo.night),
      color: '#4a9eff',
    },
  ]

  const kp        = auroraData.kpIndex
  const kpColor   = getKpColor(kp)
  const kpLabel   = getKpLabel(kp)
  const kpDesc    = getAuroraDescription(kp)

  return (
    <>
      {/* ── Backdrop ── */}
      <div
        onClick={handleBackdropClick}
        className="fixed inset-0 z-50 transition-all duration-300"
        style={{
          background: isOpen ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0)',
          backdropFilter: isOpen ? 'blur(4px)' : 'blur(0px)',
          WebkitBackdropFilter: isOpen ? 'blur(4px)' : 'blur(0px)',
          pointerEvents: isOpen ? 'auto' : 'none',
        }}
        aria-hidden={!isOpen}
      />

      {/* ── Drawer panel ── */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Tools drawer"
        className="fixed bottom-0 left-0 right-0 z-50 flex flex-col transition-transform duration-300 ease-out"
        style={{
          maxHeight: '85vh',
          background: 'rgba(10,11,14,0.98)',
          borderTopLeftRadius: '20px',
          borderTopRightRadius: '20px',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          transform: isOpen ? 'translateY(0)' : 'translateY(100%)',
          paddingBottom: 'env(safe-area-inset-bottom, 12px)',
        }}
      >
        {/* ── Handle bar ── */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div
            className="rounded-full"
            style={{
              width: '36px',
              height: '4px',
              background: 'rgba(255,255,255,0.25)',
            }}
          />
        </div>

        {/* ── Header row: title + close ── */}
        <div className="flex items-center justify-between px-4 pb-3 shrink-0">
          <span className="text-base font-bold text-white">Tools</span>
          <button
            onClick={onClose}
            aria-label="Close tools"
            className="flex items-center justify-center w-8 h-8 rounded-full transition-colors"
            style={{ background: 'rgba(255,255,255,0.08)' }}
          >
            <X size={16} className="text-white" />
          </button>
        </div>

        {/* ── Scrollable content ── */}
        <div
          className="flex-1 overflow-y-auto px-4 pb-4 flex flex-col gap-5"
          style={{ scrollbarWidth: 'none' }}
        >

          {/* ────────────────────────────────────────────
              SECTION 1: Navigation
          ──────────────────────────────────────────── */}
          <Section icon={<Navigation size={15} />} title="Navigation">

            {/* ── FROM ── */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-semibold tracking-wider uppercase" style={{ color: '#8a8f9e' }}>From</span>

              {/* Mode toggle */}
              <div className="flex gap-2">
                <button
                  onClick={() => { setFromMode('current'); setFromLoc(null); setFromSearch('') }}
                  style={{
                    flex: 1, height: 34, borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                    background: 'none',
                    border: fromMode === 'current' ? '1px solid #f5a623' : '1px solid rgba(255,255,255,0.12)',
                    color: fromMode === 'current' ? '#f5a623' : '#8a8f9e',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                  }}
                >
                  <LocateFixed size={12} /> GPS Location
                </button>
                <button
                  onClick={() => setFromMode('search')}
                  style={{
                    flex: 1, height: 34, borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                    background: 'none',
                    border: fromMode === 'search' ? '1px solid #f5a623' : '1px solid rgba(255,255,255,0.12)',
                    color: fromMode === 'search' ? '#f5a623' : '#8a8f9e',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                  }}
                >
                  <Search size={12} /> Enter spot
                </button>
              </div>

              {/* FROM search (visible when mode = search) */}
              {fromMode === 'search' && (
                <>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 8, height: 40, padding: '0 10px', borderRadius: 8,
                    background: 'rgba(255,255,255,0.06)',
                    border: `1px solid ${fromLoc ? 'rgba(245,166,35,0.4)' : 'rgba(255,255,255,0.1)'}`,
                  }}>
                    <MapPin size={13} style={{ color: '#8a8f9e', flexShrink: 0 }} />
                    <input
                      type="text"
                      value={fromLoc ? fromLoc.name : fromSearch}
                      onChange={e => { setFromSearch(e.target.value); setFromLoc(null) }}
                      onFocus={() => { if (fromLoc) { setFromSearch(fromLoc.name); setFromLoc(null) } }}
                      placeholder="Type a starting spot…"
                      className="flex-1 bg-transparent text-sm outline-none placeholder:text-[#4b5563] text-white"
                    />
                    {(fromLoc || fromSearch) && (
                      <button onClick={() => { setFromSearch(''); setFromLoc(null) }}
                        style={{ background: 'none', border: 'none', color: '#8a8f9e', cursor: 'pointer', lineHeight: 1, padding: 2 }}>✕</button>
                    )}
                  </div>
                  {fromResults.length > 0 && !fromLoc && (
                    <div style={{ borderRadius: 10, background: 'rgba(18,20,28,0.98)', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden' }}>
                      {fromResults.map((loc, i) => (
                        <LocationRow key={loc.id} loc={loc} isFirst={i === 0} onSelect={() => { setFromLoc(loc); setFromSearch('') }} />
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* ── DESTINATION ── */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-semibold tracking-wider uppercase" style={{ color: '#8a8f9e' }}>Destination</span>

              <div style={{
                display: 'flex', alignItems: 'center', gap: 8, height: 40, padding: '0 10px', borderRadius: 8,
                background: 'rgba(255,255,255,0.06)',
                border: `1px solid ${navDest ? 'rgba(245,166,35,0.4)' : 'rgba(255,255,255,0.1)'}`,
              }}>
                <Search size={13} style={{ color: '#8a8f9e', flexShrink: 0 }} />
                <input
                  type="text"
                  value={navDest ? navDest.name : toSearch}
                  onChange={e => { setToSearch(e.target.value); setNavDest(null) }}
                  onFocus={() => { if (navDest) { setToSearch(navDest.name); setNavDest(null) } }}
                  placeholder="Search waterfalls, glaciers…"
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-[#4b5563] text-white"
                />
                {(navDest || toSearch) && (
                  <button onClick={() => { setToSearch(''); setNavDest(null) }}
                    style={{ background: 'none', border: 'none', color: '#8a8f9e', cursor: 'pointer', lineHeight: 1, padding: 2 }}>✕</button>
                )}
              </div>

              {toResults.length > 0 && !navDest && (
                <div style={{ borderRadius: 10, background: 'rgba(18,20,28,0.98)', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden' }}>
                  {toResults.map((loc, i) => (
                    <LocationRow key={loc.id} loc={loc} isFirst={i === 0} onSelect={() => { setNavDest(loc); setToSearch('') }} />
                  ))}
                </div>
              )}

              {/* Pre-selected spot shortcut */}
              {!navDest && !toSearch && selectedLocation && (
                <button onClick={() => setNavDest(selectedLocation)}
                  style={{
                    width: '100%', textAlign: 'left', background: 'rgba(245,166,35,0.06)',
                    border: '1px solid rgba(245,166,35,0.2)', borderRadius: 10,
                    padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                  }}>
                  <MapPin size={13} style={{ color: '#f5a623', flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: '#f5a623', flex: 1 }}>
                    Use selected: <strong>{selectedLocation.name}</strong>
                  </span>
                </button>
              )}
            </div>

            {/* START NAVIGATION button */}
            {destination && onNavigate && (
              <button
                onClick={() => { onNavigate(destination, fromMode === 'search' ? fromLoc : null); onClose() }}
                style={{
                  width: '100%', height: 48, borderRadius: 12, fontWeight: 700, fontSize: 15,
                  background: '#f5a623', color: '#0a0b0e', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  boxShadow: '0 4px 20px rgba(245,166,35,0.4)',
                }}
              >
                <Navigation size={16} />
                Start — {destination.name}
              </button>
            )}

            {/* Offline tiles / Open in Maps */}
            <div className="flex flex-col gap-2">
              {/* Open in native maps app */}
              {selectedLocation && (
                <button
                  onClick={() => {
                    const [lng, lat] = selectedLocation.coordinates
                    const label = encodeURIComponent(selectedLocation.name)
                    // Try Apple Maps on iOS, Google Maps otherwise
                    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
                    const url = isIOS
                      ? `maps://maps.apple.com/?daddr=${lat},${lng}&dirflg=d`
                      : `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${label}&travelmode=driving`
                    window.open(url, '_blank')
                  }}
                  className="flex items-center justify-center gap-2 w-full rounded-lg py-2 text-xs font-semibold"
                  style={{
                    background: 'rgba(74,158,255,0.12)',
                    border: '1px solid rgba(74,158,255,0.3)',
                    color: '#4a9eff', cursor: 'pointer',
                  }}
                >
                  <Navigation size={12} />
                  Open in Maps App
                </button>
              )}

              {/* Offline tile cache */}
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-medium text-white">Offline tiles</span>
                  <span className="text-[11px]" style={{ color: '#8a8f9e' }}>
                    {dlState === 'done' ? '✓ Cached for offline use' : 'Iceland · zoom 7–12'}
                  </span>
                </div>
                <button
                  onClick={async () => {
                    if (dlState !== 'idle') return
                    setDlState('downloading')
                    setDlProgress(0)

                    // Fetch MapTiler key to cache tiles
                    let apiKey = ''
                    try {
                      const r = await fetch('/api/config')
                      const d = await r.json()
                      apiKey = d.maptilerKey || ''
                    } catch { /* ignore */ }

                    if (!apiKey) { setDlState('idle'); return }

                    // Cache a set of overview tiles for Iceland (zoom 7-9)
                    const tilesToCache: string[] = []
                    for (let z = 7; z <= 9; z++) {
                      const tileCount = Math.pow(2, z)
                      // Iceland approx tile range
                      const xMin = Math.floor(((-25 + 180) / 360) * tileCount)
                      const xMax = Math.floor(((-13 + 180) / 360) * tileCount)
                      const latRad = (lat: number) => (lat * Math.PI) / 180
                      const yMin = Math.floor((1 - Math.log(Math.tan(latRad(66.6)) + 1 / Math.cos(latRad(66.6))) / Math.PI) / 2 * tileCount)
                      const yMax = Math.floor((1 - Math.log(Math.tan(latRad(63.3)) + 1 / Math.cos(latRad(63.3))) / Math.PI) / 2 * tileCount)
                      for (let x = xMin; x <= xMax; x++) {
                        for (let y = yMin; y <= yMax; y++) {
                          tilesToCache.push(`https://api.maptiler.com/tiles/satellite/${z}/${x}/${y}.jpg?key=${apiKey}`)
                        }
                      }
                    }

                    try {
                      const cache = await caches.open('iceland-tiles-v1')
                      let done = 0
                      const total = tilesToCache.length
                      await Promise.all(
                        tilesToCache.map(async (url) => {
                          try {
                            if (!(await cache.match(url))) {
                              const res = await fetch(url)
                              if (res.ok) await cache.put(url, res)
                            }
                          } catch { /* skip failed tile */ }
                          done++
                          setDlProgress(Math.round((done / total) * 100))
                        })
                      )
                      setDlState('done')
                    } catch {
                      setDlState('idle')
                    }
                  }}
                  className="flex items-center gap-1 text-xs font-semibold"
                  style={{
                    color: dlState === 'done' ? '#10b981' : dlState === 'downloading' ? '#8a8f9e' : '#f5a623',
                    background: 'none', border: 'none', cursor: dlState === 'idle' ? 'pointer' : 'default',
                  }}
                >
                  {dlState === 'downloading' ? (
                    <span>{dlProgress}%</span>
                  ) : dlState === 'done' ? (
                    <span>✓ Done</span>
                  ) : (
                    <>
                      <Download size={13} />
                      Download
                    </>
                  )}
                </button>
              </div>

              {/* Download progress bar */}
              {dlState === 'downloading' && (
                <div style={{ height: 3, borderRadius: 99, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: 99, background: '#f5a623', width: `${dlProgress}%`, transition: 'width 0.2s' }} />
                </div>
              )}
            </div>
          </Section>

          {/* ────────────────────────────────────────────
              SECTION 2: Light Countdown
          ──────────────────────────────────────────── */}
          <Section icon={<Clock size={15} />} title="Light Countdown">
            {/* Current phase badge */}
            <div className="flex items-center justify-between">
              <span className="text-xs" style={{ color: '#8a8f9e' }}>Current</span>
              <span
                className="text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{
                  color: lightPhase.color,
                  background: `${lightPhase.color}22`,
                }}
              >
                {lightPhase.phase}
              </span>
            </div>

            {/* Divider */}
            <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)' }} />

            {/* Countdown rows */}
            <div className="flex flex-col gap-2">
              {countdownRows.map(row => (
                <CountdownRow key={row.label} {...row} />
              ))}
            </div>

            {/* Polar conditions note */}
            {(sunInfo.isMidnightSun || sunInfo.isPolarNight) && (
              <div
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg mt-1"
                style={{ background: 'rgba(74,158,255,0.12)' }}
              >
                <span className="text-sm">
                  {sunInfo.isMidnightSun ? '☀️' : '🌑'}
                </span>
                <span className="text-xs" style={{ color: '#4a9eff' }}>
                  {sunInfo.isMidnightSun
                    ? 'Midnight Sun — 24h daylight'
                    : 'Polar Night — no sunrise today'}
                </span>
              </div>
            )}
          </Section>

          {/* ────────────────────────────────────────────
              SECTION 3: Northern Lights
          ──────────────────────────────────────────── */}
          <Section icon={<Sparkles size={15} />} title="Northern Lights">
            {/* KP gauge */}
            <KpGauge kp={kp} />

            {/* KP value + label */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className="text-2xl font-bold tabular-nums"
                  style={{ color: kpColor }}
                >
                  {kp.toFixed(1)}
                </span>
                <div className="flex flex-col gap-0">
                  <span className="text-[10px] font-medium" style={{ color: '#8a8f9e' }}>
                    KP Index
                  </span>
                  <span
                    className="text-xs font-semibold"
                    style={{ color: kpColor }}
                  >
                    {kpLabel}
                  </span>
                </div>
              </div>

              {/* Tonight probability */}
              <div
                className="flex flex-col items-end gap-0.5 px-3 py-1.5 rounded-xl"
                style={{
                  background: 'rgba(0,255,136,0.08)',
                  border: '1px solid rgba(0,255,136,0.15)',
                }}
              >
                <span className="text-lg font-bold leading-none" style={{ color: '#00ff88' }}>
                  {auroraData.probability}%
                </span>
                <span className="text-[10px]" style={{ color: '#8a8f9e' }}>
                  Tonight
                </span>
              </div>
            </div>

            {/* Description */}
            <p className="text-[11px] leading-relaxed" style={{ color: '#8a8f9e' }}>
              {kpDesc}
            </p>

            {/* Best viewing time */}
            {auroraData.bestViewingTime && (
              <div className="flex items-center gap-2">
                <span className="text-sm">🌙</span>
                <span className="text-xs" style={{ color: '#8a8f9e' }}>
                  Best viewing:{' '}
                  <span className="font-semibold text-white">
                    {auroraData.bestViewingTime}
                  </span>
                </span>
              </div>
            )}

            {/* Cloud cover note */}
            {auroraData.cloudCover !== undefined && (
              <div className="flex items-center gap-2">
                <span className="text-sm">☁️</span>
                <span className="text-xs" style={{ color: '#8a8f9e' }}>
                  Cloud cover:{' '}
                  <span
                    className="font-semibold"
                    style={{
                      color: auroraData.cloudCover < 30
                        ? '#00ff88'
                        : auroraData.cloudCover < 70
                        ? '#f5a623'
                        : '#ef4444',
                    }}
                  >
                    {auroraData.cloudCover}%
                  </span>
                </span>
              </div>
            )}
          </Section>

          {/* ────────────────────────────────────────────
              SECTION 4: Map Light Direction
          ──────────────────────────────────────────── */}
          <Section icon={<Compass size={15} />} title="Map Light Direction">
            <ToggleSwitch
              checked={showSunBearing}
              onChange={onShowSunBearing}
              label="Show sun bearing lines on map"
              description="Displays directional overlay for the current sun azimuth"
            />

            {!selectedLocation && (
              <div
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg"
                style={{ background: 'rgba(255,255,255,0.04)' }}
              >
                <MapPin size={12} style={{ color: '#8a8f9e', flexShrink: 0 }} />
                <span className="text-[11px]" style={{ color: '#8a8f9e' }}>
                  Select a spot to see direction lines
                </span>
              </div>
            )}

            {selectedLocation && (
              <div className="flex items-center gap-2">
                <MapPin size={12} style={{ color: '#f5a623' }} />
                <span className="text-xs text-white font-medium">
                  {selectedLocation.name}
                </span>
                <span className="ml-auto text-xs tabular-nums" style={{ color: '#8a8f9e' }}>
                  Az {Math.round(sunInfo.azimuth)}°
                </span>
              </div>
            )}
          </Section>

          {/* ────────────────────────────────────────────
              SECTION 5: Cloud Cover Map
          ──────────────────────────────────────────── */}
          <Section icon={<span style={{ fontSize: 15 }}>☁️</span>} title="Cloud Cover Map">
            <ToggleSwitch
              checked={showCloudCover}
              onChange={onShowCloudCover}
              label="Show cloud cover on map"
              description="Overlay cloud density over Iceland for aurora planning"
            />

            {/* Cloud cover meter */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="text-xs" style={{ color: '#8a8f9e' }}>Current cloud cover</span>
                <span
                  className="text-sm font-bold tabular-nums"
                  style={{
                    color: weather.cloudCover < 30
                      ? '#06b6d4'
                      : weather.cloudCover < 70
                      ? '#94a3b8'
                      : '#64748b',
                  }}
                >
                  {Math.round(weather.cloudCover)}%
                </span>
              </div>

              {/* Visual bar */}
              <div
                className="relative w-full rounded-full overflow-hidden"
                style={{ height: 8, background: 'rgba(255,255,255,0.08)' }}
              >
                <div
                  className="absolute left-0 top-0 h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${weather.cloudCover}%`,
                    background: weather.cloudCover < 30
                      ? 'linear-gradient(to right,#06b6d4,#22d3ee)'
                      : weather.cloudCover < 70
                      ? 'linear-gradient(to right,#64748b,#94a3b8)'
                      : 'linear-gradient(to right,#475569,#64748b)',
                  }}
                />
              </div>

              {/* Label */}
              <span className="text-[11px]" style={{ color: '#8a8f9e' }}>
                {weather.cloudCover < 30
                  ? '✓ Clear skies — ideal for aurora viewing'
                  : weather.cloudCover < 70
                  ? '⚠ Partial clouds — aurora may be visible'
                  : '✗ Heavy cloud cover — aurora viewing poor'}
              </span>
            </div>
          </Section>

          {/* ────────────────────────────────────────────
              SECTION 6: App Settings
          ──────────────────────────────────────────── */}
          <Section icon={<Settings size={15} />} title="App Settings">
            {updateReady && (
              <style>{`
                @keyframes glow-pulse {
                  0%,100% { box-shadow: 0 0 8px 2px rgba(245,166,35,0.55); }
                  50%      { box-shadow: 0 0 20px 6px rgba(245,166,35,0.9); }
                }
              `}</style>
            )}
            <button
              onClick={() => window.location.reload()}
              className="flex items-center justify-center gap-2 w-full rounded-lg py-2.5 text-sm font-semibold"
              style={updateReady ? {
                background: '#f5a623',
                border: '1px solid #f5a623',
                color: '#0a0b0e',
                animation: 'glow-pulse 2s ease-in-out infinite',
              } : {
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: '#e2e4ea',
              }}
            >
              <span>{updateReady ? '✨' : '↻'}</span>
              {updateReady ? 'Update Ready — Tap to Reload' : 'Refresh App'}
            </button>
          </Section>

        </div>
      </div>

      {/* Hide scrollbar in webkit */}
      <style>{`
        [role="dialog"] .overflow-y-auto::-webkit-scrollbar { display: none; }
      `}</style>
    </>
  )
}
