import { NextResponse } from 'next/server'

// 8 representative points spread across Iceland
const ICELAND_POINTS = [
  { lat: 64.13, lng: -21.94, name: 'Reykjavik'      },
  { lat: 65.68, lng: -18.10, name: 'Akureyri'       },
  { lat: 64.25, lng: -15.21, name: 'Höfn'           },
  { lat: 66.07, lng: -23.13, name: 'Ísafjörður'     },
  { lat: 63.93, lng: -20.86, name: 'Selfoss'        },
  { lat: 65.27, lng: -14.40, name: 'Egilsstaðir'    },
  { lat: 65.74, lng: -19.64, name: 'Sauðárkrókur'   },
  { lat: 63.44, lng: -20.28, name: 'Vestmannaeyjar' },
]

export interface CloudPoint {
  lat: number
  lng: number
  cloudCover: number
  name: string
}

export async function GET() {
  try {
    const lats  = ICELAND_POINTS.map(p => p.lat).join(',')
    const lngs  = ICELAND_POINTS.map(p => p.lng).join(',')
    const url   = `https://api.open-meteo.com/v1/forecast?latitude=${lats}&longitude=${lngs}&current=cloud_cover&timezone=UTC&forecast_days=1`

    const res = await fetch(url, { next: { revalidate: 900 } }) // cache 15 min
    if (!res.ok) throw new Error(`Open-Meteo ${res.status}`)

    // When multiple locations are requested, Open-Meteo returns an array
    const data = await res.json()
    const items: unknown[] = Array.isArray(data) ? data : [data]

    const points: CloudPoint[] = items.map((item: unknown, i) => {
      const d = item as { current?: { cloud_cover?: number } }
      return {
        lat:        ICELAND_POINTS[i].lat,
        lng:        ICELAND_POINTS[i].lng,
        name:       ICELAND_POINTS[i].name,
        cloudCover: d?.current?.cloud_cover ?? 50,
      }
    })

    return NextResponse.json(points)
  } catch (err) {
    console.error('[cloud-cover]', err)
    // Return fallback with a uniform value so map layer still renders
    const fallback: CloudPoint[] = ICELAND_POINTS.map(p => ({ ...p, cloudCover: 50 }))
    return NextResponse.json(fallback)
  }
}
