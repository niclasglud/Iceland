import { NextRequest, NextResponse } from 'next/server'

interface OSRMStep {
  maneuver: {
    type: string
    modifier?: string
    location: [number, number]
  }
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

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const fromLng = parseFloat(searchParams.get('fromLng') ?? '')
  const fromLat = parseFloat(searchParams.get('fromLat') ?? '')
  const toLng   = parseFloat(searchParams.get('toLng') ?? '')
  const toLat   = parseFloat(searchParams.get('toLat') ?? '')

  if ([fromLng, fromLat, toLng, toLat].some(isNaN)) {
    return NextResponse.json({ error: 'Invalid coordinates' }, { status: 400 })
  }

  try {
    const url =
      `https://router.project-osrm.org/route/v1/driving/` +
      `${fromLng},${fromLat};${toLng},${toLat}` +
      `?steps=true&geometries=geojson&overview=full`

    const res = await fetch(url, {
      headers: { 'User-Agent': 'IcelandApp/1.0' },
      signal: AbortSignal.timeout(10000),
    })

    if (!res.ok) {
      return NextResponse.json({ error: 'Routing service error' }, { status: 502 })
    }

    const data: OSRMResponse = await res.json()

    if (data.code !== 'Ok' || !data.routes?.length) {
      return NextResponse.json({ error: 'No route found' }, { status: 404 })
    }

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
    })
  } catch (err) {
    console.error('[route] Error:', err)
    return NextResponse.json({ error: 'Routing failed' }, { status: 500 })
  }
}
