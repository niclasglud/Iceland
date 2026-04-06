import type { WildlifeEntry } from '@/types'

// Wildlife and seasonal nature guide for Iceland
// months: 0=Jan, 11=Dec. peakMonths = best viewing window.
export const WILDLIFE: WildlifeEntry[] = [
  {
    id: 'puffin',
    name: 'Atlantic Puffin',
    emoji: '🐦',
    months: [4, 5, 6, 7],       // May–Aug
    peakMonths: [5, 6],          // Jun–Jul
    locations: ['Westfjords', 'Vestmannaeyjar', 'Látrabjarg', 'Borgarfjörður Eystri', 'Dyrhólaey'],
    description: 'Iceland hosts the world\'s largest Atlantic puffin colony — over 8 million birds. They nest in clifftop burrows and are famously fearless around people.',
    tips: 'Best in the evening when they return from fishing. Látrabjarg cliffs in the Westfjords and Borgarfjörður Eystri in the East are top spots.',
    photo: 'https://images.pexels.com/photos/28744728/pexels-photo-28744728.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    id: 'humpback-whale',
    name: 'Humpback Whale',
    emoji: '🐋',
    months: [4, 5, 6, 7, 8],    // May–Sep
    peakMonths: [5, 6, 7],       // Jun–Aug
    locations: ['Húsavík', 'Dalvík', 'Akureyri', 'Skjálfandi Bay'],
    description: 'Húsavík is Europe\'s whale watching capital. Humpbacks feed on capelin and herring in Iceland\'s nutrient-rich waters, breaching dramatically in the bay.',
    tips: 'Húsavík has near-100% sighting rates in peak summer. Book a 3-hour boat tour early — they fill up weeks in advance.',
    photo: 'https://images.pexels.com/photos/6134257/pexels-photo-6134257.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    id: 'minke-whale',
    name: 'Minke Whale',
    emoji: '🐳',
    months: [4, 5, 6, 7, 8, 9], // May–Oct
    peakMonths: [5, 6, 7, 8],    // Jun–Sep
    locations: ['Húsavík', 'Reykjavík', 'Faxaflói Bay'],
    description: 'The most commonly seen whale in Iceland. Smaller and faster than humpbacks, minkes often surface close to tour boats for memorable encounters.',
    tips: 'Reykjavík whale watching tours from the Old Harbour depart year-round, with highest success rates from June to September.',
    photo: 'https://images.pexels.com/photos/22763975/pexels-photo-22763975.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    id: 'orca',
    name: 'Orca (Killer Whale)',
    emoji: '🐬',
    months: [0, 1, 2, 10, 11],  // Nov–Mar
    peakMonths: [0, 1, 2],       // Jan–Mar
    locations: ['Snæfellsnes', 'Grundarfjörður', 'Breiðafjörður'],
    description: 'Iceland\'s most spectacular whale sighting. Orcas follow herring migration into the fjords in winter, sometimes hunting in pods of 20+ animals visible from shore.',
    tips: 'Grundarfjörður on the Snæfellsnes Peninsula is the best shore-based viewing spot. Best seen from November to February from the harbour.',
    photo: 'https://images.pexels.com/photos/3325908/pexels-photo-3325908.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    id: 'arctic-fox',
    name: 'Arctic Fox',
    emoji: '🦊',
    months: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], // Year-round
    peakMonths: [2, 3, 7, 8],   // Mar/Apr (white coat) + Aug/Sep (blue morph)
    locations: ['Westfjords', 'Hornstrandir', 'Melrakkaslétta', 'Ísafjörður'],
    description: 'Iceland\'s only native land mammal. The Westfjords has the highest density. Arctic foxes come in two colour morphs — white in winter, blue-grey in summer.',
    tips: 'Hornstrandir Nature Reserve (Westfjords) is a protected area with no hunting — foxes here are unusually bold and approachable. Access by ferry from Ísafjörður.',
    photo: 'https://images.pexels.com/photos/26690634/pexels-photo-26690634.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    id: 'reindeer',
    name: 'Reindeer',
    emoji: '🦌',
    months: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], // Year-round
    peakMonths: [8, 9, 10],      // Sep–Nov (rutting season, herds visible)
    locations: ['East Iceland', 'Snæfell mountain', 'Lagarfljót', 'Fjarðabyggð'],
    description: 'Introduced from Norway in the 18th century, Iceland\'s wild reindeer herds live exclusively in the East. About 3,000 animals roam the eastern highlands.',
    tips: 'Drive the roads east of Egilsstaðir towards Snæfell and Lónsöræfi in autumn when herds come down from the highlands. Most common between 6pm–9pm.',
    photo: 'https://images.pexels.com/photos/1750825/pexels-photo-1750825.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    id: 'grey-seal',
    name: 'Grey & Harbour Seal',
    emoji: '🦭',
    months: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], // Year-round
    peakMonths: [5, 6, 7],       // Jun–Aug (pup season)
    locations: ['Vatnsnes Peninsula', 'Snæfellsnes', 'Jökulsárlón', 'South coast beaches'],
    description: 'Iceland has one of Europe\'s largest grey seal populations. Vatnsnes Peninsula in northwest Iceland is the most accessible colony, with hundreds of seals basking on rocks.',
    tips: 'Hvammstangi on the Vatnsnes Peninsula has a seal centre and regular sightings from shore. Pups are born in June — keep a respectful distance.',
    photo: 'https://images.pexels.com/photos/9181272/pexels-photo-9181272.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    id: 'arctic-tern',
    name: 'Arctic Tern',
    emoji: '🕊️',
    months: [4, 5, 6, 7],       // May–Aug
    peakMonths: [5, 6],          // Jun–Jul
    locations: ['Nationwide', 'Jökulsárlón', 'Þingvellir', 'Mývatn'],
    description: 'The world\'s longest migration — from Arctic to Antarctic and back (70,000 km). These feisty birds dive-bomb anyone near their nests. Carry a stick over your head.',
    tips: 'Common everywhere in summer. Jökulsárlón glacier lagoon has large colonies nesting on the icebergs. They will actually hit you — respect the warning dive.',
    photo: 'https://images.pexels.com/photos/11571637/pexels-photo-11571637.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    id: 'northern-lights',
    name: 'Northern Lights',
    emoji: '🌌',
    months: [8, 9, 10, 11, 0, 1, 2, 3], // Sep–Apr
    peakMonths: [9, 10, 11, 0, 1, 2],   // Oct–Mar
    locations: ['Nationwide', 'Þingvellir', 'Kirkjufell', 'Jökulsárlón', 'North Iceland'],
    description: 'Iceland sits directly under the auroral oval — one of the best places on Earth to see the Northern Lights. Need dark skies, clear weather, and KP ≥ 2.',
    tips: 'Check the Aurora tab for live KP index and forecasts. Drive away from Reykjavík to escape light pollution. Dark sky sites: Þingvellir, Kirkjufell, and north of Akureyri.',
    photo: 'https://images.pexels.com/photos/17214262/pexels-photo-17214262.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    id: 'midnight-sun',
    name: 'Midnight Sun',
    emoji: '☀️',
    months: [4, 5, 6, 7],       // May–Aug
    peakMonths: [5, 6],          // Jun–Jul (solstice)
    locations: ['Nationwide', 'Grímsey Island', 'Akureyri', 'North Iceland'],
    description: 'Around the summer solstice (June 21), the sun barely sets in Iceland. Grímsey island — straddling the Arctic Circle — has true midnight sun in June.',
    tips: 'In Reykjavík, twilight never fully disappears June–July. Bring a sleep mask! For true midnight sun, go to Grímsey or anywhere north of Akureyri.',
    photo: 'https://images.pexels.com/photos/20783827/pexels-photo-20783827.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    id: 'lupin',
    name: 'Lupin Fields',
    emoji: '💜',
    months: [5, 6],              // Jun–Jul
    peakMonths: [5, 6],
    locations: ['South Iceland', 'Hella', 'Þórsmörk', 'Ring Road (Rte 1)'],
    description: 'Invasive Nootka lupin covers large parts of Iceland in brilliant purple from late June through July. Controversial but undeniably photogenic against black sand and snow peaks.',
    tips: 'Best seen along Route 1 between Hella and Vík, and in the Þórsmörk valley. Peak colour: last week of June and first two weeks of July.',
    photo: 'https://images.pexels.com/photos/4338148/pexels-photo-4338148.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    id: 'glacier-lagoon-ice',
    name: 'Glacier Lagoon Icebergs',
    emoji: '🧊',
    months: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], // Year-round
    peakMonths: [6, 7, 8],       // Jul–Sep (most calving, most icebergs)
    locations: ['Jökulsárlón', 'Fjallsárlón', 'Diamond Beach'],
    description: 'Jökulsárlón glacier lagoon fills with icebergs calving from Breiðamerkurjökull glacier. The icebergs slowly drift out to Diamond Beach, where they glow like crystals on black sand.',
    tips: 'Visit at sunrise for the best light on the icebergs. Boat tours available in summer. The lagoon is always stunning but most dramatic in late summer and autumn.',
    photo: 'https://images.pexels.com/photos/29213491/pexels-photo-29213491.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
]

// Get wildlife active in a given month (0=Jan)
export function getWildlifeForMonth(month: number): WildlifeEntry[] {
  return WILDLIFE.filter((w) => w.months.includes(month))
}

// Get wildlife peaking in a given month
export function getPeakWildlifeForMonth(month: number): WildlifeEntry[] {
  return WILDLIFE.filter((w) => w.peakMonths.includes(month))
}

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
