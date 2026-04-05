import { NextRequest, NextResponse } from 'next/server'
import { WeatherData, DayForecast, HourlyPoint } from '@/types'

// Open-Meteo free API — no key required
function buildOpenMeteoUrl(lat: number, lng: number): string {
  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lng.toString(),
    current: 'temperature_2m,wind_speed_10m,cloud_cover,precipitation',
    daily: 'temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max,cloud_cover_mean',
    hourly: 'temperature_2m,cloud_cover,wind_speed_10m,precipitation',
    timezone: 'Atlantic/Reykjavik',
    forecast_days: '7',
  })
  return `https://api.open-meteo.com/v1/forecast?${params.toString()}`
}

// ── helpers ─────────────────────────────────────────────────────────────────

function getWeatherIcon(cloudCover: number, precipitation: number): string {
  if (precipitation > 5) return '⛈'
  if (precipitation > 1) return '🌧'
  if (precipitation > 0) return '🌦'
  if (cloudCover > 80) return '☁️'
  if (cloudCover > 50) return '⛅'
  if (cloudCover > 20) return '🌤'
  return '☀️'
}

function getWeatherCondition(cloudCover: number, precipitation: number): string {
  if (precipitation > 5) return 'Heavy Rain'
  if (precipitation > 1) return 'Rain'
  if (precipitation > 0.5) return 'Light Rain'
  if (cloudCover > 80) return 'Overcast'
  if (cloudCover > 50) return 'Mostly Cloudy'
  if (cloudCover > 20) return 'Partly Cloudy'
  return 'Clear'
}

function getWeatherQuality(
  cloudCover: number,
  windSpeed: number,
  precipitation: number
): DayForecast['quality'] {
  if (cloudCover < 20 && windSpeed < 20 && precipitation < 0.5) return 'excellent'
  if (cloudCover < 50 && windSpeed < 35 && precipitation < 2) return 'good'
  if (cloudCover < 80 && windSpeed < 50) return 'fair'
  return 'poor'
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function getMockWeatherData(lat: number, lng: number): WeatherData {
  const temp = Math.round(-2 + Math.random() * 12)
  const cloudCover = Math.round(30 + Math.random() * 50)
  const windSpeed = Math.round(10 + Math.random() * 30)
  const precip = Math.round(Math.random() * 3 * 10) / 10
  const today = new Date()

  const forecast: DayForecast[] = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today)
    d.setDate(d.getDate() + i)
    const dayName = i === 0 ? 'Today' : DAY_NAMES[d.getDay()]
    const dc = Math.round(20 + Math.random() * 70)
    const dw = Math.round(8 + Math.random() * 35)
    const dp = Math.round(Math.random() * 4 * 10) / 10
    const high = Math.round(-1 + Math.random() * 12)
    const low = Math.round(high - 3 - Math.random() * 5)
    return {
      day: dayName,
      icon: getWeatherIcon(dc, dp),
      high,
      low,
      windSpeed: dw,
      precipitation: dp,
      quality: getWeatherQuality(dc, dw, dp),
    }
  })

  return {
    temperature: temp,
    condition: getWeatherCondition(cloudCover, precip),
    windSpeed,
    windDirection: Math.round(Math.random() * 360),
    cloudCover,
    forecast,
    location: `${lat.toFixed(1)}°N, ${Math.abs(lng).toFixed(1)}°W`,
    elevation: 50,
  }
}

// ── Open-Meteo response types ─────────────────────────────────────────────

interface OpenMeteoCurrent {
  temperature_2m: number
  wind_speed_10m: number
  cloud_cover: number
  precipitation: number
}

interface OpenMeteoDaily {
  time: string[]
  temperature_2m_max: number[]
  temperature_2m_min: number[]
  precipitation_sum: number[]
  wind_speed_10m_max: number[]
  cloud_cover_mean: number[]
}

interface OpenMeteoHourly {
  time: string[]
  temperature_2m: number[]
  cloud_cover: number[]
  wind_speed_10m: number[]
  precipitation: number[]
}

interface OpenMeteoResponse {
  current: OpenMeteoCurrent
  daily: OpenMeteoDaily
  hourly: OpenMeteoHourly
}

// ── Route handler ─────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const lat = parseFloat(searchParams.get('lat') ?? '65.0')
  const lng = parseFloat(searchParams.get('lng') ?? '-19.0')

  const safeLat = isNaN(lat) ? 65.0 : Math.max(-90, Math.min(90, lat))
  const safeLng = isNaN(lng) ? -19.0 : Math.max(-180, Math.min(180, lng))

  try {
    const url = buildOpenMeteoUrl(safeLat, safeLng)
    const res = await fetch(url, {
      next: { revalidate: 1800 }, // cache 30 minutes
      headers: { 'User-Agent': 'IcelandApp/1.0' },
    })

    if (!res.ok) {
      console.warn('[weather/route] Open-Meteo fetch failed, status:', res.status)
      return NextResponse.json(getMockWeatherData(safeLat, safeLng))
    }

    const data: OpenMeteoResponse = await res.json()

    const current = data.current
    const daily = data.daily

    if (!current || !daily) {
      return NextResponse.json(getMockWeatherData(safeLat, safeLng))
    }

    const forecast: DayForecast[] = daily.time.map((dateStr, i) => {
      const d = new Date(dateStr)
      const dayName = i === 0 ? 'Today' : DAY_NAMES[d.getDay()]
      const dc = Math.round(daily.cloud_cover_mean[i] ?? 50)
      const dw = Math.round(daily.wind_speed_10m_max[i] ?? 20)
      const dp = Math.round((daily.precipitation_sum[i] ?? 0) * 10) / 10
      const high = Math.round(daily.temperature_2m_max[i] ?? 5)
      const low = Math.round(daily.temperature_2m_min[i] ?? 0)
      return {
        day: dayName,
        icon: getWeatherIcon(dc, dp),
        high,
        low,
        windSpeed: dw,
        precipitation: dp,
        quality: getWeatherQuality(dc, dw, dp),
      }
    })

    const cloudCover = Math.round(current.cloud_cover)
    const precipitation = current.precipitation ?? 0

    const hourlyByDay: HourlyPoint[][] = []
    if (data.hourly) {
      const h = data.hourly
      for (let day = 0; day < 7; day++) {
        const dayHours: HourlyPoint[] = []
        for (let hr = 0; hr < 24; hr++) {
          const idx = day * 24 + hr
          if (idx < h.time.length) {
            const dc = Math.round(h.cloud_cover[idx] ?? 50)
            const dw = Math.round(h.wind_speed_10m[idx] ?? 10)
            const dp = h.precipitation[idx] ?? 0
            dayHours.push({
              hour: hr,
              temperature: Math.round(h.temperature_2m[idx] ?? 0),
              icon: getWeatherIcon(dc, dp),
              windSpeed: dw,
            })
          }
        }
        hourlyByDay.push(dayHours)
      }
    }

    const weatherData: WeatherData = {
      temperature: Math.round(current.temperature_2m),
      condition: getWeatherCondition(cloudCover, precipitation),
      windSpeed: Math.round(current.wind_speed_10m),
      cloudCover,
      forecast,
      location: `${safeLat.toFixed(1)}°N, ${Math.abs(safeLng).toFixed(1)}°W`,
      hourlyByDay: hourlyByDay.length ? hourlyByDay : undefined,
    }

    return NextResponse.json(weatherData)
  } catch (err) {
    console.error('[weather/route] Error:', err)
    return NextResponse.json(getMockWeatherData(safeLat, safeLng))
  }
}
