import type { CustomTripStop } from '@/types'

const STORAGE_KEY = 'iceland-custom-trip-v1'

export function saveTrip(stops: CustomTripStop[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stops))
  } catch {
    // localStorage unavailable
  }
}

export function loadTrip(): CustomTripStop[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as CustomTripStop[]
  } catch {
    return []
  }
}

export function clearTrip(): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}

export function formatTripAsText(stops: CustomTripStop[]): string {
  if (stops.length === 0) return 'No stops added yet.'

  const byDay = stops.reduce<Record<number, CustomTripStop[]>>((acc, s) => {
    if (!acc[s.day]) acc[s.day] = []
    acc[s.day].push(s)
    return acc
  }, {})

  const days = Object.keys(byDay).map(Number).sort((a, b) => a - b)
  const lines: string[] = ['🇮🇸 My Iceland Trip', '']

  for (const day of days) {
    lines.push(`Day ${day}:`)
    for (const stop of byDay[day]) {
      const drive = stop.driveFromPrev
        ? `  (${stop.driveFromPrev.km}km · ~${Math.round(stop.driveFromPrev.minutes / 60)}h${stop.driveFromPrev.minutes % 60 > 0 ? stop.driveFromPrev.minutes % 60 + 'min' : ''})`
        : ''
      lines.push(`  • ${stop.name}${drive}`)
    }
    lines.push('')
  }

  const totalKm = stops.reduce((s, stop) => s + (stop.driveFromPrev?.km ?? 0), 0)
  const totalDays = days.length
  lines.push(`Total: ${totalDays} days · ~${totalKm} km`)

  return lines.join('\n')
}

// Generate a unique ID for a trip stop instance
export function generateStopId(): string {
  return `stop-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}
