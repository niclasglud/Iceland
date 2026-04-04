'use client'

import { useState, useRef, useEffect } from 'react'
import { Navigation, Search, X, Download, CheckCircle, MapPin, Flag } from 'lucide-react'
import { Location } from '@/types'

interface NavigationPanelProps {
  locations: Location[]
  selectedLocation: Location | null
  onDestinationSelect: (loc: Location) => void
}

const REGION_LABELS: Record<string, string> = {
  'ring-road': 'Ring Road',
  highlands: 'Highlands',
  westfjords: 'Westfjords',
  snaefellsnes: 'Snæfellsnes',
  reykjanes: 'Reykjanes',
  east: 'East',
  north: 'North',
  south: 'South',
}

function StorageBar({ progress, downloaded }: { progress: number; downloaded: boolean }) {
  return (
    <div
      style={{
        height: 6,
        borderRadius: 3,
        backgroundColor: 'rgba(255,255,255,0.08)',
        overflow: 'hidden',
        marginTop: 6,
      }}
    >
      <div
        style={{
          height: '100%',
          width: `${downloaded ? 100 : progress}%`,
          backgroundColor: downloaded ? '#00ff88' : '#f5a623',
          borderRadius: 3,
          transition: 'width 0.4s ease',
        }}
      />
    </div>
  )
}

