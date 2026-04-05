import { NextRequest, NextResponse } from 'next/server'

interface OSRMStep {
  maneuver: { type: string; modifier?: string; location: [number, number] }
  name: string
  distance: number
  duration: number
}

interface OSRMRoute {
  distance: number
  duration: number
  geometry: { type: 'LineString'; coordinates: [number, number][] }
  legs: Array<{ steps: OSRMStep[] }>
}

interface OSRMResponse {
  code: string
  routes: OSRMRoute[]
}

function getManeuver(type: string, modifier?: string): string {
  if (type === 'depart') return 'depart'
  if (type === 'arrive') return 'arrive'
  if (type === 'roundabout' || type === 'rotary') return 'roundabout'
  if (!modifier || modifier === 'straight') return 'straight'
  if (modifier === 'uturn') return 'u-turn'
  if (modifier === 'slight left') return 'turn-slight-left'
  if (modifier === 'slight right') return 'turn-slight-right'
  if (modifier === 'sharp left') return 'turn-sharp-left'
  if (modifier === 'sharp right') return 'turn-sharp-right'
  if (modifier === 'left') return 'turn-left'
  if (modifier === 'right') return 'turn-right'
  return 'straight'
}

function getInstruction(type: string, modifier: string | undefined, name: string): string {
  const road = name || 'the road'
  if (type === 'depart') return `Head towards ${road}`
  if (type === 'arrive') return 'You have arrived at your destination'
  if (type === 'roundabout' || type === 'rotary') return `Take the roundabout onto ${road}`
  if (!modifier || modifier === 'straight') return `Continue on ${road}`
  if (modifier === 'uturn') return 'Make a U-turn'
  if (modifier === 'slight left') return `Bear left onto ${road}`
  if (modifier === 'slight right') return `Bear right onto ${road}`
  if (modifier === 'sharp left') return `Turn sharp left onto ${road}`
  if (modifier === 'sharp right') return `Turn sharp right onto ${road}`
  if (modifier === 'left') return `Turn left onto ${road}`
  if (modifier === 'right') return `Turn right onto ${road}`
  return `Continue on ${road}`
}

async function tryOSRM(baseUrl: string, fromLng: number, fromLat: number, toLng: number, toLat: number): Promise<OSRMResponse | null> {
  try {
    const url = `${baseUrl}/${fromLng},${fromLat};${toLng},${toLat}?steps=true&geometries=geojson&overview=full`
    const res = await fetch(url, {
      headers: { 'User-Agent': 'IcelandApp/1.0' },
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) return null
    const data: OSRMResponse = await res.json()
    if (data.code === 'Ok' && data.routes?.length) return data
    return null
  } catch {
    return null
  }
}

/** Straight-line fallback: estimated road distance = 1.4× crow-flies, avg 60 km/h */
function straightLineFallback(fromLng: number, fromLat: number, toLng: number, toLat: number) {
  const R = 6371000
  const lat1 = (fromLat * Math.PI) / 180
  const lat2 = (toLat * Math.PI) / 180
  const dLat = lat2 - lat1
  const dLng = ((toLng - fromLng) * Math.PI) / 180
  const crowMeters = R * 2 * Math.asin(Math.sqrt(Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2))
  const roadMeters = Math.round(crowMeters * 1.4)
  const durationSec = Math.round((roadMeters / 1000 / 60) * 3600) // 60 km/h avg

  // Interpolate a 10-point curve for a nicer-looking line
  const coords: [number, number][] = Array.from({ length: 10 }, (_, i) => {
    const t = i / 9
    return [fromLng + (toLng - fromLng) * t, fromLat + (toLat - fromLat) * t]
  })

  return {
    distance: roadMeters,
    duration: durationSec,
    geometry: { type: 'LineString' as const, coordinates: coords },
    steps: [
      { instruction: 'Head to your destination', distance: roadMeters, duration: durationSec, maneuver: 'depart', streetName: '', location: [fromLng, fromLat] as [number, number] },
      { instruction: 'You have arrived at your destination', distance: 0, duration: 0, maneuver: 'arrive', streetName: '', location: [toLng, toLat] as [number, number] },
    ],
    isEstimate: true,
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const fromLng = parseFloat(searchParams.get('fromLng') ?? '')
  const fromLat = parseFloat(searchParams.get('fromLat') ?? '')
  const toLng   = parseFloat(searchParams.get('toLng') ?? '')
  const toLat   = parseFloat(searchParams.get('toLat') ?? '')

  if ([fromLng, fromLat, toLng, toLat].some(isNaN)) {
    return NextResponse.json({ error: 'Invalid coordinates' }, { status: 400 })
  }

  // Try routing servers in order — fall back to straight-line estimate
  const OSRM_SERVERS = [
    'https://routing.openstreetmap.de/routed-car/route/v1/driving',
    'https://router.project-osrm.org/route/v1/driving',
    'https://osrm.openstreetmap.de/route/v1/driving',
  ]

  for (const server of OSRM_SERVERS) {
    const data = await tryOSRM(server, fromLng, fromLat, toLng, toLat)
    if (data) {
      const route = data.routes[0]
      const steps = route.legs.flatMap((leg) =>
        leg.steps.map((step) => ({
          instruction: getInstruction(step.maneuver.type, step.maneuver.modifier, step.name),
          distance: Math.round(step.distance),
          duration: Math.round(step.duration),
          maneuver: getManeuver(step.maneuver.type, step.maneuver.modifier),
          streetName: step.name || '',
          location: step.maneuver.location,
        }))
      )
      return NextResponse.json({
        distance: Math.round(route.distance),
        duration: Math.round(route.duration),
        geometry: route.geometry,
        steps,
        isEstimate: false,
      })
    }
  }

  // All servers failed — return straight-line estimate
  console.warn('[route] All routing servers failed, using straight-line estimate')
  return NextResponse.json(straightLineFallback(fromLng, fromLat, toLng, toLat))
}
