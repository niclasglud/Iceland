import { NextResponse } from 'next/server'
import type { RoadWarning } from '@/types'

// IMO (Icelandic Met Office) weather warnings RSS/JSON
// apis.is aggregates several Icelandic government data sources
const IMO_WARNINGS_URL = 'https://en.vedur.is/weather/warnings/'

// road.is (Vegagerðin) — Iceland Road Administration
const ROAD_CONDITIONS_URL = 'https://apis.is/road'

interface RoadApiEntry {
  id?: string
  road?: string
  status?: string
  description?: string
  region?: string
  severity?: string
}

interface ApiResponse {
  warnings: RoadWarning[]
  roadClosures: { road: string; description: string; region: string }[]
  lastUpdated: string
  source: string
}

// Map Icelandic region names from road.is to our app regions
function mapRegion(raw: string): string {
  const r = (raw ?? '').toLowerCase()
  if (r.includes('vestur') || r.includes('west')) return 'West'
  if (r.includes('norður') || r.includes('north')) return 'North'
  if (r.includes('austur') || r.includes('east')) return 'East'
  if (r.includes('suður') || r.includes('south')) return 'South'
  if (r.includes('höfuð') || r.includes('capital') || r.includes('reykja')) return 'Reykjavík'
  if (r.includes('highland') || r.includes('hálend')) return 'Highlands'
  return raw || 'Iceland'
}

function severityFromText(text: string): RoadWarning['severity'] {
  const t = (text ?? '').toLowerCase()
  if (t.includes('closed') || t.includes('lokar') || t.includes('extreme') || t.includes('danger')) return 'red'
  if (t.includes('caution') || t.includes('warning') || t.includes('difficult') || t.includes('slippery') || t.includes('wind')) return 'yellow'
  return 'green'
}

function typeFromText(text: string): RoadWarning['type'] {
  const t = (text ?? '').toLowerCase()
  if (t.includes('wind') || t.includes('storm') || t.includes('gale')) return 'wind'
  if (t.includes('snow') || t.includes('blizzard') || t.includes('drift')) return 'snow'
  if (t.includes('ice') || t.includes('frost') || t.includes('slippery')) return 'ice'
  if (t.includes('flood') || t.includes('river') || t.includes('water')) return 'flood'
  if (t.includes('clos') || t.includes('impassable') || t.includes('blocked')) return 'closure'
  return 'general'
}

async function fetchRoadClosures(): Promise<ApiResponse['roadClosures']> {
  try {
    const res = await fetch(ROAD_CONDITIONS_URL, {
      cache: 'no-store',
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) return []
    const data = await res.json()

    // apis.is returns { results: [...] }
    const results: RoadApiEntry[] = Array.isArray(data?.results) ? data.results : []

    return results
      .filter((e) => e.description || e.status)
      .slice(0, 20)
      .map((e) => ({
        road: e.road ?? e.id ?? 'Road',
        description: e.description ?? e.status ?? 'Condition reported',
        region: mapRegion(e.region ?? ''),
      }))
  } catch {
    return []
  }
}

function buildStaticWarnings(): RoadWarning[] {
  const month = new Date().getMonth()
  const warnings: RoadWarning[] = []

  // Highland F-roads — closed Oct–May
  if (month < 5 || month > 8) {
    warnings.push({
      region: 'Highlands',
      severity: 'red',
      message: 'All F-roads are closed for the season. Highland routes (F26, F35, F208, F88, etc.) require June–September access only.',
      type: 'closure',
    })
  }

  // Winter weather warnings
  if (month < 3 || month > 9) {
    warnings.push({
      region: 'All regions',
      severity: 'yellow',
      message: 'Winter driving conditions likely. Expect ice, snow, and reduced visibility. Check road.is before every journey.',
      type: 'ice',
    })
  }

  // Spring thaw
  if (month === 3 || month === 4) {
    warnings.push({
      region: 'Highlands & South',
      severity: 'yellow',
      message: 'Spring thaw may cause flooding on low-lying roads. F-road opening dates not yet confirmed — check road.is daily.',
      type: 'flood',
    })
  }

  return warnings
}

export async function GET() {
  const roadClosures = await fetchRoadClosures()
  const staticWarnings = buildStaticWarnings()

  // Convert road closures to warnings format
  const closureWarnings: RoadWarning[] = roadClosures.map((rc) => ({
    region: rc.region,
    severity: severityFromText(rc.description),
    message: `${rc.road}: ${rc.description}`,
    type: typeFromText(rc.description),
  }))

  const allWarnings = [...closureWarnings, ...staticWarnings]

  const response: ApiResponse = {
    warnings: allWarnings,
    roadClosures,
    lastUpdated: new Date().toISOString(),
    source: roadClosures.length > 0 ? 'road.is + seasonal data' : 'seasonal data',
  }

  return NextResponse.json(response)
}
