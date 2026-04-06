import { NextResponse } from 'next/server'

// Official NOAA SWPC data sources
// Primary: 1-minute planetary K-index (most real-time)
// Secondary: 3-hour planetary K-index history
// Forecast: 3-day KP forecast product
const NOAA_1MIN_URL =
  'https://services.swpc.noaa.gov/json/planetary_k_index_1m.json'
const NOAA_3HR_URL =
  'https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json'
const NOAA_FORECAST_URL =
  'https://services.swpc.noaa.gov/products/noaa-planetary-k-index-forecast.json'

interface KpForecastEntry {
  time: string
  kp: number
}

interface AuroraApiResponse {
  kpIndex: number
  kpForecast: KpForecastEntry[]
  probability: number
  bestViewingTime?: string
  cloudCover: number
  dataSource: string
}

function computeProbability(kp: number, cloudCover: number): number {
  let base = 0
  if (kp >= 8) base = 95
  else if (kp >= 6) base = 85
  else if (kp >= 5) base = 75
  else if (kp >= 4) base = 60
  else if (kp >= 3) base = 40
  else if (kp >= 2) base = 15
  else base = 5
  return Math.round(base * (1 - cloudCover / 100))
}

function isNightHour(isoTime: string): boolean {
  // Iceland is UTC+0 year-round — night = 21:00–03:59
  const h = new Date(isoTime).getUTCHours()
  return h >= 21 || h <= 3
}

function findBestViewingTime(forecast: KpForecastEntry[]): string | undefined {
  if (forecast.length === 0) return undefined
  // Only consider future entries during night hours
  const now = Date.now()
  const nightEntries = forecast.filter(
    (e) => new Date(e.time).getTime() >= now && isNightHour(e.time)
  )
  // No upcoming night window in forecast — don't show a daytime time
  if (nightEntries.length === 0) return undefined
  const peak = nightEntries.reduce((best, e) => (e.kp > best.kp ? e : best), nightEntries[0])
  return new Date(peak.time).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'UTC', // Iceland = UTC+0
  })
}

function getMockResponse(): AuroraApiResponse {
  const now = new Date()
  // Use a dynamic base value instead of a hardcoded 3.0
  const seed = now.getUTCDate() + now.getUTCHours() * 0.1
  const kpIndex = Math.round((1.5 + ((seed * 7919) % 3.5)) * 10) / 10

  const kpForecast: KpForecastEntry[] = Array.from({ length: 24 }, (_, i) => {
    const t = new Date(now)
    t.setHours(t.getHours() + i)
    const h = t.getHours()
    const boost = h >= 21 || h <= 3 ? 1.2 : 1.0
    const kp = Math.min(9, Math.max(0, Math.round((kpIndex * boost + (Math.random() - 0.5)) * 10) / 10))
    return { time: t.toISOString(), kp }
  })

  const cloudCover = 30
  return {
    kpIndex,
    kpForecast,
    probability: computeProbability(kpIndex, cloudCover),
    bestViewingTime: findBestViewingTime(kpForecast),
    cloudCover,
    dataSource: 'mock',
  }
}

// Parse 1-minute NOAA endpoint: returns array of [time_tag, kp_index, ...]
async function fetchCurrentKpFrom1Min(): Promise<{ kpIndex: number; history: KpForecastEntry[] } | null> {
  try {
    const res = await fetch(NOAA_1MIN_URL, { cache: 'no-store' })
    if (!res.ok) return null

    // Format: array of objects or arrays; structure varies, parse defensively
    const raw: unknown = await res.json()
    if (!Array.isArray(raw) || raw.length === 0) return null

    const entries: KpForecastEntry[] = []

    for (const item of raw) {
      let timeStr: string | undefined
      let kpVal: number | undefined

      if (Array.isArray(item)) {
        // [time_tag, kp, ...]
        timeStr = String(item[0])
        kpVal = parseFloat(String(item[1]))
      } else if (item && typeof item === 'object') {
        const obj = item as Record<string, unknown>
        timeStr = String(obj.time_tag ?? obj.time ?? '')
        kpVal = parseFloat(String(obj.kp_index ?? obj.kp ?? 'NaN'))
      }

      if (!timeStr || kpVal === undefined || isNaN(kpVal)) continue

      const isoTime = timeStr.replace(' ', 'T').replace(/(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}).*/, '$1') + 'Z'
      entries.push({ time: isoTime, kp: Math.round(kpVal * 10) / 10 })
    }

    if (entries.length === 0) return null

    // Latest reading
    const latest = entries[entries.length - 1]
    return { kpIndex: latest.kp, history: entries.slice(-24) }
  } catch {
    return null
  }
}

