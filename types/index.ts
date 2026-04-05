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
  azimuth: number // degrees 0-360
  altitude: number // degrees -90 to 90
}

export interface MoonInfo {
  phase: number // 0–1
  phaseName: string
  illumination: number // 0–100%
  rise?: Date
  set?: Date
}

export type ActiveTab = 'map' | 'spots' | 'compass' | 'aurora' | 'weather'

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
