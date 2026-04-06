/**
 * Verify all location thumbnails using the deployed Gemini endpoint.
 * Prints a JSON report of wrong images + suggested searches.
 */

import { readFileSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dir = dirname(fileURLToPath(import.meta.url))
const BASE = 'https://iceland-production-ce3f.up.railway.app'

// Parse locations out of TypeScript source with a regex (avoid needing tsc)
const src = readFileSync(join(__dir, '../data/locations.ts'), 'utf8')

const entries = []
const blocks = src.split(/\n  \{/)
for (const block of blocks) {
  const id       = block.match(/id:\s*'([^']+)'/)?.[1]
  const name     = block.match(/name:\s*'([^']+)'/)?.[1]
  const type     = block.match(/type:\s*'([^']+)'/)?.[1]
  const region   = block.match(/region:\s*'([^']+)'/)?.[1]
  const thumb    = block.match(/thumbnail:\s*'([^']+)'/)?.[1]
  if (id && name && type && region && thumb) {
    entries.push({ id, name, type, region, thumbnail: thumb })
  }
}

console.error(`Found ${entries.length} locations. Analysing…`)

const results = []
let idx = 0

for (const loc of entries) {
  idx++
  process.stderr.write(`  [${idx}/${entries.length}] ${loc.name}… `)
  try {
    const res = await fetch(`${BASE}/api/gemini-analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageUrl: loc.thumbnail,
        locationName: loc.name,
        locationType: loc.type,
        locationRegion: loc.region,
      }),
      signal: AbortSignal.timeout(30_000),
    })
    if (!res.ok) {
      const text = await res.text()
      console.error(`HTTP ${res.status}: ${text.slice(0, 80)}`)
      results.push({ ...loc, error: `HTTP ${res.status}` })
      continue
    }
    const data = await res.json()
    results.push({ ...loc, ...data })
    const status = data.correct ? '✅' : `❌ ${data.description?.slice(0, 60)}`
    console.error(status)
  } catch (err) {
    console.error(`ERROR: ${err.message}`)
    results.push({ ...loc, error: err.message })
  }
  // Respect rate limits
  await new Promise(r => setTimeout(r, 500))
}

// Write full report
writeFileSync(join(__dir, 'photo-report.json'), JSON.stringify(results, null, 2))

// Print summary of wrong ones
const wrong = results.filter(r => !r.correct || r.error)
console.log('\n=== WRONG / BROKEN PHOTOS ===')
for (const w of wrong) {
  console.log(`\n${w.id} (${w.name})`)
  console.log(`  thumb: ${w.thumbnail}`)
  if (w.error) console.log(`  error: ${w.error}`)
  else {
    console.log(`  desc:  ${w.description}`)
    console.log(`  issues: ${w.issues}`)
    console.log(`  search: ${w.suggestedSearch}`)
  }
}
console.log(`\n${wrong.length} wrong out of ${entries.length} total.`)
