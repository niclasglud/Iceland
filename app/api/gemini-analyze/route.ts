import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? '')

async function urlToBase64(url: string): Promise<{ data: string; mimeType: string }> {
  const res = await fetch(url, { signal: AbortSignal.timeout(10_000) })
  if (!res.ok) throw new Error(`Image fetch failed: ${res.status}`)
  const buf = await res.arrayBuffer()
  const mime = res.headers.get('content-type') ?? 'image/jpeg'
  const data = Buffer.from(buf).toString('base64')
  return { data, mimeType: mime }
}

export async function POST(req: NextRequest) {
  const key = process.env.GEMINI_API_KEY
  if (!key) return NextResponse.json({ error: 'GEMINI_API_KEY not set' }, { status: 500 })

  try {
    const { imageUrl, locationName, locationType, locationRegion } = await req.json() as {
      imageUrl: string
      locationName: string
      locationType: string
      locationRegion: string
    }

    const model = genai.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const { data, mimeType } = await urlToBase64(imageUrl)

    const prompt = `You are a travel photography expert specializing in Iceland.

I need to verify if this image correctly shows "${locationName}", which is a ${locationType} located in the ${locationRegion} region of Iceland.

Please respond with JSON only (no markdown) in this exact format:
{
  "correct": true/false,
  "confidence": 0-100,
  "description": "brief description of what the image actually shows",
  "isIceland": true/false,
  "issues": "null or describe why it doesn't match",
  "suggestedSearch": "best Unsplash search keywords to find a correct photo of this place"
}`

    const result = await model.generateContent([
      { inlineData: { mimeType, data } },
      prompt,
    ])

    const text = result.response.text().trim()
    // Strip markdown fences if present
    const clean = text.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim()
    const analysis = JSON.parse(clean)

    return NextResponse.json(analysis)
  } catch (err) {
    console.error('[gemini-analyze]', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
