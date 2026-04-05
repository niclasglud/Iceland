import { NextResponse } from 'next/server'

// Server-side proxy for RainViewer satellite metadata — avoids CORS issues in the browser
export async function GET() {
  try {
    const res = await fetch('https://api.rainviewer.com/public/weather-maps.json', {
      next: { revalidate: 600 }, // cache 10 min
    })
    if (!res.ok) throw new Error(`RainViewer API returned ${res.status}`)
    const data = await res.json()

    const infrared: { time: number; path: string }[] = data?.satellite?.infrared ?? []
    if (!infrared.length) {
      return NextResponse.json({ error: 'No satellite frames available' }, { status: 503 })
    }

    const latest = infrared[infrared.length - 1]
    // Build tile URL template (MapLibre {z}/{x}/{y} placeholders)
    const tileUrl = `https://tilecache.rainviewer.com${latest.path}512/{z}/{x}/{y}/0/0_0.png`

    return NextResponse.json({ tileUrl, time: latest.time })
  } catch (err) {
    console.error('[cloud-tiles]', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
