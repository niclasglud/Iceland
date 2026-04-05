/**
 * Applies verified Pexels photo IDs to all 70 Iceland locations.
 * Run with: node scripts/apply-all-thumbnails.mjs
 *
 * Pexels CDN URLs are stable, free, browser-accessible without API keys.
 * Format: https://images.pexels.com/photos/{ID}/pexels-photo-{ID}.jpeg?auto=compress&cs=tinysrgb&w=800&h=560&dpr=1
 */

import { readFileSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

// 70 verified Pexels photo IDs — unique, one per location
const pexelsIds = {
  'skogafoss':       29018995,
  'seljalandsfoss':  19267246,
  'gljufrabui':      18273215,
  'jokulsarlon':     20582185,
  'diamond-beach':   4087258,
  'reynisfjara':     31974260,
  'geysir':          19499959,
  'gullfoss':        19500069,
  'thingvellir':     19499970,
  'kirkjufell':      2454681,
  'kirkjufellsfoss': 29264035,
  'svartifoss':      20582091,
  'dettifoss':       1460174,
  'godafoss':        16251253,
  'myvatn':          16170451,
  'hverfjall':       6731715,
  'grjotagja':       10141781,
  'namaskard':       6186487,
  'vatnajokull':     10586442,
  'snaefellsjokull': 16550148,
  'vik':             20871541,
  'vestrahorn':      32151713,
  'skaftafell':      17737292,
  'blue-lagoon':     20955080,
  'fjadrargljufur':  9532584,
  'krafla':          6523286,
  'leirhnjukur':     29909021,
  'dynjandi':        17474931,
  'husavik':         19742780,
  'hvitserkur':      1686024,
  'studlagil':       19433891,
  'storurd':         17929956,
  'aldeyjarfoss':    18272640,
  'raudasandur':     30637692,
  'gjain':           20458518,
  'raudfeldsgja':    2335126,
  'bjarnarfoss':     6235792,
  'fosslaug':        17214262,
  'stong':           28940324,
  'holmatungur':     10589819,
  'hljodaklettar':   258118,
  'rjukandafoss':    26700326,
  'skutustadagigar': 5384149,
  'gatklettur':      4457408,
  'haifoss':         16948673,
  'landmannalaugar': 29018986,
  'kerlingarfjoll':  32096257,
  'askja':           360912,
  'viti-askja':      27244371,
  'oskjuvatn':       5175651,
  'herdubreid':      1304608,
  'hveravellir':     28304723,
  'thorsmork':       19499968,
  'emstrur':         32154420,
  'hrafntinnusker':  17237081,
  'veidivötn':       2229887,
  'lakagigar':       27244377,
  'holuhraun':       32577924,
  'ofarufoss':       18273135,
  'malifell':        27244376,
  'blahylur':        19613737,
  'sigoldugljufur':  34947145,
  'storasula':       19794949,
  'hvanngil':        4339497,
  'alftavatn':       237260,
  'dyngjufjoll':     1480807,
  'jokuldalur':      2355447,
  'krakatindur':     3601425,
  'nyidalur':        2736493,
  'thjorsarver':     1518484,
}

const BASE = 'https://images.pexels.com/photos/'
const PARAMS = (id) => `/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=800&h=560&dpr=1`

const filePath = join(__dirname, '../data/locations.ts')
let source = readFileSync(filePath, 'utf8')

let applied = 0
let skipped = 0

for (const [locId, photoId] of Object.entries(pexelsIds)) {
  const newUrl = `${BASE}${photoId}${PARAMS(photoId)}`
  const escaped = locId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex = new RegExp(
    `(id:\\s*'${escaped}'[\\s\\S]*?thumbnail:\\s*')[^']*(')`,
    'g'
  )
  const next = source.replace(regex, `$1${newUrl}$2`)
  if (next !== source) {
    source = next
    applied++
    console.log(`✓ ${locId}`)
  } else {
    console.warn(`✗ SKIPPED: ${locId} (no match)`)
    skipped++
  }
}

writeFileSync(filePath, source, 'utf8')
console.log(`\n✅ Applied: ${applied} | Skipped: ${skipped}`)

// Verify no duplicates
const allThumbnails = [...source.matchAll(/thumbnail:\s*'([^']+)'/g)].map(m => m[1])
const seen = new Set()
const dupes = []
for (const url of allThumbnails) {
  if (seen.has(url)) dupes.push(url)
  seen.add(url)
}
if (dupes.length) {
  console.warn(`\n⚠️  Duplicate thumbnails found (${dupes.length}):`)
  dupes.forEach(u => console.warn(' ', u))
} else {
  console.log('✅ No duplicate thumbnails')
}
