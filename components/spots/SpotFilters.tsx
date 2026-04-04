'use client'

interface SpotFiltersProps {
  typeFilter: string
  lightFilter: string
  onTypeFilterChange: (f: string) => void
  onLightFilterChange: (f: string) => void
}

const TYPE_FILTERS: { value: string; label: string; emoji: string }[] = [
  { value: 'all',        label: 'All',         emoji: '' },
  { value: 'waterfall',  label: 'Waterfall',   emoji: '🌊' },
  { value: 'mountain',   label: 'Mountain',    emoji: '🏔️' },
  { value: 'volcano',    label: 'Volcano',     emoji: '🌋' },
  { value: 'glacier',    label: 'Glacier',     emoji: '❄️' },
  { value: 'beach',      label: 'Beach',       emoji: '🏖️' },
  { value: 'hot-spring', label: 'Hot Spring',  emoji: '♨️' },
  { value: 'canyon',     label: 'Canyon',      emoji: '🪨' },
  { value: 'highland',   label: 'Highland',    emoji: '🌿' },
  { value: 'lake',       label: 'Lake',        emoji: '💧' },
  { value: 'lava',       label: 'Lava',        emoji: '🔥' },
  { value: 'geothermal', label: 'Geothermal',  emoji: '💨' },
]

const LIGHT_FILTERS: { value: string; label: string; emoji: string }[] = [
  { value: 'all',             label: 'All',           emoji: '' },
  { value: 'sunrise',         label: 'Sunrise',       emoji: '🌅' },
  { value: 'golden-hour',     label: 'Golden Hour',   emoji: '🌇' },
  { value: 'sunset',          label: 'Sunset',        emoji: '🌆' },
  { value: 'midnight-sun',    label: 'Midnight Sun',  emoji: '☀️' },
  { value: 'northern-lights', label: 'Aurora',        emoji: '🌌' },
  { value: 'overcast',        label: 'Overcast',      emoji: '☁️' },
]

export default function SpotFilters({
  typeFilter,
  lightFilter,
  onTypeFilterChange,
  onLightFilterChange,
}: SpotFiltersProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {/* Type filter row */}
      <div
        className="flex gap-1.5 overflow-x-auto"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {TYPE_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => onTypeFilterChange(f.value)}
            className={`pill-btn${typeFilter === f.value ? ' active' : ''}`}
          >
            {f.emoji && <span>{f.emoji}</span>}
            {f.label}
          </button>
        ))}
      </div>

      {/* Light filter row */}
      <div
        className="flex gap-1.5 overflow-x-auto"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {LIGHT_FILTERS.map((f) => {
          const isAurora = f.value === 'northern-lights'
          const activeClass = lightFilter === f.value
            ? (isAurora ? ' active-aurora' : ' active-blue')
            : ''
          return (
            <button
              key={f.value}
              onClick={() => onLightFilterChange(f.value)}
              className={`pill-btn${activeClass}`}
            >
              {f.emoji && <span>{f.emoji}</span>}
              {f.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
