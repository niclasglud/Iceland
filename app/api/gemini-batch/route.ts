import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { locations } from '@/data/locations'

const genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? '')

async function urlToBase64(url: string): Promise<{ data: string; mimeType: string } | null> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) })
    if (!res.ok) return null
    const buf = await res.arrayBuffer()
    const mime = res.headers.get('content-type') ?? 'image/jpeg'
    return { data: Buffer.from(buf).toString('base64'), mimeType: mime }
  } catch {
    return null
  }
}

async function analyzeImage(
  imageUrl: string,
  locationName: string,
  locationType: string,
  locationRegion: string
): Promise<{ correct: boolean; confidence: number; suggestedSearch: string; description: string }> {
  const model = genai.getGenerativeModel({ model: 'gemini-1.5-flash' })
  const img = await urlToBase64(imageUrl)

  if (!img) {
    return { correct: false, confidence: 0, suggestedSearch: `${locationName} iceland`, description: 'Image could not be fetched' }
  }

  const prompt = `You are a travel photography expert specializing in Iceland.
Verify if this image correctly shows "${locationName}", a ${locationType} in the ${locationRegion} region of Iceland.
Respond with JSON only (no markdown):
{"correct":true/false,"confidence":0-100,"description":"what the image actually shows","suggestedSearch":"best Unsplash search keywords for a correct photo of this place"}`

  try {
    const result = await model.generateContent([
      { inlineData: { mimeType: img.mimeType, data: img.data } },
      prompt,
    ])
    const text = result.response.text().trim().replace(/^```json\s*/i, '').replace(/\s*```$/i, '')
    return JSON.parse(text)
  } catch {
    return { correct: false, confidence: 0, suggestedSearch: `${locationName} iceland`, description: 'Analysis failed' }
  }
}

function buildReplacementUrl(search: string): string {
  return `https://source.unsplash.com/featured/800x560/?${encodeURIComponent(search)}`
}

function extractPhotoId(url: string): string {
  const m = url.match(/photo-([a-zA-Z0-9_-]+)/)
  return m ? m[1] : url
}

function sleep(ms: number) {
  return new Promise(r => setTimeout(r, ms))
}

export async function POST() {
  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({ error: 'GEMINI_API_KEY not set' }, { status: 500 })
  }

  const fixes: Record<string, string> = {}
  const details: Record<string, { correct: boolean; confidence: number; description: string; suggestedSearch: string; duplicate: boolean }> = {}
  const seenIds = new Set<string>()
  let wrong = 0
  let duplicates = 0

  // Process in batches of 4 with delay between batches to respect rate limits
  const BATCH = 4
  for (let i = 0; i < locations.length; i += BATCH) {
    const batch = locations.slice(i, i + BATCH)

    await Promise.all(batch.map(async (loc) => {
      const photoId = extractPhotoId(loc.thumbnail)
      const isDuplicate = seenIds.has(photoId)
      seenIds.add(photoId)

      // Always call Gemini for a proper description, but skip if clearly duplicate
      const analysis = await analyzeImage(loc.thumbnail, loc.name, loc.type, loc.region)

      const needsFix = !analysis.correct || isDuplicate
      details[loc.id] = { ...analysis, duplicate: isDuplicate }

      if (needsFix) {
        wrong++
        if (isDuplicate) duplicates++
        const search = analysis.suggestedSearch?.trim() || `${loc.name} iceland`
        fixes[loc.id] = buildReplacementUrl(search)
      }
    }))

    // Rate-limit: wait between batches (Gemini free tier = 15 req/min)
    if (i + BATCH < locations.length) await sleep(4000)
  }

  return NextResponse.json({
    stats: { total: locations.length, wrong, duplicates, fixed: Object.keys(fixes).length },
    fixes,
    details,
  })
}
