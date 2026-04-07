import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { locations } from '@/data/locations'

const genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? '')

export async function POST(req: NextRequest) {
  const key = process.env.GEMINI_API_KEY
  if (!key) return NextResponse.json({ error: 'GEMINI_API_KEY not set' }, { status: 500 })

  try {
    const { days, styles, vehicle, season, notes } = await req.json() as {
      days: number
      styles: string[]
      vehicle: string
      season: string
      notes?: string
    }

    const model = genai.getGenerativeModel({ model: 'gemini-1.5-flash' })

    // Build compact CSV of locations (id|name|type|region|difficulty|bestSeasons)
    const locationCsv = locations
      .map((l) => `${l.id}|${l.name}|${l.type}|${l.region}|${l.difficulty ?? 'easy'}|${l.bestSeason.join(',')}`)
      .join('\n')

    const fRoadBlock = vehicle === 'small-car' || vehicle === 'suv'
      ? 'Do NOT include any location that has an fRoad field (requires 4WD). Avoid highland locations.'
      : 'You may include highland and F-road locations.'

    const prompt = `You are an expert Iceland travel planner. Create a ${days}-day Iceland itinerary.

Traveller preferences:
- Trip styles: ${styles.join(', ')}
- Vehicle: ${vehicle}
- Season: ${season}
- Notes: ${notes || 'none'}

${fRoadBlock}

Rules:
- Use ONLY locationIds from the CSV below
- Maximum 4 stops per day
- Group stops geographically to minimise driving
- Include a mix of iconic and hidden gems
- Tailor each stop note to the traveller's stated interests
- Return ONLY valid JSON with no markdown fences

Available locations (id|name|type|region|difficulty|bestSeasons):
${locationCsv}

Return this exact JSON structure:
{
  "title": "Catchy itinerary name",
  "tagline": "One sentence description of this trip",
  "days": [
    {
      "day": 1,
      "theme": "Short day theme e.g. Golden Circle & Waterfalls",
      "stops": [
        {
          "locationId": "exact-id-from-csv",
          "name": "Location Name",
          "note": "One personalised sentence about why this stop suits this traveller"
        }
      ]
    }
  ]
}`

    const result = await model.generateContent(prompt)
    const text = result.response.text().trim()
    const clean = text.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim()
    const itinerary = JSON.parse(clean)

    return NextResponse.json(itinerary)
  } catch (err) {
    console.error('[ai-itinerary]', err)
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 })
  }
}
