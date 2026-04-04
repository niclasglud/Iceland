import { NextResponse } from 'next/server'

// NOAA SWPC planetary K-index endpoint
// Response is an array of rows: [datetime_tag, kp, status]
// First row is a header row that must be skipped
const NOAA_KP_URL =
  'https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json'

interface NoaaKpRow {
  0: string  // datetime string e.g. "2024-01-15 00:00:00.000"
  1: string  // kp value as string
  2: string  // status string
}

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

function findBestViewingTime(forecast: KpForecastEntry[]): string | undefined {
  if (forecast.length === 0) return undefined
  // Among entries with kp >= 3 prefer those in night hours (21–03)
  const nightEntries = forecast.filter((e) => {
    const h = new Date(e.time).getHours()
    return (h >= 21 || h <= 3) && e.kp >= 3
  })
  const pool = nightEntries.length > 0 ? nightEntries : forecast
  const peak = pool.reduce((best, e) => (e.kp > best.kp ? e : best), pool[0])
  return new Date(peak.time).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

function getMockResponse(): AuroraApiResponse {
  const kpIndex = 3.0
  const cloudCover = 25
  const now = new Date()

  const kpForecast: KpForecastEntry[] = Array.from({ length: 24 }, (_, i) => {
    const t = new Date(now)
    t.setHours(t.getHours() + i)
    const h = t.getHours()
    const boost = h >= 21 || h <= 3 ? 1.2 : 1.0
    const kp = Math.min(9, Math.max(0, Math.round((kpIndex * boost + (Math.random() - 0.5)) * 10) / 10))
    return { time: t.toISOString(), kp }
  })

  return {
    kpIndex,
    kpForecast,
    probability: computeProbability(kpIndex, cloudCover),
    bestViewingTime: findBestViewingTime(kpForecast),
    cloudCover,
  }
}

export async function GET() {
  try {
    const res = await fetch(NOAA_KP_URL, {
      next: { revalidate: 900 }, // cache 15 minutes
      headers: { 'User-Agent': 'IcelandApp/1.0' },
    })

    if (!res.ok) {
      console.warn('[aurora/route] NOAA fetch failed, status:', res.status)
      return NextResponse.json(getMockResponse())
    }

    const raw: NoaaKpRow[] = await res.json()

    // First row is the header — skip it
    const rows = raw.slice(1)

    if (!rows || rows.length === 0) {
      return NextResponse.json(getMockResponse())
    }

    // Parse each row: [datetime, kp_string, status]
    const parsed: KpForecastEntry[] = rows
      .map((row) => {
        const kpNum = parseFloat(row[1])
        if (isNaN(kpNum)) return null
        return {
          time: new Date(row[0].replace(' ', 'T') + 'Z').toISOString(),
          kp: Math.round(kpNum * 10) / 10,
        }
      })
      .filter((e): e is KpForecastEntry => e !== null)

    if (parsed.length === 0) {
      return NextResponse.json(getMockResponse())
    }

    // Latest KP = last entry in the series
    const latest = parsed[parsed.length - 1]
    const kpIndex = latest.kp

    // 24-hour window from now
    const now = Date.now()
    const in24h = now + 24 * 3600 * 1000
    const kpForecast = parsed.filter((e) => {
      const t = new Date(e.time).getTime()
      return t >= now - 3600_000 && t <= in24h
    })

    // If the API has only historical data (no future), use last 24 entries
    const forecastWindow = kpForecast.length > 0 ? kpForecast : parsed.slice(-24)

    // Simulated cloud cover (Open-Meteo would provide this; use a placeholder here)
    const cloudCover = 30

    const response: AuroraApiResponse = {
      kpIndex,
      kpForecast: forecastWindow,
      probability: computeProbability(kpIndex, cloudCover),
      bestViewingTime: findBestViewingTime(forecastWindow),
      cloudCover,
    }

    return NextResponse.json(response)
  } catch (err) {
    console.error('[aurora/route] Error:', err)
    return NextResponse.json(getMockResponse())
  }
}
