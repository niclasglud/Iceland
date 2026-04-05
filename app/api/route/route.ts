import { NextRequest, NextResponse } from 'next/server'

// ── Polyline decoder (Google precision-6 used by Valhalla) ────────────────────
function decodePolyline(str: string, precision = 6): [number, number][] {
  let index = 0, lat = 0, lng = 0
  const coords: [number, number][] = []
  const factor = Math.pow(10, precision)
  while (index < str.length) {
    let b, shift = 0, result = 0
    do { b = str.charCodeAt(index++) - 63; result |= (b & 0x1f) << shift; shift += 5 } while (b >= 0x20)
    lat += (result & 1) ? ~(result >> 1) : result >> 1
    shift = 0; result = 0
    do { b = str.charCodeAt(index++) - 63; result |= (b & 0x1f) << shift; shift += 5 } while (b >= 0x20)
    lng += (result & 1) ? ~(result >> 1) : result >> 1
    coords.push([lng / factor, lat / factor])
  }
  return coords
}

// ── Valhalla maneuver type → our string ──────────────────────────────────────
function valhallaManeuver(type: number): string {
  if ([1, 2, 3].includes(type)) return 'depart'
  if ([4, 5, 6].includes(type)) return 'arrive'
  if ([8, 7, 22].includes(type)) return 'straight'
  if ([9, 23].includes(type)) return 'turn-slight-right'
  if ([16, 24].includes(type)) return 'turn-slight-left'
  if ([10, 18].includes(type)) return 'turn-right'
  if ([15, 19].includes(type)) return 'turn-left'
  if (type === 11) return 'turn-sharp-right'
  if (type === 14) return 'turn-sharp-left'
  if ([12, 13].includes(type)) return 'u-turn'
  if ([26, 27].includes(type)) return 'roundabout'
  return 'straight'
}

// ── Valhalla API ──────────────────────────────────────────────────────────────
interface ValhallaManeuver {
  type: number
  instruction: string
  street_names?: string[]
  time: number      // seconds
  length: number    // km
  begin_shape_index: number
}

interface ValhallaLeg {
  maneuvers: ValhallaManeuver[]
  shape: string    // encoded polyline6
  summary: { time: number; length: number }
}

interface ValhallaResponse {
  trip?: {
    status: number
    legs: ValhallaLeg[]
    summary: { time: number; length: number }
  }
}

async function tryValhalla(fromLng: number, fromLat: number, toLng: number, toLat: number) {
  const body = {
    locations: [
      { lon: fromLng, lat: fromLat, type: 'break' },
      { lon: toLng, lat: toLat, type: 'break' },
    ],
    costing: 'auto',
    directions_options: { units: 'km' },
  }
  try {
    const res = await fetch('https://valhalla1.openstreetmap.de/route', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'User-Agent': 'IcelandApp/1.0' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(9000),
    })
    if (!res.ok) return null
    const data: ValhallaResponse = await res.json()
    if (!data.trip || data.trip.status !== 0) return null

    const leg = data.trip.legs[0]
    const coords = decodePolyline(leg.shape, 6)
    const steps = leg.maneuvers.map((m) => ({
      instruction: m.instruction,
      distance: Math.round(m.length * 1000),        // km → m
      duration: Math.round(m.time),
      maneuver: valhallaManeuver(m.type),
      streetName: m.street_names?.[0] ?? '',
      location: coords[m.begin_shape_index] as [number, number],
    }))

    return {
      distance: Math.round(data.trip.summary.length * 1000),
      duration: Math.round(data.trip.summary.time),
      geometry: { type: 'LineString' as const, coordinates: coords },
      steps,
      isEstimate: false,
    }
  } catch {
    return null
  }
}

// ── OSRM fallback ─────────────────────────────────────────────────────────────
function osrmManeuver(type: string, mod?: string): string {
  if (type === 'depart') return 'depart'
  if (type === 'arrive') return 'arrive'
  if (type === 'roundabout' || type === 'rotary') return 'roundabout'
  if (!mod || mod === 'straight') return 'straight'
  if (mod === 'uturn') return 'u-turn'
  if (mod === 'slight left') return 'turn-slight-left'
  if (mod === 'slight right') return 'turn-slight-right'
  if (mod === 'sharp left') return 'turn-sharp-left'
  if (mod === 'sharp right') return 'turn-sharp-right'
  return mod.includes('left') ? 'turn-left' : mod.includes('right') ? 'turn-right' : 'straight'
}

