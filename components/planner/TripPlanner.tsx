'use client'

import { useState, useCallback } from 'react'
import { MapPin, Trash2, Copy, CheckCheck, Plus, ChevronDown, ChevronUp } from 'lucide-react'
import type { CustomTripStop } from '@/types'
import { saveTrip, clearTrip, formatTripAsText } from '@/data/custom-trip'
import TripStopCard from './TripStopCard'
import { estimateCost, type CostPrefs, type VehicleType, type AccomType, type FoodBudget } from '@/lib/cost-estimator'

interface TripPlannerProps {
  stops: CustomTripStop[]
  onStopsChange: (stops: CustomTripStop[]) => void
  onSwitchToSpots: () => void
}

const DAY_COLORS = ['#4a9eff', '#f5a623', '#10b981', '#8b5cf6', '#ef4444', '#06b6d4', '#fbbf24', '#f97316']
const getDayColor = (day: number) => DAY_COLORS[(day - 1) % DAY_COLORS.length]

const VEHICLE_OPTIONS: { id: VehicleType; label: string }[] = [
  { id: 'small-car', label: 'Small Car' },
  { id: 'suv', label: 'SUV' },
  { id: 'campervan', label: 'Campervan' },
  { id: '4wd', label: '4WD' },
]
const ACCOM_OPTIONS: { id: AccomType; label: string }[] = [
  { id: 'camping', label: 'Camping' },
  { id: 'guesthouse', label: 'Guesthouse' },
  { id: 'hotel', label: 'Hotel' },
  { id: 'luxury', label: 'Luxury' },
]
const FOOD_OPTIONS: { id: FoodBudget; label: string }[] = [
  { id: 'self-catering', label: 'Self-catering' },
  { id: 'mixed', label: 'Mixed' },
  { id: 'restaurants', label: 'Restaurants' },
]

