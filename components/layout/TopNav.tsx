'use client'

import { MapPin, AlignJustify, Sun, Camera, Compass, Sparkles, Cloud, Map, type LucideIcon } from 'lucide-react'
import { ActiveTab, Location } from '@/types'

interface TopNavProps {
  activeTab: ActiveTab
  onTabChange: (tab: ActiveTab) => void
  selectedLocation?: Location | null
  onMenuClick: () => void
  onToolsClick: () => void
}

interface TabConfig {
  id: ActiveTab
  label: string
  icon: LucideIcon
}

const TABS: TabConfig[] = [
  { id: 'map',     label: 'Map',     icon: Map      },
  { id: 'spots',   label: 'Spots',   icon: Camera   },
  { id: 'compass', label: 'Compass', icon: Compass  },
  { id: 'aurora',  label: 'Aurora',  icon: Sparkles },
  { id: 'weather', label: 'Weather', icon: Cloud    },
]

export default function TopNav({
  activeTab,
  onTabChange,
  selectedLocation,
  onMenuClick,
  onToolsClick,
}: TopNavProps) {
  const locationLabel = selectedLocation?.name ?? 'Iceland'

  return (
    <nav
      className="w-full z-50 shrink-0 flex items-center gap-2 px-3"
      style={{
        height: '56px',
        background: 'rgba(10,11,14,0.98)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      {/* ── Left: hamburger + location pin ── */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onMenuClick}
          aria-label="Open menu"
          className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors hover:bg-white/10 active:bg-white/20"
        >
          <AlignJustify size={18} className="text-white/80" />
        </button>

        <div className="flex items-center gap-1 max-w-[108px]">
          <MapPin size={13} className="shrink-0" style={{ color: '#f5a623' }} />
          <span
            className="text-xs font-medium truncate"
            style={{ color: '#e2e4ea' }}
            title={locationLabel}
          >
            {locationLabel}
          </span>
        </div>
      </div>

      {/* ── Center: scrollable tab pills ── */}
      <div className="flex-1 min-w-0 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        <div className="flex items-center gap-1 px-1" style={{ width: 'max-content' }}>
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                aria-pressed={isActive}
                aria-label={tab.label}
                className="flex items-center gap-1 px-2.5 rounded-full transition-all duration-150 shrink-0 select-none"
                style={{
                  height: '30px',
                  background: isActive ? '#f5a623' : 'transparent',
                  color: isActive ? '#0a0b0e' : '#8a8f9e',
                  fontWeight: isActive ? 600 : 400,
                  fontSize: '12px',
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                }}
              >
                <Icon size={13} />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Right: tools/sun button ── */}
      <button
        onClick={onToolsClick}
        aria-label="Open tools drawer"
        className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors hover:bg-white/10 active:bg-white/20 shrink-0"
      >
        <Sun size={18} style={{ color: '#f5a623' }} />
      </button>

      {/* Suppress webkit scrollbar on tab row */}
      <style>{`
        nav .overflow-x-auto::-webkit-scrollbar { display: none; }
      `}</style>
    </nav>
  )
}
