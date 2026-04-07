export type Region =
  | 'ring-road'
  | 'highlands'
  | 'westfjords'
  | 'snaefellsnes'
  | 'reykjanes'
  | 'east'
  | 'north'
  | 'south'

export type LocationType =
  | 'waterfall'
  | 'glacier'
  | 'volcano'
  | 'lake'
  | 'canyon'
  | 'beach'
  | 'hot-spring'
  | 'lava'
  | 'mountain'
  | 'ruins'
  | 'geothermal'
  | 'valley'

export type Category = 'popular' | 'hidden-gem' | 'highland'
export type Season = 'spring' | 'summer' | 'autumn' | 'winter'
export type BestLight =
  | 'sunrise'
  | 'golden-hour'
  | 'midnight-sun'
  | 'overcast'
  | 'northern-lights'
  | 'sunset'
export type Difficulty = 'easy' | 'moderate' | 'hard' | 'extreme'

export type PlaceType = 'restaurant' | 'cafe' | 'hotel' | 'campsite' | 'geothermal-pool'
export type PriceRange = '$' | '$$' | '$$$' | '$$$$'

export interface Place {
  id: string
  name: string
  type: PlaceType
  region: Region
  coordinates: [number, number] // [lng, lat]
  priceRange: PriceRange
  cuisine?: string // for restaurants & cafes
  description: string
  address: string
  tags: string[]
  thumbnail: string
  rating?: number // 1.0–5.0
  openingHours?: string
  website?: string
}

export interface Location {
  id: string
  name: string
  icelandicName?: string
  coordinates: [number, number] // [lng, lat]
  elevation?: number // meters above sea level
  region: Region
  type: LocationType
  category: Category
  fRoad?: string // e.g. "F35" — requires 4WD
  bestSeason: Season[]
  bestLight: BestLight[]
  auroraRating?: 1 | 2 | 3 // 3=darkest sky, best for aurora
  description: string
  tags: string[]
  thumbnail: string // Unsplash image URL
  difficulty?: Difficulty
  distance?: number // km from Reykjavik
  hikingInfo?: string
}

export interface AuroraData {
  kpIndex: number // 0–9
  kpForecast: { time: string; kp: number }[]
  probability: number // 0–100%
  bestViewingTime?: string
  cloudCover?: number // 0–100%
  dataSource?: string // e.g. 'NOAA SWPC 1-min Kp'
}

export interface HourlyPoint {
  hour: number   // 0-23
  temperature: number
  icon: string
  windSpeed: number
}

export interface WeatherData {
  temperature: number // Celsius
  condition: string
  windSpeed: number // km/h
  windDirection?: number
  cloudCover: number // 0–100%
  forecast: DayForecast[]
  location?: string
  elevation?: number
  hourlyByDay?: HourlyPoint[][]  // 7 days × 24 hours
}

export interface DayForecast {
  day: string // e.g. "Sat"
  icon: string
  high: number
  low: number
  windSpeed: number
  precipitation?: number // mm
  quality: 'excellent' | 'good' | 'fair' | 'poor'
}

export interface SunInfo {
  date: Date
  dawn: Date
  sunrise: Date
  goldenHourEnd: Date
  noon: Date
  goldenHour: Date
  sunset: Date
  dusk: Date
  night: Date
  nadir: Date
  isMidnightSun: boolean
  isPolarNight: boolean
  azimuth: number     // current sun azimuth degrees 0-360
  altitude: number    // current sun altitude degrees -90 to 90
  sunriseAzimuth: number  // sun azimuth at moment of sunrise
  sunsetAzimuth: number   // sun azimuth at moment of sunset
}

export interface MoonInfo {
  phase: number // 0–1
  phaseName: string
  illumination: number // 0–100%
  rise?: Date
  set?: Date
}

export type ActiveTab = 'map' | 'spots' | 'compass' | 'aurora' | 'weather' | 'itineraries' | 'safety' | 'plan' | 'wildlife' | 'places' | 'ai-builder'

export interface WildlifeEntry {
  id: string
  name: string
  emoji: string
  months: number[] // 0=Jan, 11=Dec
  peakMonths: number[]
  locations: string[] // region names or place names
  description: string
  tips: string
  photo: string // Pexels image URL
}

export interface CustomTripStop {
  id: string // unique instance id
  locationId: string
  name: string
  thumbnail: string
  coordinates: [number, number]
  region: string
  type: string
  day: number // which day (1-indexed)
  driveFromPrev?: { km: number; minutes: number }
}

export interface RoadWarning {
  region: string
  severity: 'green' | 'yellow' | 'red'
  message: string
  type: 'wind' | 'snow' | 'ice' | 'flood' | 'closure' | 'general'
}

export interface FRoad {
  id: string       // e.g. "F26"
  name: string     // e.g. "Sprengisandur"
  region: string
  openMonth: number  // 0-indexed, typically June (5)
  closeMonth: number // typically September (8) or October (9)
  requiresSuperJeep: boolean
  description: string
}

export interface RouteStep {
  instruction: string
  distance: number    // meters
  duration: number    // seconds
  maneuver: string    // e.g. 'turn-left', 'turn-right', 'straight', 'arrive'
  streetName: string
  location: [number, number]  // [lng, lat] of the maneuver point
}

export interface RouteData {
  distance: number    // total meters
  duration: number    // total seconds
  geometry: { type: 'LineString'; coordinates: [number, number][] }
  steps: RouteStep[]
  isEstimate?: boolean  // true when real routing failed, using straight-line
}

export interface AppState {
  activeTab: ActiveTab
  selectedLocation: Location | null
  scrubTime: Date
  isToolsOpen: boolean
  isMapExpanded: boolean
  isSpotsExpanded: boolean
  typeFilter: LocationType | 'all'
  lightFilter: BestLight | 'all'
  regionFilter: Region | 'all'
}