export default function NavigationPanel({
  locations,
  onDestinationSelect,
}: Omit<NavigationPanelProps, 'selectedLocation'> & { selectedLocation?: Location | null }) {
  const [fromMode, setFromMode] = useState<'current' | 'start'>('current')
  const [searchQuery, setSearchQuery] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState(0)
  const [isDownloaded, setIsDownloaded] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const filteredLocations =
    searchQuery.trim().length > 0
      ? locations
          .filter(
            (loc) =>
              loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              (loc.icelandicName &&
                loc.icelandicName.toLowerCase().includes(searchQuery.toLowerCase())) ||
              loc.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
              loc.type.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .slice(0, 6)
      : locations.slice(0, 6)

  const showDropdown = isFocused && filteredLocations.length > 0

  function handleDownload() {
    if (isDownloaded || isDownloading) return
    setIsDownloading(true)
    setDownloadProgress(0)
    intervalRef.current = setInterval(() => {
      setDownloadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(intervalRef.current!)
          setIsDownloading(false)
          setIsDownloaded(true)
          return 100
        }
        return prev + 2
      })
    }, 60)
  }

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  function handleSelectLocation(loc: Location) {
    onDestinationSelect(loc)
    setSearchQuery(loc.name)
    setIsFocused(false)
  }

  function handleClearSearch() {
    setSearchQuery('')
    inputRef.current?.focus()
  }

  const storageMB = isDownloaded ? 148 : Math.round((downloadProgress / 100) * 148)

  return (
    <div
      style={{
        backgroundColor: 'rgba(18,20,28,0.95)',
        borderRadius: 14,
        border: '1px solid rgba(255,255,255,0.06)',
        overflow: 'visible',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      {/* ── Header ── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '14px 16px 12px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <span style={{ fontSize: 14, fontWeight: 700, color: '#ffffff' }}>Navigation</span>
        <Navigation size={16} color="#8a8f9e" />
      </div>

      <div style={{ padding: '14px 16px 16px' }}>
        {/* ── FROM ── */}
        <div style={{ marginBottom: 14 }}>
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: '#8a8f9e',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              display: 'block',
              marginBottom: 8,
            }}
          >
            From
          </span>
          <div style={{ display: 'flex', gap: 8 }}>
            {/* Current Location button */}
            <button
              onClick={() => setFromMode('current')}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 7,
                padding: '10px 12px',
                backgroundColor:
                  fromMode === 'current' ? 'rgba(245,166,35,0.08)' : 'rgba(255,255,255,0.04)',
                border:
                  fromMode === 'current'
                    ? '1px solid rgba(245,166,35,0.5)'
                    : '1px solid rgba(255,255,255,0.08)',
                borderRadius: 10,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <MapPin
                size={14}
                color={fromMode === 'current' ? '#f5a623' : '#8a8f9e'}
              />
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: fromMode === 'current' ? '#f5a623' : '#8a8f9e',
                }}
              >
                Current Location
              </span>
            </button>

            {/* Circuit Start button */}
            <button
              onClick={() => setFromMode('start')}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 7,
                padding: '10px 12px',
                backgroundColor:
                  fromMode === 'start' ? 'rgba(245,166,35,0.08)' : 'rgba(255,255,255,0.04)',
                border:
                  fromMode === 'start'
                    ? '1px solid rgba(245,166,35,0.5)'
                    : '1px solid rgba(255,255,255,0.08)',
                borderRadius: 10,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <Flag
                size={14}
                color={fromMode === 'start' ? '#f5a623' : '#8a8f9e'}
              />
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: fromMode === 'start' ? '#f5a623' : '#8a8f9e',
                }}
              >
                Circuit Start
              </span>
            </button>
          </div>
        </div>

        {/* ── DESTINATION ── */}
        <div style={{ marginBottom: 16, position: 'relative' }}>
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: '#8a8f9e',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              display: 'block',
              marginBottom: 8,
            }}
          >
            Destination
          </span>

          {/* Search input */}
          <div
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Search
              size={14}
              color="#8a8f9e"
              style={{ position: 'absolute', left: 12, flexShrink: 0 }}
            />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setTimeout(() => setIsFocused(false), 150)}
              placeholder="Search spots, glaciers, waterfalls..."
              style={{
                width: '100%',
                backgroundColor: 'rgba(255,255,255,0.05)',
                border: isFocused
                  ? '1px solid rgba(245,166,35,0.4)'
                  : '1px solid rgba(255,255,255,0.08)',
                borderRadius: 10,
                padding: '10px 36px 10px 36px',
                fontSize: 13,
                color: '#ffffff',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 0.15s ease',
              }}
            />
            {searchQuery.length > 0 && (
              <button
                onClick={handleClearSearch}
                style={{
                  position: 'absolute',
                  right: 10,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 2,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <X size={13} color="#8a8f9e" />
              </button>
            )}
          </div>

          {/* Dropdown results */}
          {showDropdown && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                marginTop: 4,
                backgroundColor: 'rgba(18,20,28,0.99)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 10,
                overflow: 'hidden',
                zIndex: 50,
                boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
              }}
            >
              {filteredLocations.map((loc, i) => (
                <button
                  key={loc.id}
                  onMouseDown={() => handleSelectLocation(loc)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 8,
                    padding: '10px 14px',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderTop: i > 0 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'background-color 0.1s ease',
                  }}
                  onMouseEnter={(e) => {
                    ;(e.currentTarget as HTMLButtonElement).style.backgroundColor =
                      'rgba(255,255,255,0.04)'
                  }}
                  onMouseLeave={(e) => {
                    ;(e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'
                  }}
                >
                  <span style={{ fontSize: 13, color: '#ffffff', fontWeight: 500 }}>
                    {loc.name}
                    {loc.icelandicName && loc.icelandicName !== loc.name && (
                      <span style={{ color: '#8a8f9e', fontWeight: 400 }}>
                        {' '}· {loc.icelandicName}
                      </span>
                    )}
                  </span>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      color: '#4a9eff',
                      backgroundColor: 'rgba(74,158,255,0.12)',
                      padding: '2px 7px',
                      borderRadius: 20,
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                    }}
                  >
                    {REGION_LABELS[loc.region] ?? loc.region}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Offline Tiles ── */}
        <div
          style={{
            backgroundColor: 'rgba(255,255,255,0.03)',
            borderRadius: 10,
            padding: '12px 14px',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 4,
            }}
          >
            <span style={{ fontSize: 12, color: '#c0c5d0', fontWeight: 500 }}>
              Offline tiles (zoom 8–13)
            </span>
            {isDownloaded ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <CheckCircle size={13} color="#00ff88" />
                <span style={{ fontSize: 12, color: '#00ff88', fontWeight: 600 }}>Downloaded</span>
              </div>
            ) : (
              <button
                onClick={handleDownload}
                disabled={isDownloading}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: isDownloading ? 'default' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: 0,
                  opacity: isDownloading ? 0.6 : 1,
                }}
              >
                <Download size={13} color="#f5a623" />
                <span style={{ fontSize: 12, color: '#f5a623', fontWeight: 600 }}>
                  {isDownloading ? `${downloadProgress}%` : 'Download'}
                </span>
              </button>
            )}
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span style={{ fontSize: 11, color: '#5a5f6e', whiteSpace: 'nowrap' }}>Storage</span>
            <div style={{ flex: 1 }}>
              <StorageBar
                progress={downloadProgress}
                downloaded={isDownloaded}
              />
            </div>
            <span style={{ fontSize: 11, color: '#8a8f9e', whiteSpace: 'nowrap' }}>
              {storageMB} MB / ~150 MB
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
