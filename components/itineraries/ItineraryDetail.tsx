'use client'
import { ArrowLeft, Moon, Clock, Navigation, MapPin, AlertTriangle, Calendar, Gauge } from 'lucide-react'

import { type Itinerary, type ItineraryStop } from '@/data/itineraries'

interface ItineraryDetailProps {
  itinerary: Itinerary
  onBack: () => void
}

function difficultyColor(d: Itinerary['difficulty']): string {
  if (d === 'Easy') return '#10b981'
  if (d === 'Moderate') return '#f5a623'
  return '#ef4444'
}

function formatDriveTime(minutes: number): string {
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}min` : `${h}h`
}

function DriveBadge({ km, minutes, color }: { km: number; minutes: number; color: string }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '6px 0',
        position: 'relative',
      }}
    >
      {/* Vertical line */}
      <div
        style={{
          width: 1,
          height: 10,
          backgroundColor: 'rgba(255,255,255,0.1)',
        }}
      />
      {/* Badge */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          backgroundColor: 'rgba(18,20,28,0.95)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 20,
          padding: '4px 12px',
          fontSize: 11,
          color: '#8a8f9e',
        }}
      >
        <Navigation size={10} color={color} />
        <span style={{ color: '#ffffff', fontWeight: 600 }}>{km} km</span>
        <span>·</span>
        <Clock size={10} color="#5a5f6e" />
        <span>{formatDriveTime(minutes)}</span>
      </div>
      {/* Vertical line */}
      <div
        style={{
          width: 1,
          height: 10,
          backgroundColor: 'rgba(255,255,255,0.1)',
        }}
      />
    </div>
  )
}

function StopCard({ stop, color, isLast }: { stop: ItineraryStop; color: string; isLast: boolean }) {
  return (
    <div
      style={{
        backgroundColor: 'rgba(18,20,28,0.95)',
        borderRadius: 14,
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.06)',
        position: 'relative',
      }}
    >
      {/* Left accent bar */}
      {stop.overnight && (
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: 3,
            backgroundColor: color,
            borderRadius: '14px 0 0 14px',
          }}
        />
      )}

      <div style={{ display: 'flex', gap: 0 }}>
        {/* Thumbnail */}
        <div
          style={{
            width: 88,
            minHeight: 88,
            flexShrink: 0,
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <img
            src={stop.thumbnail}
            alt={stop.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
              minHeight: 88,
            }}
          />
        </div>

        {/* Info */}
        <div style={{ flex: 1, padding: '10px 12px 10px 10px', minWidth: 0 }}>
          {/* Name + overnight badge */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 6, marginBottom: 3 }}>
            <span
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: '#ffffff',
                lineHeight: 1.2,
                flex: 1,
              }}
            >
              {stop.name}
            </span>
            {stop.overnight && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 3,
                  backgroundColor: `${color}22`,
                  border: `1px solid ${color}44`,
                  borderRadius: 8,
                  padding: '2px 6px',
                  flexShrink: 0,
                }}
              >
                <Moon size={9} color={color} />
                <span style={{ fontSize: 9, color: color, fontWeight: 600, whiteSpace: 'nowrap' }}>
                  Stay here
                </span>
              </div>
            )}
          </div>

          {/* Time to spend */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6 }}>
            <Clock size={10} color="#5a5f6e" />
            <span style={{ fontSize: 11, color: '#5a5f6e' }}>{stop.recommendedTime}</span>
          </div>

          {/* Highlights */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {stop.highlights.slice(0, 3).map((h, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 5 }}>
                <span style={{ color: color, fontSize: 10, marginTop: 1, flexShrink: 0 }}>·</span>
                <span style={{ fontSize: 11, color: '#8a8f9e', lineHeight: 1.4 }}>{h}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Description (collapsed by default — shown on expansion idea, keep simple for now) */}
    </div>
  )
}

export default function ItineraryDetail({ itinerary, onBack }: ItineraryDetailProps) {
  // Group stops by day
  const byDay = itinerary.stops.reduce<Record<number, ItineraryStop[]>>((acc, stop) => {
    if (!acc[stop.day]) acc[stop.day] = []
    acc[stop.day].push(stop)
    return acc
  }, {})
  const days = Object.keys(byDay).map(Number).sort((a, b) => a - b)

  const totalDriveKm = itinerary.stops.reduce((sum, s) => sum + (s.driveFromPrev?.km ?? 0), 0)
  const totalDriveMin = itinerary.stops.reduce((sum, s) => sum + (s.driveFromPrev?.minutes ?? 0), 0)

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        backgroundColor: '#0a0b0e',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        overflowY: 'auto',
      }}
    >
      {/* Sticky header */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          backgroundColor: 'rgba(10,11,14,0.97)',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '0 16px',
          height: 56,
          flexShrink: 0,
        }}
      >
        <button
          onClick={onBack}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 32,
            height: 32,
            borderRadius: 8,
            color: '#ffffff',
            flexShrink: 0,
          }}
        >
          <ArrowLeft size={20} />
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 16 }}>{itinerary.icon}</span>
            <span
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: '#ffffff',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {itinerary.name}
            </span>
          </div>
        </div>
      </div>

      {/* Hero section */}
      <div style={{ position: 'relative', height: 180, flexShrink: 0, overflow: 'hidden' }}>
        <img
          src={itinerary.coverImage}
          alt={itinerary.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to bottom, rgba(10,11,14,0.1) 0%, rgba(10,11,14,0.85) 100%)',
          }}
        />
        <div style={{ position: 'absolute', bottom: 16, left: 16, right: 16 }}>
          <p style={{ margin: '0 0 4px', fontSize: 13, color: 'rgba(255,255,255,0.75)' }}>
            {itinerary.tagline}
          </p>
          <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>
            {itinerary.description}
          </p>
        </div>
      </div>

      {/* Stats bar */}
      <div
        style={{
          display: 'flex',
          gap: 0,
          backgroundColor: 'rgba(18,20,28,0.95)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          flexShrink: 0,
        }}
      >
        {[
          { icon: <Clock size={14} color={itinerary.color} />, label: 'Duration', value: `${itinerary.days} days` },
          { icon: <Navigation size={14} color={itinerary.color} />, label: 'Distance', value: `~${itinerary.totalKm.toLocaleString()} km` },
          { icon: <Gauge size={14} color={difficultyColor(itinerary.difficulty)} />, label: 'Difficulty', value: itinerary.difficulty, valueColor: difficultyColor(itinerary.difficulty) },
          { icon: <Calendar size={14} color={itinerary.color} />, label: 'Seasons', value: itinerary.seasons.length === 4 ? 'All year' : itinerary.seasons.join(', ') },
        ].map((stat, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '10px 4px',
              borderRight: i < 3 ? '1px solid rgba(255,255,255,0.06)' : 'none',
            }}
          >
            {stat.icon}
            <span style={{ fontSize: 8, color: '#5a5f6e', marginTop: 3, textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>
              {stat.label}
            </span>
            <span style={{ fontSize: 11, fontWeight: 700, color: stat.valueColor ?? '#ffffff', marginTop: 1, textAlign: 'center' }}>
              {stat.value}
            </span>
          </div>
        ))}
      </div>

      {/* 4WD Warning */}
      {itinerary.requiresFourWD && (
        <div
          style={{
            margin: '12px 16px 0',
            backgroundColor: 'rgba(245,166,35,0.1)',
            border: '1px solid rgba(245,166,35,0.3)',
            borderRadius: 10,
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 10,
          }}
        >
          <AlertTriangle size={16} color="#f5a623" style={{ flexShrink: 0, marginTop: 1 }} />
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#f5a623', marginBottom: 2 }}>
              4WD Vehicle Required
            </div>
            <div style={{ fontSize: 11, color: '#8a8f9e', lineHeight: 1.5 }}>
              F-roads are only open mid-June to mid-September. A standard car will be turned back or damaged. Always check road.is before departing.
            </div>
          </div>
        </div>
      )}

      {/* Day-by-day timeline */}
      <div style={{ padding: '16px 16px 40px' }}>
        {days.map((day) => {
          const stops = byDay[day]
          return (
            <div key={day} style={{ marginBottom: 24 }}>
              {/* Day divider */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  marginBottom: 12,
                }}
              >
                <div
                  style={{
                    backgroundColor: itinerary.color,
                    color: '#0a0b0e',
                    fontSize: 11,
                    fontWeight: 800,
                    padding: '4px 12px',
                    borderRadius: 20,
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase' as const,
                    whiteSpace: 'nowrap',
                  }}
                >
                  Day {day}
                </div>
                <div style={{ flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.06)' }} />
                <span style={{ fontSize: 11, color: '#5a5f6e', whiteSpace: 'nowrap' }}>
                  {stops.filter(s => s.driveFromPrev).reduce((sum, s) => sum + (s.driveFromPrev?.km ?? 0), 0)} km driving
                </span>
              </div>

              {/* Stops for this day */}
              <div>
                {stops.map((stop, idx) => (
                  <div key={stop.id}>
                    {/* Drive badge (not for first stop of first day) */}
                    {stop.driveFromPrev && (
                      <DriveBadge
                        km={stop.driveFromPrev.km}
                        minutes={stop.driveFromPrev.minutes}
                        color={itinerary.color}
                      />
                    )}
                    {/* Start dot for very first stop */}
                    {!stop.driveFromPrev && day === days[0] && idx === 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <div
                          style={{
                            width: 10,
                            height: 10,
                            borderRadius: '50%',
                            backgroundColor: itinerary.color,
                            marginLeft: 2,
                          }}
                        />
                        <span style={{ fontSize: 11, color: '#5a5f6e' }}>Start here</span>
                      </div>
                    )}
                    <StopCard
                      stop={stop}
                      color={itinerary.color}
                      isLast={idx === stops.length - 1}
                    />
                  </div>
                ))}
              </div>
            </div>
          )
        })}

        {/* Summary footer */}
        <div
          style={{
            backgroundColor: 'rgba(18,20,28,0.95)',
            borderRadius: 14,
            padding: '14px 16px',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 700, color: '#ffffff', marginBottom: 8 }}>
            Trip Summary
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[
              [`${itinerary.stops.length} locations`, 'Stops on this route'],
              [`~${itinerary.totalKm.toLocaleString()} km`, 'Total distance'],
              [formatDriveTime(totalDriveMin), 'Total driving time'],
              [itinerary.seasons.join(', '), 'Best seasons'],
            ].map(([val, label]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: '#8a8f9e' }}>{label}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#ffffff' }}>{val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
