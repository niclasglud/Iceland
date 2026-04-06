'use client'

import Image from 'next/image'
import { X, Clock, Navigation } from 'lucide-react'
import type { CustomTripStop } from '@/types'

const REGION_COLORS: Record<string, string> = {
  'ring-road': '#4a9eff', 'highlands': '#f5a623', 'westfjords': '#8b5cf6',
  'snaefellsnes': '#06b6d4', 'reykjanes': '#ef4444', 'east': '#10b981',
  'north': '#60a5fa', 'south': '#fbbf24',
}

function formatDrive(minutes: number): string {
  if (minutes < 60) return `${minutes}min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}min` : `${h}h`
}

interface TripStopCardProps {
  stop: CustomTripStop
  onRemove: (id: string) => void
  isFirst: boolean
  accentColor: string
}

export default function TripStopCard({ stop, onRemove, isFirst, accentColor }: TripStopCardProps) {
  const regionColor = REGION_COLORS[stop.region] ?? '#8a8f9e'

  return (
    <div>
      {/* Drive badge between stops */}
      {!isFirst && stop.driveFromPrev && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3px 0' }}>
          <div style={{ width: 1, height: 10, backgroundColor: 'rgba(255,255,255,0.08)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, backgroundColor: 'rgba(18,20,28,0.95)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '3px 10px', fontSize: 10, color: '#8a8f9e' }}>
            <Navigation size={9} color={accentColor} />
            <span style={{ color: '#fff', fontWeight: 600 }}>{stop.driveFromPrev.km} km</span>
            <span style={{ opacity: 0.4 }}>·</span>
            <Clock size={9} color="#5a5f6e" />
            <span>{formatDrive(stop.driveFromPrev.minutes)}</span>
          </div>
          <div style={{ width: 1, height: 10, backgroundColor: 'rgba(255,255,255,0.08)' }} />
        </div>
      )}

      {/* Stop card */}
      <div style={{ backgroundColor: 'rgba(18,20,28,0.95)', borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)', display: 'flex' }}>
        {/* Colour strip */}
        <div style={{ width: 3, backgroundColor: accentColor, flexShrink: 0 }} />

        {/* Thumbnail */}
        <div style={{ width: 70, minHeight: 70, flexShrink: 0, position: 'relative', overflow: 'hidden' }}>
          <Image
            src={stop.thumbnail}
            alt={stop.name}
            fill
            sizes="70px"
            style={{ objectFit: 'cover' }}
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
        </div>

        {/* Info */}
        <div style={{ flex: 1, padding: '9px 10px', minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {stop.name}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ fontSize: 10, color: regionColor, fontWeight: 600 }}>{stop.region.replace('-', ' ')}</span>
            <span style={{ fontSize: 10, color: '#5a5f6e' }}>·</span>
            <span style={{ fontSize: 10, color: '#5a5f6e' }}>{stop.type.replace('-', ' ')}</span>
          </div>
        </div>

        {/* Remove button */}
        <button
          onClick={() => onRemove(stop.id)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 12px', color: '#5a5f6e', display: 'flex', alignItems: 'center', flexShrink: 0 }}
          aria-label="Remove stop"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  )
}
