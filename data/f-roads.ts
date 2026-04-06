import type { FRoad } from '@/types'

// F-road seasonal open/close data for Iceland
// Months are 0-indexed (0=Jan, 11=Dec)
// Opening dates vary by year and snowfall; these are typical averages
export const F_ROADS: FRoad[] = [
  {
    id: 'F26',
    name: 'Sprengisandur',
    region: 'Highlands',
    openMonth: 5,   // June
    closeMonth: 8,  // September
    requiresSuperJeep: false,
    description: 'Central highland route across the barren lava desert between north and south Iceland. 200km of remote highland.',
  },
  {
    id: 'F35',
    name: 'Kjalvegur',
    region: 'Highlands',
    openMonth: 5,   // June
    closeMonth: 9,  // October
    requiresSuperJeep: false,
    description: 'The most accessible highland route between Gullfoss and Blönduós. Passes Kerlingarfjöll geothermal area.',
  },
  {
    id: 'F208',
    name: 'Fjallabak (North)',
    region: 'South Highlands',
    openMonth: 5,   // June
    closeMonth: 8,  // September
    requiresSuperJeep: false,
    description: 'Access to Landmannalaugar — Iceland\'s most popular highland destination, famous for colourful rhyolite mountains.',
  },
  {
    id: 'F210',
    name: 'Fjallabak (South)',
    region: 'South Highlands',
    openMonth: 5,   // June
    closeMonth: 8,  // September
    requiresSuperJeep: false,
    description: 'Southern Fjallabak route connecting to Eldgjá lava canyon and Eldgjá volcanic fissure.',
  },
  {
    id: 'F225',
    name: 'Landmannaleið',
    region: 'South Highlands',
    openMonth: 6,   // July
    closeMonth: 8,  // September
    requiresSuperJeep: true,
    description: 'Route to Landmannalaugar from the north. Involves multiple river crossings — super-jeep or guided tour recommended.',
  },
  {
    id: 'F232',
    name: 'Öldufellsleið',
    region: 'South Highlands',
    openMonth: 6,   // July
    closeMonth: 8,  // September
    requiresSuperJeep: true,
    description: 'Access route to Þórsmörk. Multiple glacial river crossings make this one of Iceland\'s most challenging F-roads.',
  },
  {
    id: 'F249',
    name: 'Þórsmörk',
    region: 'South Highlands',
    openMonth: 5,   // June
    closeMonth: 9,  // October
    requiresSuperJeep: true,
    description: 'The famous Þórsmörk valley between Eyjafjallajökull and Mýrdalsjökull glaciers. Laugavegur trail terminus.',
  },
  {
    id: 'F337',
    name: 'Kerlingarfjöll',
    region: 'Highlands',
    openMonth: 5,   // June
    closeMonth: 8,  // September
    requiresSuperJeep: false,
    description: 'Access to Kerlingarfjöll geothermal mountain range. Spectacular rhyolite peaks with hot springs.',
  },
  {
    id: 'F550',
    name: 'Kaldidalur',
    region: 'West Highlands',
    openMonth: 4,   // May
    closeMonth: 9,  // October
    requiresSuperJeep: false,
    description: 'One of the earliest highland routes to open each year. Passes Langjökull glacier and Ok volcano.',
  },
  {
    id: 'F88',
    name: 'Öskjuleið',
    region: 'North Highlands',
    openMonth: 6,   // July
    closeMonth: 8,  // September
    requiresSuperJeep: false,
    description: 'Route to Askja caldera and Víti explosion crater. One of Iceland\'s most dramatic highland destinations.',
  },
  {
    id: 'F910',
    name: 'Austurleið',
    region: 'East Highlands',
    openMonth: 6,   // July
    closeMonth: 8,  // September
    requiresSuperJeep: true,
    description: 'Eastern highland route accessing remote interior. Very challenging conditions — requires experienced drivers.',
  },
  {
    id: 'F985',
    name: 'Holuhraun',
    region: 'North Highlands',
    openMonth: 6,   // July
    closeMonth: 8,  // September
    requiresSuperJeep: false,
    description: 'Access to the 2014-15 Holuhraun lava field — largest lava eruption in Iceland for 200 years.',
  },
]

// Returns current open/closed status for each F-road
export function getFRoadCurrentStatus(road: FRoad): 'open' | 'closed' | 'marginal' {
  const month = new Date().getMonth() // 0-indexed
  if (month > road.openMonth && month < road.closeMonth) return 'open'
  if (month === road.openMonth || month === road.closeMonth) return 'marginal'
  return 'closed'
}

export const STATUS_COLORS = {
  open:     { color: '#10b981', bg: 'rgba(16,185,129,0.12)', label: 'Open' },
  marginal: { color: '#f5a623', bg: 'rgba(245,166,35,0.12)', label: 'Marginal' },
  closed:   { color: '#ef4444', bg: 'rgba(239,68,68,0.12)',  label: 'Closed' },
}
