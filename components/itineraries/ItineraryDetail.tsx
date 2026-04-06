'use client'

import { ArrowLeft, Moon, Clock, Navigation, AlertTriangle, MapPin } from 'lucide-react'
import type { Itinerary, ItineraryStop } from '@/data/itineraries'

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
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4px 0' }}>
      <div style={{ width: 1, height: 12, backgroundColor: 'rgba(255,255,255,0.08)' }} />
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          backgroundColor: 'rgba(18,20,28,0.95)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 20,
          padding: '4px 14px',
          fontSize: 11,
          color: '#8a8f9e',
        }}
      >
        <Navigation size={10} color={color} />
        <span style={{ color: '#ffffff', fontWeight: 600 }}>{km} km</span>
        <span style={{ opacity: 0.4 }}>·</span>
        <Clock size={10} color="#5a5f6e" />
        <span>{formatDriveTime(minutes)}</span>
      </div>
      <div style={{ width: 1, height: 12, backgroundColor: 'rgba(255,255,255,0.08)' }} />
    </div>
  )
}

function StopCard({ stop, color }: { stop: ItineraryStop; color: string }) {
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
      <div style={{ display: 'flex' }}>
        {/* Thumbnail */}
        <div style={{ width: 90, minHeight: 90, flexShrink: 0, overflow: 'hidden' }}>
          <img
            src={stop.thumbnail}
            alt={stop.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', minHeight: 90 }}
          />
        </div>
        {/* Info */}
        <div style={{ flex: 1, padding: '10px 12px 10px 10px', minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 6, marginBottom: 3 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#ffffff', lineHeight: 1.2, flex: 1 }}>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6 }}>
            <Clock size={10} color="#5a5f6e" />
            <span style={{ fontSize: 11, color: '#5a5f6e' }}>{stop.recommendedTime}</span>
          </div>
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
    </div>
  )
}

export default function ItineraryDetail({ itinerary, onBack }: ItineraryDetailProps) {
  const byDay = itinerary.stops.reduce<Record<number, ItineraryStop[]>>((acc, stop) => {
    if (!acc[stop.day]) acc[stop.day] = []
    acc[stop.day].push(stop)
    return acc
  }, {})
  const days = Object.keys(byDay).map(Number).sort((a, b) => a - b)
  const totalDriveMin = itinerary.stops.reduce((sum, s) => sum + (s.driveFromPrev?.minutes ?? 0), 0)

  return (
    <div
      style={{
        backgroundColor: '#0a0b0e',
        minHeight: '100%',
        fontFamily: 'system-ui, -apple-system, sans-serif',
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
          }}
        >
          <ArrowLeft size={20} />
        </button>
        <span style={{ fontSize: 16 }}>{itinerary.icon}</span>
        <span style={{ fontSize: 15, fontWeight: 700, color: '#ffffff', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {itinerary.name}
        </span>
      </div>

      {/* Hero */}
      <div style={{ position: 'relative', height: 190, overflow: 'hidden' }}>
        <img
          src={itinerary.coverImage}
          alt={itinerary.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(10,11,14,0.1) 0%, rgba(10,11,14,0.88) 100%)' }} />
        <div style={{ position: 'absolute', bottom: 14, left: 16, right: 16 }}>
          <p style={{ margin: '0 0 3px', fontSize: 13, color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>
            {itinerary.tagline}
          </p>
          <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>
            {itinerary.description}
          </p>
        </div>
      </div>

      {/* Stats bar */}
      <div style={{ display: 'flex', backgroundColor: 'rgba(18,20,28,0.95)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        {[
          { label: 'Duration', value: `${itinerary.days} days`, color: itinerary.color },
          { label: 'Distance', value: `~${itinerary.totalKm.toLocaleString()} km`, color: itinerary.color },
          { label: 'Difficulty', value: itinerary.difficulty, color: difficultyColor(itinerary.difficulty) },
          { label: 'Season', value: itinerary.seasons.length === 4 ? 'All year' : itinerary.seasons[0] + (itinerary.seasons.length > 1 ? '+' : ''), color: itinerary.color },
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
            <span style={{ fontSize: 11, fontWeight: 700, color: stat.color, marginBottom: 2 }}>
              {stat.value}
            </span>
            <span style={{ fontSize: 9, color: '#5a5f6e', textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>
              {stat.label}
            </span>
          </div>
        ))}
      </div>

      {/* 4WD warning */}
      {itinerary.requiresFourWD && (
        <div
          style={{
            margin: '12px 16px 0',
            backgroundColor: 'rgba(245,166,35,0.08)',
            border: '1px solid rgba(245,166,35,0.25)',
            borderRadius: 10,
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 10,
          }}
        >
          <AlertTriangle size={15} color="#f5a623" />
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#f5a623', marginBottom: 2 }}>
              4WD Required
            </div>
            <div style={{ fontSize: 11, color: '#8a8f9e', lineHeight: 1.5 }}>
              F-roads open mid-June to mid-September only. Check road.is before departing.
            </div>
          </div>
        </div>
      )}

      {/* Day timeline */}
      <div style={{ padding: '16px 16px 48px' }}>
        {days.map((day) => {
          const stops = byDay[day]
          const dayDriveKm = stops.reduce((sum, s) => sum + (s.driveFromPrev?.km ?? 0), 0)
          return (
            <div key={day} style={{ marginBottom: 28 }}>
              {/* Day header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <div
                  style={{
                    backgroundColor: itinerary.color,
                    color: '#0a0b0e',
                    fontSize: 11,
                    fontWeight: 800,
                    padding: '4px 14px',
                    borderRadius: 20,
                    textTransform: 'uppercase' as const,
                    letterSpacing: '0.06em',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Day {day}
                </div>
                <div style={{ flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.06)' }} />
                {dayDriveKm > 0 && (
                  <span style={{ fontSize: 11, color: '#5a5f6e', whiteSpace: 'nowrap' }}>
                    {dayDriveKm} km
                  </span>
                )}
              </div>

              {/* Stops */}
              <div>
                {stops.map((stop, idx) => (
                  <div key={stop.id}>
                    {stop.driveFromPrev && (
                      <DriveBadge
                        km={stop.driveFromPrev.km}
                        minutes={stop.driveFromPrev.minutes}
                        color={itinerary.color}
                      />
                    )}
                    {!stop.driveFromPrev && day === days[0] && idx === 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: itinerary.color, marginLeft: 2 }} />
                        <span style={{ fontSize: 11, color: '#5a5f6e' }}>Start here</span>
                      </div>
                    )}
                    <StopCard stop={stop} color={itinerary.color} />
                  </div>
                ))}
              </div>
            </div>
          )
        })}

        {/* Summary */}
        <div
          style={{
            backgroundColor: 'rgba(18,20,28,0.95)',
            borderRadius: 14,
            padding: '14px 16px',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 700, color: '#ffffff', marginBottom: 10 }}>
            Trip Summary
          </div>
          {[
            [`${itinerary.stops.length} stops`, 'Locations on this route'],
            [`~${itinerary.totalKm.toLocaleString()} km`, 'Total distance'],
            [formatDriveTime(totalDriveMin), 'Total driving time'],
            [itinerary.seasons.join(', '), 'Best seasons'],
          ].map(([val, label]) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
              <span style={{ fontSize: 12, color: '#8a8f9e' }}>{label}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#ffffff' }}>{val}</span>
            </div>
          ))}
        </div>

        {/* Tip */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginTop: 16 }}>
          <MapPin size={13} color="#5a5f6e" style={{ marginTop: 1, flexShrink: 0 }} />
          <p style={{ margin: 0, fontSize: 11, color: '#3a3f4e', lineHeight: 1.6 }}>
            All drive times assume good weather and road.is green status. Always allow extra time in winter and check safetravel.is before F-road trips.
          </p>
        </div>
      </div>
    </div>
  )
}
