'use client'

import { Sunrise, Sunset, Moon, Sun } from 'lucide-react'
import { SunInfo } from '@/types'
import { formatTime, getCountdown, getCurrentLightPhase } from '@/lib/suncalc-utils'

interface LightCountdownProps {
  sunInfo: SunInfo
}

interface LightEvent {
  key: string
  label: string
  time: Date | undefined
  icon: React.ReactNode
}

function isValidDate(d: Date | undefined): d is Date {
  return !!d && !isNaN(d.getTime())
}

function getCountdownMs(target: Date): number {
  return target.getTime() - Date.now()
}

function CountdownText({ target }: { target: Date }) {
  const ms = getCountdownMs(target)
  const isClose = ms > 0 && ms < 2 * 3600 * 1000
  const text = ms <= 0 ? 'passed' : getCountdown(target)
  return (
    <span
      style={{
        fontSize: 12,
        fontWeight: 600,
        color: ms <= 0 ? '#5a5f6e' : isClose ? '#f5a623' : '#ffffff',
        minWidth: 60,
        textAlign: 'right',
      }}
    >
      {text}
    </span>
  )
}

function buildTomorrowDawn(sunInfo: SunInfo): Date | undefined {
  const tomorrow = new Date(sunInfo.date)
  tomorrow.setDate(tomorrow.getDate() + 1)
  // Best estimate: use same time-of-day offset as today's dawn
  if (!isValidDate(sunInfo.dawn)) return undefined
  const tomorrowDawn = new Date(sunInfo.dawn)
  tomorrowDawn.setDate(tomorrowDawn.getDate() + 1)
  return tomorrowDawn
}

export default function LightCountdown({ sunInfo }: LightCountdownProps) {
  const { phase: currentPhase, color: phaseColor } = getCurrentLightPhase(sunInfo)

  if (sunInfo.isMidnightSun) {
    return (
      <div
        style={{
          backgroundColor: 'rgba(18,20,28,0.95)',
          borderRadius: 14,
          padding: '16px',
          border: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#ffffff' }}>Current</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#f5a623' }}>Midnight Sun</span>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '14px',
            backgroundColor: 'rgba(245,166,35,0.08)',
            borderRadius: 10,
            border: '1px solid rgba(245,166,35,0.2)',
          }}
        >
          <Sun size={20} color="#f5a623" />
          <span style={{ fontSize: 14, color: '#f5a623', fontWeight: 600 }}>
            ☀️ Midnight Sun — No darkness tonight
          </span>
        </div>
      </div>
    )
  }

  if (sunInfo.isPolarNight) {
    return (
      <div
        style={{
          backgroundColor: 'rgba(18,20,28,0.95)',
          borderRadius: 14,
          padding: '16px',
          border: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#ffffff' }}>Current</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#4a9eff' }}>Polar Night</span>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '14px',
            backgroundColor: 'rgba(74,158,255,0.08)',
            borderRadius: 10,
            border: '1px solid rgba(74,158,255,0.2)',
          }}
        >
          <Moon size={20} color="#4a9eff" />
          <span style={{ fontSize: 14, color: '#4a9eff', fontWeight: 600 }}>
            🌑 Polar Night — No sunrise today
          </span>
        </div>
      </div>
    )
  }

  const tomorrowDawn = buildTomorrowDawn(sunInfo)

  const events: LightEvent[] = [
    {
      key: 'golden-am',
      label: 'Golden hour AM',
      time: sunInfo.goldenHourEnd,
      icon: <Sunrise size={15} color="#f5a623" />,
    },
    {
      key: 'golden-pm',
      label: 'Golden hour PM',
      time: sunInfo.goldenHour,
      icon: <Sunset size={15} color="#f5a623" />,
    },
    {
      key: 'sunset',
      label: 'Sunset',
      time: sunInfo.sunset,
      icon: <Sunset size={15} color="#ef4444" />,
    },
    {
      key: 'night',
      label: 'Night',
      time: sunInfo.night,
      icon: <Moon size={15} color="#4a9eff" />,
    },
    {
      key: 'dawn-tomorrow',
      label: 'Dawn (tomorrow)',
      time: tomorrowDawn,
      icon: <Moon size={15} color="#8b5cf6" />,
    },
  ]

  // Filter to valid dates and sort by time
  const validEvents = events
    .filter((e) => isValidDate(e.time))
    .sort((a, b) => (a.time as Date).getTime() - (b.time as Date).getTime())

  return (
    <div
      style={{
        backgroundColor: 'rgba(18,20,28,0.95)',
        borderRadius: 14,
        border: '1px solid rgba(255,255,255,0.06)',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '14px 16px 10px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 700, color: '#ffffff' }}>Current</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: phaseColor }}>{currentPhase}</span>
      </div>

      {/* Divider label row */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: '6px 16px',
          backgroundColor: 'rgba(255,255,255,0.02)',
        }}
      >
        <span style={{ fontSize: 10, color: '#5a5f6e', fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase' }}>
          Event
        </span>
        <div style={{ display: 'flex', gap: 24 }}>
          <span style={{ fontSize: 10, color: '#5a5f6e', fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase' }}>
            Time
          </span>
          <span style={{ fontSize: 10, color: '#5a5f6e', fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', minWidth: 60, textAlign: 'right' }}>
            In
          </span>
        </div>
      </div>

      {/* Event rows */}
      {validEvents.map((event, index) => {
        const isPast = getCountdownMs(event.time as Date) <= 0
        return (
          <div
            key={event.key}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '11px 16px',
              borderTop: index > 0 ? '1px solid rgba(255,255,255,0.04)' : undefined,
              opacity: isPast ? 0.45 : 1,
            }}
          >
            <div style={{ flexShrink: 0 }}>{event.icon}</div>
            <span
              style={{
                flex: 1,
                fontSize: 13,
                color: isPast ? '#5a5f6e' : '#ffffff',
                fontWeight: 500,
              }}
            >
              {event.label}
            </span>
            <span
              style={{
                fontSize: 13,
                color: '#8a8f9e',
                fontVariantNumeric: 'tabular-nums',
                marginRight: 16,
                minWidth: 38,
                textAlign: 'right',
              }}
            >
              {formatTime(event.time)}
            </span>
            <CountdownText target={event.time as Date} />
          </div>
        )
      })}
    </div>
  )
}
