'use client'

import { useState, useEffect, useRef } from 'react'
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
import { SunInfo, AuroraData, Location } from '@/types'
import { formatTime, getCountdown, getCurrentLightPhase } from '@/lib/suncalc-utils'
import { getKpColor, getKpLabel, getAuroraDescription } from '@/lib/aurora'

interface ToolsDrawerProps {
  isOpen: boolean
  onClose: () => void
  sunInfo: SunInfo
  auroraData: AuroraData
  selectedLocation?: Location | null
  onShowSunBearing: (show: boolean) => void
  showSunBearing: boolean
}

// ── Internal sub-components ─────────────────────────────────────────────────

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
  selectedLocation,
  onShowSunBearing,
  showSunBearing,
}: ToolsDrawerProps) {
  const [fromMode, setFromMode] = useState<'current' | 'start'>('current')
  const [searchValue, setSearchValue] = useState('')
  const drawerRef = useRef<HTMLDivElement>(null)

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
            {/* FROM row */}
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-semibold tracking-wider uppercase" style={{ color: '#8a8f9e' }}>
                From
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setFromMode('current')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                  style={{
                    background: fromMode === 'current' ? 'transparent' : 'transparent',
                    border: fromMode === 'current'
                      ? '1px solid #f5a623'
                      : '1px solid rgba(255,255,255,0.12)',
                    color: fromMode === 'current' ? '#f5a623' : '#8a8f9e',
                  }}
                >
                  <LocateFixed size={12} />
                  Current Location
                </button>
                <button
                  onClick={() => setFromMode('start')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                  style={{
                    background: 'transparent',
                    border: fromMode === 'start'
                      ? '1px solid #f5a623'
                      : '1px solid rgba(255,255,255,0.12)',
                    color: fromMode === 'start' ? '#f5a623' : '#8a8f9e',
                  }}
                >
                  <MapPin size={12} />
                  Start
                </button>
              </div>
            </div>

            {/* DESTINATION search */}
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-semibold tracking-wider uppercase" style={{ color: '#8a8f9e' }}>
                Destination
              </span>
              <div
                className="flex items-center gap-2 px-2.5 rounded-lg"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  height: '36px',
                }}
              >
                <Search size={13} style={{ color: '#8a8f9e', flexShrink: 0 }} />
                <input
                  type="text"
                  value={searchValue}
                  onChange={e => setSearchValue(e.target.value)}
                  placeholder="Search spots, waterfalls..."
                  className="flex-1 bg-transparent text-xs outline-none placeholder:text-[#4b5563] text-white"
                />
              </div>
            </div>

            {/* Offline tiles */}
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-medium text-white">Offline tiles</span>
                <span className="text-[11px]" style={{ color: '#8a8f9e' }}>
                  zoom 8–13 · ~120 MB
                </span>
              </div>
              <button
                className="flex items-center gap-1 text-xs font-semibold transition-colors"
                style={{ color: '#f5a623' }}
              >
                <Download size={13} />
                Download
              </button>
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
              SECTION 5: App Settings
          ──────────────────────────────────────────── */}
          <Section icon={<Settings size={15} />} title="App Settings">
            <button
              onClick={() => window.location.reload()}
              className="flex items-center justify-center gap-2 w-full rounded-lg py-2.5 text-sm font-semibold transition-colors"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: '#e2e4ea',
              }}
            >
              <span>↻</span>
              Refresh App
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