// Parse 3-hour NOAA endpoint: [[header], [time, kp, status], ...]
async function fetchFrom3Hr(): Promise<{ kpIndex: number; history: KpForecastEntry[] } | null> {
  try {
    const res = await fetch(NOAA_3HR_URL, { cache: 'no-store' })
    if (!res.ok) return null

    const raw: unknown[][] = await res.json()
    const rows = raw.slice(1) // skip header

    const entries: KpForecastEntry[] = rows
      .map((row) => {
        const kpVal = parseFloat(String(row[1]))
        if (isNaN(kpVal)) return null
        const timeStr = String(row[0]).replace(' ', 'T') + 'Z'
        return { time: timeStr, kp: Math.round(kpVal * 10) / 10 }
      })
      .filter((e): e is KpForecastEntry => e !== null)

    if (entries.length === 0) return null

    const latest = entries[entries.length - 1]
    return { kpIndex: latest.kp, history: entries.slice(-24) }
  } catch {
    return null
  }
}

// Fetch 3-day forecast from NOAA: [[header], [time, kp, observed, scale], ...]
async function fetchForecast(): Promise<KpForecastEntry[]> {
  try {
    const res = await fetch(NOAA_FORECAST_URL, { cache: 'no-store' })
    if (!res.ok) return []

    const raw: unknown[][] = await res.json()
    const rows = raw.slice(1)
    const now = Date.now()

    return rows
      .map((row) => {
        const kpVal = parseFloat(String(row[1]))
        if (isNaN(kpVal)) return null
        const timeStr = String(row[0]).replace(' ', 'T') + 'Z'
        return { time: timeStr, kp: Math.round(kpVal * 10) / 10 }
      })
      .filter((e): e is KpForecastEntry => {
        if (!e) return false
        const t = new Date(e.time).getTime()
        return t >= now && t <= now + 24 * 3600 * 1000
      })
  } catch {
    return []
  }
}

export async function GET() {
  const cloudCover = 30

  // Try 1-minute data first (most current), then fall back to 3-hour data
  let current = await fetchCurrentKpFrom1Min()
  let dataSource = 'NOAA SWPC 1-min Kp'

  if (!current) {
    current = await fetchFrom3Hr()
    dataSource = 'NOAA SWPC 3-hr Kp'
  }

  if (!current) {
    console.warn('[aurora/route] All NOAA endpoints failed, returning mock data')
    return NextResponse.json(getMockResponse())
  }

  // Fetch forecast in parallel (best-effort)
  const forecastEntries = await fetchForecast()

  // Build the 24h chart window: recent history + near-future forecast
  const combined: KpForecastEntry[] = [...current.history, ...forecastEntries]
    .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())

  const now = Date.now()
  const chartWindow = combined.filter((e) => {
    const t = new Date(e.time).getTime()
    return t >= now - 6 * 3600 * 1000 && t <= now + 24 * 3600 * 1000
  })

  const forecastWindow = chartWindow.length > 0 ? chartWindow : current.history.slice(-12)

  const response: AuroraApiResponse = {
    kpIndex: current.kpIndex,
    kpForecast: forecastWindow,
    probability: computeProbability(current.kpIndex, cloudCover),
    bestViewingTime: findBestViewingTime(forecastWindow),
    cloudCover,
    dataSource,
  }

  return NextResponse.json(response)
}
