/**
 * Fetches correct thumbnail URLs for all 70 Iceland locations via Wikipedia API.
 * Run with: node scripts/fix-thumbnails.mjs
 */

import { readFileSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

// All 70 locations with Wikipedia search terms
const locations = [
  { id: 'skogafoss',         search: 'Skógafoss' },
  { id: 'seljalandsfoss',    search: 'Seljalandsfoss' },
  { id: 'gljufrabui',        search: 'Gljúfrabúi' },
  { id: 'jokulsarlon',       search: 'Jökulsárlón' },
  { id: 'diamond-beach',     search: 'Diamond Beach Iceland' },
  { id: 'reynisfjara',       search: 'Reynisfjara' },
  { id: 'geysir',            search: 'Geysir' },
  { id: 'gullfoss',          search: 'Gullfoss' },
  { id: 'thingvellir',       search: 'Þingvellir' },
  { id: 'kirkjufell',        search: 'Kirkjufell' },
  { id: 'kirkjufellsfoss',   search: 'Kirkjufellsfoss' },
  { id: 'svartifoss',        search: 'Svartifoss' },
  { id: 'dettifoss',         search: 'Dettifoss' },
  { id: 'godafoss',          search: 'Goðafoss' },
  { id: 'myvatn',            search: 'Mývatn' },
  { id: 'hverfjall',         search: 'Hverfjall' },
  { id: 'grjotagja',         search: 'Grjótagjá' },
  { id: 'namaskard',         search: 'Námaskarð' },
  { id: 'vatnajokull',       search: 'Vatnajökull' },
  { id: 'snaefellsjokull',   search: 'Snæfellsjökull' },
  { id: 'vik',               search: 'Vík í Mýrdal' },
  { id: 'vestrahorn',        search: 'Vestrahorn' },
  { id: 'skaftafell',        search: 'Skaftafell' },
  { id: 'blue-lagoon',       search: 'Blue Lagoon Iceland' },
  { id: 'fjadrargljufur',    search: 'Fjaðrárgljúfur' },
  { id: 'krafla',            search: 'Krafla' },
  { id: 'leirhnjukur',       search: 'Leirhnjúkur' },
  { id: 'dynjandi',          search: 'Dynjandi' },
  { id: 'husavik',           search: 'Húsavík' },
  { id: 'hvitserkur',        search: 'Hvítserkur' },
  { id: 'studlagil',         search: 'Stuðlagil' },
  { id: 'storurd',           search: 'Stórurð Iceland' },
  { id: 'aldeyjarfoss',      search: 'Aldeyjarfoss' },
  { id: 'raudasandur',       search: 'Rauðasandur' },
  { id: 'gjain',             search: 'Gjáin Iceland' },
  { id: 'raudfeldsgja',      search: 'Rauðfeldsgjá' },
  { id: 'bjarnarfoss',       search: 'Bjarnarfoss Iceland' },
  { id: 'fosslaug',          search: 'Fosslaug Iceland' },
  { id: 'stong',             search: 'Stöng Iceland' },
  { id: 'holmatungur',       search: 'Hólmatungur Iceland' },
  { id: 'hljodaklettar',     search: 'Hljóðaklettar' },
  { id: 'rjukandafoss',      search: 'Rjúkandafoss Iceland' },
  { id: 'skutustadagigar',   search: 'Skútustaðagígar' },
  { id: 'gatklettur',        search: 'Gatklettur Iceland' },
  { id: 'haifoss',           search: 'Háifoss' },
  { id: 'landmannalaugar',   search: 'Landmannalaugar' },
  { id: 'kerlingarfjoll',    search: 'Kerlingarfjöll' },
  { id: 'askja',             search: 'Askja Iceland' },
  { id: 'viti-askja',        search: 'Víti Iceland' },
  { id: 'oskjuvatn',         search: 'Öskjuvatn' },
  { id: 'herdubreid',        search: 'Herðubreið' },
  { id: 'hveravellir',       search: 'Hveravellir' },
  { id: 'thorsmork',         search: 'Þórsmörk' },
  { id: 'emstrur',           search: 'Emstrur Iceland' },
  { id: 'hrafntinnusker',    search: 'Hrafntinnusker Iceland' },
  { id: 'veidivötn',         search: 'Veiðivötn Iceland' },
  { id: 'lakagigar',         search: 'Lakagígar' },
  { id: 'holuhraun',         search: 'Holuhraun' },
  { id: 'ofarufoss',         search: 'Ófærufoss' },
  { id: 'malifell',          search: 'Mælifell Iceland' },
  { id: 'blahylur',          search: 'Bláhylur Iceland' },
  { id: 'sigoldugljufur',    search: 'Sigöldugljúfur Iceland' },
  { id: 'storasula',         search: 'Laugavegur Iceland highland' },
  { id: 'hvanngil',          search: 'Hvanngil Iceland' },
  { id: 'alftavatn',         search: 'Álftavatn Iceland' },
  { id: 'dyngjufjoll',       search: 'Dyngjufjöll Iceland' },
  { id: 'jokuldalur',        search: 'Jökuldalur Iceland' },
  { id: 'krakatindur',       search: 'Landmannalaugar obsidian Iceland' },
  { id: 'nyidalur',          search: 'Nýidalur Iceland' },
  { id: 'thjorsarver',       search: 'Þjórsárver Iceland' },
]

// Known-good Unsplash fallbacks for locations likely missing from Wikipedia
const unsplashFallbacks = {
  'diamond-beach':    'https://images.unsplash.com/photo-1531168530663-0700688c4ecc?w=800&h=560&fit=crop&auto=format',
  'gljufrabui':       'https://images.unsplash.com/photo-1504233529578-6d46baba6d34?w=800&h=560&fit=crop&auto=format',
  'kirkjufellsfoss':  'https://images.unsplash.com/photo-1483683804023-6ccdb62f86ef?w=800&h=560&fit=crop&auto=format',
  'bjarnarfoss':      'https://images.unsplash.com/photo-1547826559-53f3f5958b28?w=800&h=560&fit=crop&auto=format',
  'fosslaug':         'https://images.unsplash.com/photo-1518709766631-1b42b8f5d5e5?w=800&h=560&fit=crop&auto=format',
  'stong':            'https://images.unsplash.com/photo-1563807395249-7fb6186b5832?w=800&h=560&fit=crop&auto=format',
  'holmatungur':      'https://images.unsplash.com/photo-1500522144261-ea64433bbe27?w=800&h=560&fit=crop&auto=format',
  'rjukandafoss':     'https://images.unsplash.com/photo-1547826559-53f3f5958b28?w=800&h=560&fit=crop&auto=format',
  'gatklettur':       'https://images.unsplash.com/photo-1547036964-e57b8d7ca7a1?w=800&h=560&fit=crop&auto=format',
  'storurd':          'https://images.unsplash.com/photo-1595742744735-415fc20ef88f?w=800&h=560&fit=crop&auto=format',
  'gjain':            'https://images.unsplash.com/photo-1601447296369-a1637d750623?w=800&h=560&fit=crop&auto=format',
  'viti-askja':       'https://images.unsplash.com/photo-1601053073998-09597792705a?w=800&h=560&fit=crop&auto=format',
  'oskjuvatn':        'https://images.unsplash.com/photo-1539651044040-f5e5dc0a9ec3?w=800&h=560&fit=crop&auto=format',
  'emstrur':          'https://images.unsplash.com/photo-1490237014491-822aee911b99?w=800&h=560&fit=crop&auto=format',
  'hrafntinnusker':   'https://images.unsplash.com/photo-1473848153827-e617f4af6b15?w=800&h=560&fit=crop&auto=format',
  'veidivötn':        'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&h=560&fit=crop&auto=format',
  'holuhraun':        'https://images.unsplash.com/photo-1580217537073-6cd938f20ae8?w=800&h=560&fit=crop&auto=format',
  'blahylur':         'https://images.unsplash.com/photo-1554232682-b9ef9c92f8de?w=800&h=560&fit=crop&auto=format',
  'sigoldugljufur':   'https://images.unsplash.com/photo-1449528635524-39854b1fc119?w=800&h=560&fit=crop&auto=format',
  'storasula':        'https://images.unsplash.com/photo-1476610182048-b716b8518aae?w=800&h=560&fit=crop&auto=format',
  'hvanngil':         'https://images.unsplash.com/photo-1502082553048-f009a43e5fdf?w=800&h=560&fit=crop&auto=format',
  'alftavatn':        'https://images.unsplash.com/photo-1533424921032-4d2b27079224?w=800&h=560&fit=crop&auto=format',
  'dyngjufjoll':      'https://images.unsplash.com/photo-1509773896068-7fd393d5faf4?w=800&h=560&fit=crop&auto=format',
  'jokuldalur':       'https://images.unsplash.com/photo-1500522144261-ea64433bbe27?w=800&h=560&fit=crop&auto=format',
  'krakatindur':      'https://images.unsplash.com/photo-1548372290-6a3d418c6d0e?w=800&h=560&fit=crop&auto=format',
  'nyidalur':         'https://images.unsplash.com/photo-1489782419474-4d4221dc5b10?w=800&h=560&fit=crop&auto=format',
  'thjorsarver':      'https://images.unsplash.com/photo-1553528431-57359b7b23a3?w=800&h=560&fit=crop&auto=format',
}

async function getWikipediaImage(name) {
  try {
    // Try direct page lookup first
    const directUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(name)}&prop=pageimages&format=json&pithumbsize=800&redirects=1`
    const directRes = await fetch(directUrl, { headers: { 'User-Agent': 'IcelandApp/1.0' } })
    const directData = await directRes.json()
    const pages = directData.query?.pages
    if (pages) {
      const page = Object.values(pages)[0]
      if (page.thumbnail?.source && !page.missing) {
        return page.thumbnail.source
      }
    }

    // Fall back to search
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(name)}&format=json&srlimit=3`
    const searchRes = await fetch(searchUrl, { headers: { 'User-Agent': 'IcelandApp/1.0' } })
    const searchData = await searchRes.json()
    const results = searchData.query?.search
    if (results?.length > 0) {
      for (const result of results.slice(0, 2)) {
        const imgUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(result.title)}&prop=pageimages&format=json&pithumbsize=800`
        const imgRes = await fetch(imgUrl, { headers: { 'User-Agent': 'IcelandApp/1.0' } })
        const imgData = await imgRes.json()
        const imgPages = imgData.query?.pages
        if (imgPages) {
          const p = Object.values(imgPages)[0]
          if (p.thumbnail?.source) return p.thumbnail.source
        }
      }
    }
  } catch (e) {
    console.error(`  Error fetching Wikipedia for "${name}": ${e.message}`)
  }
  return null
}

async function main() {
  const filePath = join(__dirname, '../data/locations.ts')
  let source = readFileSync(filePath, 'utf8')

  const updates = {}
  let wikiCount = 0
  let fallbackCount = 0
  let skipCount = 0

  console.log(`Processing ${locations.length} locations...\n`)

  for (const loc of locations) {
    process.stdout.write(`[${locations.indexOf(loc) + 1}/${locations.length}] ${loc.id}... `)

    // Try Wikipedia first
    const wikiUrl = await getWikipediaImage(loc.search)
    if (wikiUrl) {
      updates[loc.id] = wikiUrl + (wikiUrl.includes('?') ? '&' : '?') + 'w=800&h=560&fit=crop'
      console.log(`✓ Wikipedia`)
      wikiCount++
    } else if (unsplashFallbacks[loc.id]) {
      updates[loc.id] = unsplashFallbacks[loc.id]
      console.log(`↩ Fallback (Unsplash)`)
      fallbackCount++
    } else {
      console.log(`✗ No image found, keeping original`)
      skipCount++
    }

    // Small delay to be respectful to Wikipedia API
    await new Promise(r => setTimeout(r, 200))
  }

  console.log(`\nResults: ${wikiCount} Wikipedia, ${fallbackCount} fallbacks, ${skipCount} skipped`)
  console.log(`Applying ${Object.keys(updates).length} updates to locations.ts...`)

  // Apply updates using regex replacement
  let updatedSource = source
  let applied = 0
  for (const [id, url] of Object.entries(updates)) {
    const escapedId = id.replace(/[-]/g, '\\-')
    const regex = new RegExp(
      `(id:\\s*['"]${escapedId}['"][\\s\\S]*?thumbnail:\\s*')[^'"]*(')`,
      'g'
    )
    const newSource = updatedSource.replace(regex, `$1${url}$2`)
    if (newSource !== updatedSource) {
      updatedSource = newSource
      applied++
    } else {
      console.warn(`  WARNING: Could not apply update for ${id}`)
    }
  }

  writeFileSync(filePath, updatedSource, 'utf8')
  console.log(`\n✅ Applied ${applied}/${Object.keys(updates).length} updates to data/locations.ts`)
}

main().catch(console.error)
