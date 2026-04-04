import { AuroraData } from '@/types'

// KP index thresholds for Iceland visibility
// Iceland is at ~65°N, aurora visible at KP 3+
export const ICELAND_MIN_KP = 3

export function getAuroraProbability(kp: number, cloudCover: number): number {
  // Base probability from KP index (for Iceland latitude ~65°N)
  let baseProb = 0
  if (kp >= 8) baseProb = 95
  else if (kp >= 6) baseProb = 85
  else if (kp >= 5) baseProb = 75
  else if (kp >= 4) baseProb = 60
  else if (kp >= 3) baseProb = 40
  else if (kp >= 2) baseProb = 15
  else baseProb = 5

  // Reduce by cloud cover
  const clearSkyFactor = 1 - cloudCover / 100
  return Math.round(baseProb * clearSkyFactor)
}

export function getKpColor(kp: number): string {
  if (kp >= 7) return '#ef4444' // red - severe
  if (kp >= 5) return '#f59e0b' // amber - strong
  if (kp >= 3) return '#10b981' // green - moderate, visible in Iceland
  if (kp >= 1) return '#3b82f6' // blue - minor
  return '#6b7280' // gray - quiet
}

export function getKpLabel(kp: number): string {
  if (kp >= 8) return 'Extreme'
  if (kp >= 7) return 'Severe'
  if (kp >= 6) return 'Strong'
  if (kp >= 5) return 'Strong'
  if (kp >= 4) return 'Moderate'
  if (kp >= 3) return 'Good'
  if (kp >= 2) return 'Low'
  if (kp >= 1) return 'Minimal'
  return 'Quiet'
}

export function getAuroraDescription(kp: number): string {
  if (kp >= 7) return 'Extreme geomagnetic storm. Auroras visible across all of Iceland, even in cities. Corona possible overhead.'
  if (kp >= 5) return 'Strong activity. Brilliant green curtains across the sky. Visible throughout Iceland with minimal cloud cover.'
  if (kp >= 4) return 'Moderate activity. Good aurora display expected in dark areas of Iceland.'
  if (kp >= 3) return 'Mild activity. Aurora visible from dark locations in Iceland. Head to the highlands for best views.'
  if (kp >= 2) return 'Low activity. Faint aurora possible from very dark locations. Patience needed.'
  return 'Quiet conditions. Aurora unlikely tonight. Watch the forecast for upcoming activity.'
}

// Simulated forecast for demo (in production, fetch from NOAA SWPC)
export function getMockAuroraData(): AuroraData {
  const now = new Date()
  const baseKp = 2 + Math.random() * 4 // 2–6 range for interesting display
  const roundedKp = Math.round(baseKp * 10) / 10

  const forecast = Array.from({ length: 24 }, (_, i) => {
    const time = new Date(now)
    time.setHours(time.getHours() + i)
    // Create realistic variation peaking in evening hours
    const hourOfDay = time.getHours()
    const eveningBoost = hourOfDay >= 21 || hourOfDay <= 3 ? 1 + Math.random() * 0.8 : 1
    const kp = Math.min(9, Math.max(0, roundedKp * eveningBoost + (Math.random() - 0.5)))
    return {
      time: time.toISOString(),
      kp: Math.round(kp * 10) / 10,
    }
  })

  const peakEntry = forecast.reduce((max, entry) => (entry.kp > max.kp ? entry : max), forecast[0])
  const bestTime = new Date(peakEntry.time)

  return {
    kpIndex: roundedKp,
    kpForecast: forecast,
    probability: getAuroraProbability(roundedKp, 20),
    bestViewingTime: bestTime.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    }),
    cloudCover: 20,
  }
}

// Aurora visibility zones for Iceland map overlay
// Returns GeoJSON-like data for heatmap rendering
export interface AuroraZone {
  id: string
  name: string
  coordinates: [number, number]
  darknessFactor: number // 0-1, higher = darker sky
  intensity: number // based on current KP
}

export function getAuroraZones(kpIndex: number): AuroraZone[] {
  const zones: Omit<AuroraZone, 'intensity'>[] = [
    { id: 'highlands-north', name: 'Northern Highlands', coordinates: [-18.5, 65.2], darknessFactor: 1.0 },
    { id: 'highlands-central', name: 'Central Highlands', coordinates: [-19.0, 64.8], darknessFactor: 0.98 },
    { id: 'north-coast', name: 'North Coast', coordinates: [-18.0, 66.0], darknessFactor: 0.9 },
    { id: 'east-fjords', name: 'East Fjords', coordinates: [-14.5, 65.0], darknessFactor: 0.95 },
    { id: 'westfjords', name: 'Westfjords', coordinates: [-23.0, 65.5], darknessFactor: 0.92 },
    { id: 'snaefellsnes', name: 'Snæfellsnes', coordinates: [-23.5, 64.8], darknessFactor: 0.85 },
    { id: 'south-coast', name: 'South Coast', coordinates: [-19.0, 63.5], darknessFactor: 0.75 },
    { id: 'reykjanes', name: 'Reykjanes', coordinates: [-22.5, 63.9], darknessFactor: 0.4 },
    { id: 'reykjavik', name: 'Reykjavik Area', coordinates: [-22.0, 64.1], darknessFactor: 0.2 },
    { id: 'akureyri', name: 'Akureyri', coordinates: [-18.1, 65.7], darknessFactor: 0.5 },
    { id: 'askja', name: 'Askja Region', coordinates: [-16.7, 65.0], darknessFactor: 1.0 },
    { id: 'vatna', name: 'Vatnajökull', coordinates: [-17.0, 64.4], darknessFactor: 0.95 },
  ]

  const kpFactor = Math.min(1, kpIndex / 9)

  return zones.map((z) => ({
    ...z,
    intensity: z.darknessFactor * kpFactor,
  }))
}
