'use client'

import { SunInfo, MoonInfo, WeatherData } from '@/types'
import {
  getSunSliderPercent,
  sliderPercentToDate,
  formatTime,
  getMoonPhaseEmoji,
} from '@/lib/suncalc-utils'
import { getQualityColor } from '@/lib/weather'

interface BottomPanelProps {
  sunInfo: SunInfo
  moonInfo: MoonInfo
  weather: WeatherData
  scrubTime: Date
  onScrub: (date: Date) => void
  isNightMode: boolean
  onNightModeToggle: () => void
}

interface SliderLabel {
  label: string
  time: string
  isOrange: boolean
}


function qualityBgColor(quality: string): string {
  switch (quality) {
    case 'excellent': return 'rgba(16,185,129,0.18)'
    case 'good':      return 'rgba(59,130,246,0.18)'
    case 'fair':      return 'rgba(245,158,11,0.18)'
    default:          return 'rgba(107,114,128,0.18)'
  }
}

function qualityLabel(quality: string): string {
  if (quality === 'excellent') return 'Great'
  return quality.charAt(0).toUpperCase() + quality.slice(1)
}

export default function BottomPanel({
  sunInfo,
  moonInfo,
  weather,
  scrubTime,
  onScrub,
  isNightMode,
  onNightModeToggle,
}: BottomPanelProps) {
  // Slider 0–100 value
  const sliderValue = getSunSliderPercent(scrubTime, sunInfo)

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onScrub(sliderPercentToDate(Number(e.target.value)))
  }

  // Determine current time-of-day label from scrubTime
  const now = scrubTime
  let currentPeriod = 'Night'
  if (!isNaN(sunInfo.sunrise?.getTime())) {
    if (now < sunInfo.dawn)                          currentPeriod = 'Night'
    else if (now < sunInfo.sunrise)                  currentPeriod = 'Dawn'
    else if (now < sunInfo.goldenHourEnd)            currentPeriod = 'Golden Hour'
    else if (now < sunInfo.goldenHour)               currentPeriod = 'Daylight'
    else if (now < sunInfo.sunset)                   currentPeriod = 'Golden Hour'
    else if (now < sunInfo.dusk)                     currentPeriod = 'Sunset'
    else if (now < sunInfo.night)                    currentPeriod = 'Dusk'
  } else if (sunInfo.isMidnightSun) {
    currentPeriod = 'Midnight Sun'
  } else if (sunInfo.isPolarNight) {
    currentPeriod = 'Polar Night'
  }

  // Five evenly-spread slider labels
  const sliderLabels: SliderLabel[] = [
    { label: 'Dawn',    time: formatTime(sunInfo.dawn),    isOrange: false },
    { label: 'Sunrise', time: formatTime(sunInfo.sunrise), isOrange: true  },
    { label: 'Noon',    time: formatTime(sunInfo.noon),    isOrange: false },
    { label: 'Sunset',  time: formatTime(sunInfo.sunset),  isOrange: true  },
    { label: 'Night',   time: formatTime(sunInfo.night),   isOrange: false },
  ]

  // Moon
  const moonEmoji = getMoonPhaseEmoji(moonInfo.phaseName)
  const moonRise  = moonInfo.rise ? formatTime(moonInfo.rise) : '--:--'
  const moonSet   = moonInfo.set  ? formatTime(moonInfo.set)  : '--:--'

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-40 flex flex-col"
      style={{
        background: 'rgba(10,11,14,0.95)',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        paddingBottom: 'env(safe-area-inset-bottom, 8px)',
      }}
    >
      <div className="flex flex-col gap-2 px-3 pt-2.5 pb-1">

        {/* ── Row 1: Day/Night toggle  +  Sun position ── */}
        <div className="flex items-center justify-between">
          {/* Toggle */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => isNightMode && onNightModeToggle()}
              className="px-3 rounded-full text-xs font-semibold transition-all duration-150"
              style={{
                height: '26px',
                background: !isNightMode ? '#f5a623' : 'rgba(255,255,255,0.08)',
                color:      !isNightMode ? '#0a0b0e' : '#8a8f9e',
              }}
            >
              Day
            </button>
            <button
              onClick={() => !isNightMode && onNightModeToggle()}
              className="px-3 rounded-full text-xs font-semibold transition-all duration-150"
              style={{
                height: '26px',
                background: isNightMode ? '#4a9eff' : 'rgba(255,255,255,0.08)',
                color:      isNightMode ? '#0a0b0e' : '#8a8f9e',
              }}
            >
              Night
            </button>
          </div>

          {/* Sun position */}
          <div className="flex items-center gap-3 text-xs" style={{ color: '#8a8f9e' }}>
            <span>
              Sun{' '}
              <span className="font-semibold text-white">
                {Math.round(sunInfo.altitude)}°
              </span>{' '}
              alt
            </span>
            <span>
              Az{' '}
              <span className="font-semibold text-white">
                {Math.round(sunInfo.azimuth)}°
              </span>
            </span>
            <span
              className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
              style={{ background: 'rgba(255,255,255,0.06)', color: '#8a8f9e' }}
            >
              {currentPeriod}
            </span>
          </div>
        </div>

        {/* ── Row 2: Sun scrub slider ── */}
        <div className="flex flex-col gap-1.5">
          {/* Track + thumb */}
          <div className="relative flex items-center" style={{ height: '18px' }}>
            <input
              type="range"
              min={0}
              max={100}
              step={0.1}
              value={sliderValue}
              onChange={handleSliderChange}
              aria-label="Time of day scrubber"
              className="w-full appearance-none cursor-pointer"
              style={{
                height: '4px',
                borderRadius: '9999px',
                background: `linear-gradient(to right, #f5a623 ${sliderValue}%, rgba(255,255,255,0.15) ${sliderValue}%)`,
                accentColor: '#f5a623',
                outline: 'none',
              }}
            />
          </div>

          {/* 5 time labels: Dawn | Sunrise | Noon | Sunset | Night */}
          <div className="flex justify-between">
            {sliderLabels.map((item) => (
              <div key={item.label} className="flex flex-col items-center" style={{ width: '20%' }}>
                <span
                  className="text-[10px] font-medium leading-tight"
                  style={{ color: item.isOrange ? '#f5a623' : '#8a8f9e' }}
                >
                  {item.label}
                </span>
                <span
                  className="text-[10px] leading-tight tabular-nums"
                  style={{ color: item.isOrange ? '#f5a623' : '#6b7280' }}
                >
                  {item.time}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Row 3: Moon phase ── */}
        <div
          className="flex items-center gap-2 px-2.5 py-1 rounded-lg"
          style={{ background: 'rgba(255,255,255,0.04)' }}
        >
          <span className="text-base leading-none">{moonEmoji}</span>
          <span className="text-xs font-medium text-white">{moonInfo.phaseName}</span>
          <span className="text-xs" style={{ color: '#8a8f9e' }}>
            {moonInfo.illumination}% lit
          </span>
          <div className="ml-auto flex items-center gap-2 text-xs" style={{ color: '#8a8f9e' }}>
            <span>↑ {moonRise}</span>
            <span>↓ {moonSet}</span>
          </div>
        </div>

        {/* ── Row 4: Current weather ── */}
        <div
          className="flex items-center gap-3 px-2.5 py-1.5 rounded-lg"
          style={{ background: 'rgba(255,255,255,0.04)' }}
        >
          <span className="text-xl font-bold text-white leading-none">
            {weather.temperature > 0 ? weather.temperature : weather.temperature}°C
          </span>
          <span className="text-xs font-medium" style={{ color: '#8a8f9e' }}>
            {weather.condition}
          </span>
          <span className="text-xs" style={{ color: '#8a8f9e' }}>
            🌬 {weather.windSpeed}&nbsp;km/h
          </span>
          <span
            className="ml-auto text-xs font-semibold truncate max-w-[80px]"
            style={{ color: '#4a9eff' }}
          >
            {weather.location ?? 'Iceland'}
          </span>
        </div>

        {/* ── Row 5: 7-day forecast — horizontal scroll ── */}
        <div
          className="overflow-x-auto -mx-3 px-3 pb-1"
          style={{ scrollbarWidth: 'none' }}
        >
          <div className="flex gap-2" style={{ width: 'max-content' }}>
            {weather.forecast.map((day, idx) => {
              const isToday     = idx === 0
              const qColor      = getQualityColor(day.quality)
              const qBg         = qualityBgColor(day.quality)
              return (
                <div
                  key={`${day.day}-${idx}`}
                  className="flex flex-col items-center gap-0.5 px-2 pt-1.5 pb-1.5 rounded-xl shrink-0"
                  style={{
                    background: 'rgba(18,20,28,0.95)',
                    border: isToday
                      ? '1px solid #f5a623'
                      : '1px solid rgba(255,255,255,0.08)',
                    minWidth: '58px',
                  }}
                >
                  {/* Day name */}
                  <span
                    className="text-[10px] font-bold leading-tight"
                    style={{ color: isToday ? '#f5a623' : '#8a8f9e' }}
                  >
                    {day.day}
                  </span>

                  {/* Weather icon */}
                  <span className="text-[18px] leading-tight">{day.icon}</span>

                  {/* High / Low temps */}
                  <div className="flex items-baseline gap-1">
                    <span className="text-[11px] font-bold text-white">
                      {day.high > 0 ? '+' : ''}{day.high}°
                    </span>
                    <span className="text-[10px]" style={{ color: '#8a8f9e' }}>
                      {day.low}°
                    </span>
                  </div>

                  {/* Wind */}
                  <span className="text-[9px] leading-tight" style={{ color: '#8a8f9e' }}>
                    {day.windSpeed}&nbsp;km/h
                  </span>

                  {/* Quality badge */}
                  <span
                    className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full"
                    style={{ color: qColor, background: qBg }}
                  >
                    {qualityLabel(day.quality)}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

      </div>

      {/* Hide webkit scrollbars on forecast row */}
      <style>{`
        .bottom-panel-scroll::-webkit-scrollbar { display: none; }
        div[class*="overflow-x-auto"]::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  )
}
