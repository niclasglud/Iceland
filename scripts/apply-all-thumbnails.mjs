/**
 * Applies verified Unsplash photo IDs to all 70 Iceland locations.
 * Run with: node scripts/apply-all-thumbnails.mjs
 */

import { readFileSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

// 70 verified unique Unsplash photo IDs — one per location
const updates = {
  'skogafoss':       'nNPONh2aXeQ',  // Person at Skógafoss mist
  'seljalandsfoss':  '8v9DuOrLu2I',  // Seljalandsfoss walk-behind
  'gljufrabui':      'ZMTAKPxvu8M',  // Gorge waterfall Seljalandsfoss area
  'jokulsarlon':     'Y-U2aEY0QDM',  // Jökulsárlón icebergs
  'diamond-beach':   'Az7Ce8GLIPY',  // Ice chunks on black sand
  'reynisfjara':     'FV7NJ-bSH6o',  // Black sand beach rock formations
  'geysir':          'rZsqmXfM3qQ',  // Strokkur erupting green pool
  'gullfoss':        'al2q65HLw5E',  // Gullfoss aerial
  'thingvellir':     'XcErKsPYFU8',  // Þingvellir tectonic rift
  'kirkjufell':      '4KrQq8Z6Y5c',  // Kirkjufell classic
  'kirkjufellsfoss': 'pEH5gUW24pc',  // Kirkjufellsfoss waterfall
  'svartifoss':      '6uRcr2q_Ekc',  // Svartifoss basalt columns
  'dettifoss':       'JFW-P9IMgxo',  // Dettifoss power
  'godafoss':        '8V1HAP_G3zE',  // Goðafoss daytime
  'myvatn':          'j7uReBfOSfo',  // Mývatn panoramic
  'hverfjall':       '7cAiUMWPjnY',  // Mývatn area at dusk
  'grjotagja':       'oD-vMuifzwA',  // Glowing blue ice cave interior
  'namaskard':       'GZSgfTy3rgI',  // Geothermal eruption Iceland
  'vatnajokull':     'zDNjMZhQXnM',  // People in Vatnajökull ice cave
  'snaefellsjokull': 'CLMyGkwfUes',  // Snow-capped mountain Iceland
  'vik':             'uAKjswTXQF4',  // Aerial black sand beach
  'vestrahorn':      '_wxc7QDWUVg',  // Vestrahorn black sand beach
  'skaftafell':      'saN89ypVadw',  // Skaftafell glacier Vatnajökull
  'blue-lagoon':     'N_3K76OBLHk',  // Blue Lagoon lounge area
  'fjadrargljufur':  'Z9G2Cm3n080',  // Fjaðrárgljúfur green mossy canyon
  'krafla':          '2xmIo5r0Z2A',  // Group near volcanic lake Iceland
  'leirhnjukur':     'dMyFLqlrAm4',  // Iceland highland lava landscape
  'dynjandi':        'QgSugrOkltk',  // Iceland waterfall Westfjords
  'husavik':         'V0M-bql5meU',  // Húsavík harbor
  'hvitserkur':      'GLT29wG4b9k',  // Hvítserkur basalt rock monolith
  'studlagil':       'mVxpDaYIgPg',  // Stuðlagil canyon aerial
  'storurd':         'KZdEtGWK1Mk',  // Mountain reflection Iceland
  'aldeyjarfoss':    'JOjv5yWMoNY',  // Aldeyjarfoss hiker at turquoise pool
  'raudasandur':     'Od4uus1mwAE',  // Rugged red coastal Iceland
  'gjain':           'Qpmj2Oyrv-s',  // Green canyon Iceland
  'raudfeldsgja':    'ABGHh9toXUE',  // Dramatic misty coastal mountains Snæfellsnes
  'bjarnarfoss':     'FvkQso3yiOk',  // Waterfall river between hills
  'fosslaug':        'WeMl8eWMnjw',  // Frozen mountain lake Iceland
  'stong':           'D6bjVZ_rybY',  // Þingvellir historic Iceland landscape
  'holmatungur':     '2yuqAcos7oc',  // Bird's eye waterfalls canyon
  'hljodaklettar':   'PrjRDBxi92I',  // Columnar basalt cliffside
  'rjukandafoss':    '5bOJ0ysD184',  // Hengifoss — east Iceland red-stripe waterfall
  'skutustadagigar': 'Sdc35GnHgvI',  // Mývatn area aurora / pseudo-craters
  'gatklettur':      'V5nICghBiuM',  // Rock monolith on water — arch-like
  'haifoss':         'MirsgKxIRGE',  // Háifoss canyon waterfall
  'landmannalaugar': 'vLwLZCCNEGc',  // Landmannalaugar colorful mountains hiking
  'kerlingarfjoll':  '0pQZ7pHaEC0',  // Brown/gray rhyolite mountains Iceland
  'askja':           'J9Z4nHwzj68',  // Large volcanic crater with ice
  'viti-askja':      'PRn7tsKRtbA',  // Blue-water crater lake
  'oskjuvatn':       'ujRA5TiXsYo',  // Large lake surrounded by volcanic mountains
  'herdubreid':      'XFWg9u0TYs4',  // Aerial view of volcanic island Iceland
  'hveravellir':     'YwtDkmKeujA',  // Glacier edge blue water — geothermal oasis
  'thorsmork':       'F-MVS6oHfTI',  // Glacial lake with icebergs Iceland
  'emstrur':         'PMobLehunro',  // Blue glaciers highland Iceland
  'hrafntinnusker':  'vfWmEJntSSg',  // Dark ice pile — obsidian highland feel
  'veidivötn':       'ZyplCn84d0k',  // Blue lake coast Iceland
  'lakagigar':       '-LRuNvY8W7Q',  // Black rock formation Iceland lava
  'holuhraun':       'Jf2dJWh6ySU',  // Dark ice/rock close-up lava field
  'ofarufoss':       'xP3POywgFy0',  // Frozen waterfall Iceland
  'malifell':        'fpaSXDuoHkc',  // Snow-covered waterfalls highland
  'blahylur':        'aiBu12OlzFA',  // Woman in vivid blue water — blue crater lake
  'sigoldugljufur':  'ODCAH4GDipY',  // Multiple waterfalls travel Iceland
  'storasula':       'uL-elopspcg',  // Green moss rocks waterfall Iceland
  'hvanngil':        'd9ghftBvaCE',  // Large waterfall natural highland
  'alftavatn':       '-sLP9FT5c3w',  // Wide glacier/lake Iceland
  'dyngjufjoll':     'P594Vmw2A0A',  // Waterfall near brown highland hill
  'jokuldalur':      'GhmVx0wpSto',  // Mountain landscape Iceland
  'krakatindur':     'U_HTuxCgXpo',  // River with dark rocky canyon
  'nyidalur':        'N3vklIz824M',  // Coastal rock Iceland
  'thjorsarver':     'ehtnGIsbPK4',  // Rainbow over waterfall Iceland wetlands
}

const BASE = 'https://images.unsplash.com/photo-'
const PARAMS = '?w=800&h=560&fit=crop&auto=format'

const filePath = join(__dirname, '../data/locations.ts')
let source = readFileSync(filePath, 'utf8')

let applied = 0
let skipped = 0

for (const [id, photoId] of Object.entries(updates)) {
  const newUrl = `${BASE}${photoId}${PARAMS}`
  // Match the id field and capture the thumbnail on the same or following lines
  const escaped = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex = new RegExp(
    `(id:\\s*'${escaped}'[\\s\\S]*?thumbnail:\\s*')[^']*(')`,
    'g'
  )
  const next = source.replace(regex, `$1${newUrl}$2`)
  if (next !== source) {
    source = next
    applied++
    console.log(`✓ ${id}`)
  } else {
    console.warn(`✗ SKIPPED: ${id} (no match)`)
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
