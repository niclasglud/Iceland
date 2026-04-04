import { WeatherData, DayForecast } from '@/types'

export function getWeatherQuality(
  cloudCover: number,
  windSpeed: number,
  precipitation: number
): DayForecast['quality'] {
  if (cloudCover < 20 && windSpeed < 20 && precipitation < 0.5) return 'excellent'
  if (cloudCover < 50 && windSpeed < 35 && precipitation < 2) return 'good'
  if (cloudCover < 80 && windSpeed < 50) return 'fair'
  return 'poor'
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function getWeatherIcon(cloudCover: number, precipitation: number, _windSpeed: number): string {
  if (precipitation > 5) return '⛈'
  if (precipitation > 1) return '🌧'
  if (precipitation > 0) return '🌦'
  if (cloudCover > 80) return '☁️'
  if (cloudCover > 50) return '⛅'
  if (cloudCover > 20) return '🌤'
  return '☀️'
}

export function getWeatherCondition(cloudCover: number, precipitation: number): string {
  if (precipitation > 5) return 'Heavy Rain'
  if (precipitation > 1) return 'Rain'
  if (precipitation > 0.5) return 'Light Rain'
  if (cloudCover > 80) return 'Overcast'
  if (cloudCover > 50) return 'Mostly Cloudy'
  if (cloudCover > 20) return 'Partly Cloudy'
  return 'Clear'
}

// Mock weather data for Iceland (center: 65°N, 19°W)
// In production: fetch from Open-Meteo API
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function getMockWeatherData(lat = 65.0, lng = -19.0): WeatherData {
  const temp = -2 + Math.random() * 12 // Iceland range: roughly -5 to 15°C
  const cloudCover = 30 + Math.random() * 50
  const windSpeed = 10 + Math.random() * 30
  const precip = Math.random() * 3

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const today = new Date()

  const forecast: DayForecast[] = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today)
    d.setDate(d.getDate() + i)
    const dayName = i === 0 ? 'Today' : days[d.getDay()]
    const dayCloud = 20 + Math.random() * 70
    const dayWind = 8 + Math.random() * 35
    const dayPrecip = Math.random() * 4
    const dayHigh = Math.round(-1 + Math.random() * 12)
    const dayLow = Math.round(dayHigh - 3 - Math.random() * 5)

    return {
      day: dayName,
      icon: getWeatherIcon(dayCloud, dayPrecip, dayWind),
      high: dayHigh,
      low: dayLow,
      windSpeed: Math.round(dayWind),
      precipitation: Math.round(dayPrecip * 10) / 10,
      quality: getWeatherQuality(dayCloud, dayWind, dayPrecip),
    }
  })

  return {
    temperature: Math.round(temp),
    condition: getWeatherCondition(cloudCover, precip),
    windSpeed: Math.round(windSpeed),
    windDirection: Math.round(Math.random() * 360),
    cloudCover: Math.round(cloudCover),
    forecast,
    location: 'Iceland',
    elevation: 50,
  }
}

export function getWindDirectionLabel(degrees: number): string {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
  return dirs[Math.round(degrees / 45) % 8]
}

export function getQualityColor(quality: DayForecast['quality']): string {
  switch (quality) {
    case 'excellent': return '#10b981'
    case 'good': return '#3b82f6'
    case 'fair': return '#f59e0b'
    case 'poor': return '#6b7280'
  }
}