function osrmInstruction(type: string, mod: string | undefined, name: string): string {
  const road = name || 'the road'
  if (type === 'depart') return `Head towards ${road}`
  if (type === 'arrive') return 'You have arrived at your destination'
  if (type === 'roundabout' || type === 'rotary') return `Take the roundabout onto ${road}`
  if (!mod || mod === 'straight') return `Continue on ${road}`
  if (mod === 'uturn') return 'Make a U-turn'
  if (mod === 'slight left') return `Bear left onto ${road}`
  if (mod === 'slight right') return `Bear right onto ${road}`
  if (mod === 'sharp left') return `Turn sharp left onto ${road}`
  if (mod === 'sharp right') return `Turn sharp right onto ${road}`
  return mod.includes('left') ? `Turn left onto ${road}` : mod.includes('right') ? `Turn right onto ${road}` : `Continue on ${road}`
}

async function tryOSRM(url: string, fromLng: number, fromLat: number, toLng: number, toLat: number) {
  try {
    const res = await fetch(
      `${url}/${fromLng},${fromLat};${toLng},${toLat}?steps=true&geometries=geojson&overview=full`,
      { headers: { 'User-Agent': 'IcelandApp/1.0' }, signal: AbortSignal.timeout(7000) }
    )
    if (!res.ok) return null
    const data = await res.json()
    if (data.code !== 'Ok' || !data.routes?.length) return null
    const route = data.routes[0]
    return {
      distance: Math.round(route.distance),
      duration: Math.round(route.duration),
      geometry: route.geometry as { type: 'LineString'; coordinates: [number, number][] },
      steps: route.legs.flatMap((leg: { steps: { maneuver: { type: string; modifier?: string; location: [number, number] }; name: string; distance: number; duration: number }[] }) =>
        leg.steps.map((s) => ({
          instruction: osrmInstruction(s.maneuver.type, s.maneuver.modifier, s.name),
          distance: Math.round(s.distance),
          duration: Math.round(s.duration),
          maneuver: osrmManeuver(s.maneuver.type, s.maneuver.modifier),
          streetName: s.name || '',
          location: s.maneuver.location,
        }))
      ),
      isEstimate: false,
    }
  } catch {
    return null
  }
}

// ── Straight-line fallback ────────────────────────────────────────────────────
function straightLineFallback(fromLng: number, fromLat: number, toLng: number, toLat: number) {
  const R = 6371000
  const lat1 = (fromLat * Math.PI) / 180, lat2 = (toLat * Math.PI) / 180
  const dLat = lat2 - lat1, dLng = ((toLng - fromLng) * Math.PI) / 180
  const crow = R * 2 * Math.asin(Math.sqrt(Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2))
  const roadMeters = Math.round(crow * 1.4)
  const duration = Math.round((roadMeters / 1000 / 70) * 3600)

  // 8-point interpolated line
  const coords: [number, number][] = Array.from({ length: 8 }, (_, i) => {
    const t = i / 7
    return [fromLng + (toLng - fromLng) * t, fromLat + (toLat - fromLat) * t]
  })

  // Rough compass direction for the instruction
  const bearing = (Math.atan2(
    Math.sin(dLng) * Math.cos(lat2),
    Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng)
  ) * 180) / Math.PI
  const dirs = ['north','northeast','east','southeast','south','southwest','west','northwest']
  const dir = dirs[Math.round(((bearing + 360) % 360) / 45) % 8]

  return {
    distance: roadMeters,
    duration,
    geometry: { type: 'LineString' as const, coordinates: coords },
    steps: [
      { instruction: `Head ${dir} toward your destination`, distance: roadMeters, duration, maneuver: 'depart', streetName: '', location: [fromLng, fromLat] as [number, number] },
      { instruction: 'You have arrived at your destination', distance: 0, duration: 0, maneuver: 'arrive', streetName: '', location: [toLng, toLat] as [number, number] },
    ],
    isEstimate: true,
  }
}

// ── Route handler ─────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const fromLng = parseFloat(searchParams.get('fromLng') ?? '')
  const fromLat = parseFloat(searchParams.get('fromLat') ?? '')
  const toLng   = parseFloat(searchParams.get('toLng') ?? '')
  const toLat   = parseFloat(searchParams.get('toLat') ?? '')

  if ([fromLng, fromLat, toLng, toLat].some(isNaN)) {
    return NextResponse.json({ error: 'Invalid coordinates' }, { status: 400 })
  }

  // 1. Try Valhalla (most reliable)
  const valhalla = await tryValhalla(fromLng, fromLat, toLng, toLat)
  if (valhalla) return NextResponse.json(valhalla)

  // 2. Try OSRM servers
  for (const server of [
    'https://routing.openstreetmap.de/routed-car/route/v1/driving',
    'https://router.project-osrm.org/route/v1/driving',
  ]) {
    const result = await tryOSRM(server, fromLng, fromLat, toLng, toLat)
    if (result) return NextResponse.json(result)
  }

  // 3. Straight-line estimate (always works)
  console.warn('[route] All routing servers failed, using straight-line estimate')
  return NextResponse.json(straightLineFallback(fromLng, fromLat, toLng, toLat))
}
