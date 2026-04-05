'use client'
import SunCalc from 'suncalc'
import { SunInfo, MoonInfo } from '@/types'

// Center of Iceland for default calculations
export const ICELAND_CENTER: [number, number] = [-19.0, 65.0]

export function getSunInfo(date: Date, lng: number, lat: number): SunInfo {
  const times = SunCalc.getTimes(date, lat, lng)
  const pos = SunCalc.getPosition(date, lat, lng)

  // Check for midnight sun (no real sunset/sunrise)
  const isMidnightSun =
    isNaN(times.sunrise.getTime()) &&
    date.getMonth() >= 4 && date.getMonth() <= 7

  // Check for polar night
  const isPolarNight =
    isNaN(times.sunrise.getTime()) &&
    (date.getMonth() <= 1 || date.getMonth() >= 10)

  const azimuth = ((pos.azimuth * 180) / Math.PI + 180) % 360
  const altitude = (pos.altitude * 180) / Math.PI

  return {
    date,
    dawn: times.dawn,
    sunrise: times.sunrise,
    goldenHourEnd: times.goldenHourEnd,
    noon: times.solarNoon,
    goldenHour: times.goldenHour,
    sunset: times.sunset,
    dusk: times.dusk,
    night: times.night,
    nadir: times.nadir,
    isMidnightSun,
    isPolarNight,
    azimuth,
    altitude,
  }
}

export function getMoonInfo(date: Date, lng: number, lat: number): MoonInfo {
  const moonIllum = SunCalc.getMoonIllumination(date)
  const moonTimes = SunCalc.getMoonTimes(date, lat, lng)

  const phaseNames = [
    'New Moon',
    'Waxing Crescent',
    'First Quarter',
    'Waxing Gibbous',
    'Full Moon',
    'Waning Gibbous',
    'Last Quarter',
    'Waning Crescent',
  ]
  const phaseIndex = Math.round(moonIllum.phase * 8) % 8

  return {
    phase: moonIllum.phase,
    phaseName: phaseNames[phaseIndex],
    illumination: Math.round(moonIllum.fraction * 100),
    rise: moonTimes.rise || undefined,
    set: moonTimes.set || undefined,
  }
}

export function formatTime(date: Date | undefined): string {
  if (!date || isNaN(date.getTime())) return '--:--'
  return date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Atlantic/Reykjavik',
  })
}

export function getCountdown(target: Date): string {
  if (!target || isNaN(target.getTime())) return '--'
  const now = new Date()
  const diffMs = target.getTime() - now.getTime()
  if (diffMs < 0) return 'passed'
  if (diffMs < 60000) return 'now'
  const h = Math.floor(diffMs / 3600000)
  const m = Math.floor((diffMs % 3600000) / 60000)
  if (h > 0) return `in ${h}h ${m}m`
  return `in ${m}m`
}

export function getCurrentLightPhase(sunInfo: SunInfo): {
  phase: string
  color: string
} {
  const now = new Date()

  if (sunInfo.isMidnightSun) return { phase: 'Midnight Sun', color: '#f5a623' }
  if (sunInfo.isPolarNight) return { phase: 'Polar Night', color: '#4a9eff' }

  if (isNaN(sunInfo.sunrise.getTime())) return { phase: 'Daylight', color: '#4a9eff' }

  if (now < sunInfo.dawn) return { phase: 'Night', color: '#4a9eff' }
  if (now < sunInfo.sunrise) return { phase: 'Dawn', color: '#f59e0b' }
  if (now < sunInfo.goldenHourEnd) return { phase: 'Golden Hour AM', color: '#f5a623' }
  if (now < sunInfo.goldenHour) return { phase: 'Daylight', color: '#60a5fa' }
  if (now < sunInfo.sunset) return { phase: 'Golden Hour PM', color: '#f5a623' }
  if (now < sunInfo.dusk) return { phase: 'Sunset', color: '#ef4444' }
  if (now < sunInfo.night) return { phase: 'Dusk', color: '#8b5cf6' }
  return { phase: 'Night', color: '#4a9eff' }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function getSunSliderPercent(date: Date, sunInfo: SunInfo): number {
  const dayStart = new Date(date)
  dayStart.setHours(0, 0, 0, 0)
  const dayEnd = new Date(date)
  dayEnd.setHours(23, 59, 59, 999)
  const totalMs = dayEnd.getTime() - dayStart.getTime()
  const elapsed = date.getTime() - dayStart.getTime()
  return Math.max(0, Math.min(100, (elapsed / totalMs) * 100))
}

export function sliderPercentToDate(percent: number): Date {
  const now = new Date()
  const dayStart = new Date(now)
  dayStart.setHours(0, 0, 0, 0)
  const dayEnd = new Date(now)
  dayEnd.setHours(23, 59, 59, 999)
  const ms = dayStart.getTime() + (percent / 100) * (dayEnd.getTime() - dayStart.getTime())
  return new Date(ms)
}

export function getMoonPhaseEmoji(phaseName: string): string {
  const map: Record<string, string> = {
    'New Moon': '🌑',
    'Waxing Crescent': '🌒',
    'First Quarter': '🌓',
    'Waxing Gibbous': '🌔',
    'Full Moon': '🌕',
    'Waning Gibbous': '🌖',
    'Last Quarter': '🌗',
    'Waning Crescent': '🌘',
  }
  return map[phaseName] || '🌕'
}