export default function TripPlanner({ stops, onStopsChange, onSwitchToSpots }: TripPlannerProps) {
  const [copied, setCopied] = useState(false)
  const [collapsedDays, setCollapsedDays] = useState<Set<number>>(new Set())
  const [costOpen, setCostOpen] = useState(false)
  const [costPrefs, setCostPrefs] = useState<CostPrefs>({ vehicle: 'small-car', accommodation: 'guesthouse', food: 'mixed' })

  const byDay = stops.reduce<Record<number, CustomTripStop[]>>((acc, s) => {
    if (!acc[s.day]) acc[s.day] = []
    acc[s.day].push(s)
    return acc
  }, {})
  const days = Object.keys(byDay).map(Number).sort((a, b) => a - b)
  const totalKm = stops.reduce((s, stop) => s + (stop.driveFromPrev?.km ?? 0), 0)
  const totalDriveMin = stops.reduce((s, stop) => s + (stop.driveFromPrev?.minutes ?? 0), 0)

  const handleRemove = useCallback((id: string) => {
    const updated = stops.filter((s) => s.id !== id)
    onStopsChange(updated)
    saveTrip(updated)
  }, [stops, onStopsChange])

  const handleClear = useCallback(() => {
    onStopsChange([])
    clearTrip()
  }, [onStopsChange])

  const handleCopy = useCallback(async () => {
    const text = formatTripAsText(stops)
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback: no-op
    }
  }, [stops])

  const moveToDay = useCallback((stopId: string, newDay: number) => {
    const updated = stops.map((s) => s.id === stopId ? { ...s, day: newDay } : s)
    onStopsChange(updated)
    saveTrip(updated)
  }, [stops, onStopsChange])

  const toggleDay = (day: number) => {
    setCollapsedDays((prev) => {
      const next = new Set(prev)
      if (next.has(day)) next.delete(day)
      else next.add(day)
      return next
    })
  }

  // Empty state
  if (stops.length === 0) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 24px', gap: 16, textAlign: 'center' }}>
        <div style={{ fontSize: 48 }}>🗺️</div>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 6 }}>Build Your Iceland Trip</div>
          <div style={{ fontSize: 13, color: '#8a8f9e', lineHeight: 1.6 }}>
            Browse the Spots tab and tap <strong style={{ color: '#f5a623' }}>+ Add to Trip</strong> to start planning. Drive times between stops are calculated automatically.
          </div>
        </div>
        <button
          onClick={onSwitchToSpots}
          style={{ display: 'flex', alignItems: 'center', gap: 8, backgroundColor: '#f5a623', color: '#0a0b0e', border: 'none', borderRadius: 12, padding: '11px 20px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
        >
          <Plus size={16} />
          Browse Spots
        </button>
        <div style={{ fontSize: 11, color: '#5a5f6e', maxWidth: 260, lineHeight: 1.6 }}>
          You can also add spots directly from the map by tapping a location pin.
        </div>
      </div>
    )
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Stats bar */}
      <div style={{ flexShrink: 0, display: 'flex', backgroundColor: 'rgba(18,20,28,0.95)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        {[
          { label: 'Stops', value: stops.length.toString() },
          { label: 'Days', value: days.length.toString() },
          { label: 'Distance', value: `~${totalKm} km` },
          { label: 'Drive time', value: totalDriveMin < 60 ? `${totalDriveMin}min` : `~${Math.round(totalDriveMin / 60)}h` },
        ].map((stat, i) => (
          <div key={stat.label} style={{ flex: 1, textAlign: 'center', padding: '10px 4px', borderRight: i < 3 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#f5a623' }}>{stat.value}</div>
            <div style={{ fontSize: 9, color: '#5a5f6e', textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Action buttons */}
      <div style={{ flexShrink: 0, display: 'flex', gap: 8, padding: '10px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <button
          onClick={onSwitchToSpots}
          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: 'rgba(245,166,35,0.12)', border: '1px solid rgba(245,166,35,0.3)', borderRadius: 10, padding: '9px 12px', fontSize: 12, fontWeight: 600, color: '#f5a623', cursor: 'pointer' }}
        >
          <Plus size={13} />
          Add Spots
        </button>
        <button
          onClick={handleCopy}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, backgroundColor: 'rgba(74,158,255,0.1)', border: '1px solid rgba(74,158,255,0.25)', borderRadius: 10, padding: '9px 14px', fontSize: 12, fontWeight: 600, color: copied ? '#10b981' : '#4a9eff', cursor: 'pointer', whiteSpace: 'nowrap' }}
        >
          {copied ? <CheckCheck size={13} /> : <Copy size={13} />}
          {copied ? 'Copied!' : 'Export'}
        </button>
        <button
          onClick={handleClear}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, backgroundColor: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, padding: '9px 14px', fontSize: 12, fontWeight: 600, color: '#ef4444', cursor: 'pointer', whiteSpace: 'nowrap' }}
        >
          <Trash2 size={13} />
          Clear
        </button>
      </div>

      {/* Cost Estimate (show when 2+ stops) */}
      {stops.length >= 2 && (
        <div style={{ flexShrink: 0, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <button
            onClick={() => setCostOpen((v) => !v)}
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <span style={{ fontSize: 13, fontWeight: 600, color: '#f5a623' }}>💰 Cost Estimate</span>
            {costOpen ? <ChevronUp size={14} color="#5a5f6e" /> : <ChevronDown size={14} color="#5a5f6e" />}
          </button>
          {costOpen && (() => {
            const breakdown = estimateCost(stops, costPrefs)
            const pillStyle = (active: boolean): React.CSSProperties => ({
              borderRadius: 9999, padding: '3px 10px', fontSize: 11, fontWeight: active ? 600 : 400,
              background: active ? 'rgba(245,166,35,0.2)' : 'rgba(255,255,255,0.06)',
              color: active ? '#f5a623' : '#8a8f9e', border: active ? '1px solid rgba(245,166,35,0.4)' : '1px solid transparent',
              cursor: 'pointer',
            })
            return (
              <div style={{ padding: '0 14px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {/* Vehicle */}
                <div>
                  <div style={{ fontSize: 10, color: '#5a5f6e', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>🚗 Vehicle</div>
                  <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                    {VEHICLE_OPTIONS.map(({ id, label }) => (
                      <button key={id} onClick={() => setCostPrefs((p) => ({ ...p, vehicle: id }))} style={pillStyle(costPrefs.vehicle === id)}>{label}</button>
                    ))}
                  </div>
                </div>
                {/* Accommodation */}
                <div>
                  <div style={{ fontSize: 10, color: '#5a5f6e', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>🏕 Stay</div>
                  <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                    {ACCOM_OPTIONS.map(({ id, label }) => (
                      <button key={id} onClick={() => setCostPrefs((p) => ({ ...p, accommodation: id }))} style={pillStyle(costPrefs.accommodation === id)}>{label}</button>
                    ))}
                  </div>
                </div>
                {/* Food */}
                <div>
                  <div style={{ fontSize: 10, color: '#5a5f6e', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>🍽 Food</div>
                  <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                    {FOOD_OPTIONS.map(({ id, label }) => (
                      <button key={id} onClick={() => setCostPrefs((p) => ({ ...p, food: id }))} style={pillStyle(costPrefs.food === id)}>{label}</button>
                    ))}
                  </div>
                </div>
                {/* Breakdown grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 2 }}>
                  {[
                    { icon: '⛽', label: 'Fuel', val: breakdown.fuel },
                    { icon: '🏠', label: 'Stay', val: breakdown.accommodation },
                    { icon: '🍽', label: 'Food', val: breakdown.food },
                    { icon: '🎯', label: 'Activities', val: breakdown.activities },
                  ].map(({ icon, label, val }) => (
                    <div key={label} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: '8px 10px' }}>
                      <div style={{ fontSize: 11, color: '#5a5f6e' }}>{icon} {label}</div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: '#f5f5f5', marginTop: 2 }}>€{val}</div>
                    </div>
                  ))}
                </div>
                {/* Total */}
                <div style={{ textAlign: 'center', paddingTop: 4 }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#f5a623' }}>~€{breakdown.total} estimated total</div>
                  <div style={{ fontSize: 11, color: '#5a5f6e', marginTop: 3 }}>Based on {breakdown.nights} nights · {breakdown.totalKm} km · 1 person</div>
                </div>
              </div>
            )
          })()}
        </div>
      )}

      {/* Days scroll */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 12px 48px' }}>
        {days.map((day) => {
          const dayStops = byDay[day]
          const dayColor = getDayColor(day)
          const dayKm = dayStops.reduce((s, stop) => s + (stop.driveFromPrev?.km ?? 0), 0)
          const collapsed = collapsedDays.has(day)

          return (
            <div key={day} style={{ marginBottom: 20 }}>
              {/* Day header */}
              <button
                onClick={() => toggleDay(day)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, marginBottom: collapsed ? 0 : 10, background: 'none', border: 'none', cursor: 'pointer', padding: '0 2px' }}
              >
                <div style={{ backgroundColor: dayColor, color: '#0a0b0e', fontSize: 11, fontWeight: 800, padding: '4px 14px', borderRadius: 20, textTransform: 'uppercase' as const, letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
                  Day {day}
                </div>
                <div style={{ flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.06)' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {dayKm > 0 && <span style={{ fontSize: 11, color: '#5a5f6e' }}>{dayKm} km</span>}
                  {collapsed ? <ChevronDown size={14} color="#5a5f6e" /> : <ChevronUp size={14} color="#5a5f6e" />}
                </div>
              </button>

              {!collapsed && (
                <div>
                  {dayStops.map((stop, idx) => (
                    <div key={stop.id}>
                      <TripStopCard
                        stop={stop}
                        onRemove={handleRemove}
                        isFirst={idx === 0 && day === days[0]}
                        accentColor={dayColor}
                      />
                      {/* Move to day controls */}
                      {days.length > 1 && (
                        <div style={{ display: 'flex', gap: 4, marginTop: 4, marginBottom: 4, paddingLeft: 4 }}>
                          <span style={{ fontSize: 9, color: '#5a5f6e', marginRight: 2, lineHeight: '20px' }}>Move to:</span>
                          {days.filter((d) => d !== day).map((d) => (
                            <button
                              key={d}
                              onClick={() => moveToDay(stop.id, d)}
                              style={{ fontSize: 9, fontWeight: 600, color: getDayColor(d), backgroundColor: `${getDayColor(d)}18`, border: `1px solid ${getDayColor(d)}30`, borderRadius: 6, padding: '2px 7px', cursor: 'pointer' }}
                            >
                              Day {d}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}

                </div>
              )}
            </div>
          )
        })}

        {/* Add next day CTA */}
        <div style={{ backgroundColor: 'rgba(18,20,28,0.95)', border: '1px dashed rgba(255,255,255,0.12)', borderRadius: 12, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <MapPin size={14} color="#5a5f6e" />
          <span style={{ fontSize: 12, color: '#5a5f6e' }}>
            Tap <strong style={{ color: '#f5a623' }}>+ Add Spots</strong> to continue building Day {(Math.max(...days) + 1)}
          </span>
        </div>
      </div>
    </div>
  )
}
