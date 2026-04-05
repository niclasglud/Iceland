import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

// POST { updates: Record<locationId, newUrl> }
// Patches data/locations.ts — only in development/staging
export async function POST(req: NextRequest) {
  const locationsPath = path.join(process.cwd(), 'data', 'locations.ts')

  try {
    const { updates } = await req.json() as { updates: Record<string, string> }
    if (!updates || typeof updates !== 'object') {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    let source = fs.readFileSync(locationsPath, 'utf-8')
    let count = 0

    // For each location id + new url, find the thumbnail line near the id and replace it
    for (const [id, newUrl] of Object.entries(updates)) {
      // Find id: 'xxx', ... thumbnail: '...'  — replace the thumbnail URL
      const pattern = new RegExp(
        `(id:\\s*'${id}'[^}]*?thumbnail:\\s*')[^']+(')`,
        's'
      )
      if (pattern.test(source)) {
        source = source.replace(pattern, `$1${newUrl}$2`)
        count++
      }
    }

    fs.writeFileSync(locationsPath, source, 'utf-8')
    return NextResponse.json({ updated: count, total: Object.keys(updates).length })
  } catch (err) {
    console.error('[apply-thumbnails]', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
