import { Location, WeatherData, SunInfo, AuroraData } from '@/types'

export function getFRoadStatus(month: number): { open: boolean; label: string; color: string } {
  // F-roads in Iceland: typically open June 1 – October 1 (months 5–8 in 0-indexed)
  const open = month >= 5 && month <= 8
  return {
    open,
    label: open ? 'Open' : month < 5 ? 'Opens ~Jun 1' : 'Closed until Jun',
    color: open ? '#10b981' : '#ef4444',
  }
}

function scoreSpotForToday(
  location: Location,
  weather: WeatherData,
  sunInfo: SunInfo,
  auroraData: AuroraData
): number {
  let score = 0

  // Weather quality (0–40 pts)
  const qualityMap: Record<string, number> = { excellent: 40, good: 30, fair: 15, poor: 5 }
  score += qualityMap[weather.forecast[0]?.quality ?? 'fair'] ?? 15

  // Cloud cover bonus — lower cloud = higher score (0–20 pts)
  score += (1 - weather.cloudCover / 100) * 20

  // Sun/light alignment (0–25 pts)
  const now = new Date()
  const { bestLight } = location
  const isGoldenAM = now >= sunInfo.dawn && now <= sunInfo.goldenHourEnd
  const isGoldenPM = now >= sunInfo.goldenHour && now <= sunInfo.dusk

  if (
    (isGoldenAM || isGoldenPM) &&
    (bestLight.includes('golden-hour') || bestLight.includes('sunrise') || bestLight.includes('sunset'))
  ) {
    score += 25
  } else if (isGoldenAM && bestLight.includes('sunrise')) {
    score += 20
  } else if (isGoldenPM && bestLight.includes('sunset')) {
    score += 20
  } else if (sunInfo.isMidnightSun && bestLight.includes('midnight-sun')) {
    score += 25
  }

  // Aurora bonus (0–15 pts)
  if (bestLight.includes('northern-lights') && auroraData.kpIndex >= 3) {
    score += Math.min(15, auroraData.kpIndex * 2)
  }

  return score
}

export function getBestSpotsToday(
  locations: Location[],
  weather: WeatherData,
  sunInfo: SunInfo,
  auroraData: AuroraData,
  count = 5
): Location[] {
  return [...locations]
    .map((loc) => ({ loc, score: scoreSpotForToday(loc, weather, sunInfo, auroraData) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, count)
    .map((x) => x.loc)
}
