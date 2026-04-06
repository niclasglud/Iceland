'use client'

import { getAuroraZones } from '@/lib/aurora'

interface AuroraActivityMapProps {
  kpIndex: number
}

// SVG coordinate system: viewBox 0 0 500 320
// lon range: -26 to -12.8 (13.2°) → 500px
// lat range: 62.8 to 67.2 (4.4°) → 320px (Y inverted)
const LON_MIN = -26
const LON_SPAN = 13.2
const LAT_MAX = 67.2
const LAT_SPAN = 4.4
const SVG_W = 500
const SVG_H = 320

function toX(lon: number) {
  return ((lon - LON_MIN) / LON_SPAN) * SVG_W
}

function toY(lat: number) {
  return ((LAT_MAX - lat) / LAT_SPAN) * SVG_H
}

// Simplified Iceland outline (clockwise from SW tip)
// Points derived from real geographic coordinates
const ICELAND_PATH = [
  [-22.7, 63.8],  // Reykjanes SW tip
  [-22.5, 64.0],  // west coast
  [-22.0, 64.1],  // Reykjavik area
  [-22.0, 64.4],  // north of Reykjavik
  [-22.3, 64.5],  // Akranes area
  [-22.8, 64.7],  // Grundarfjörður base
  [-23.3, 64.7],  // Snæfellsnes base
  [-23.7, 64.9],  // Snæfellsnes mid
  [-23.8, 65.0],  // Snæfellsnes tip (W)
  [-23.5, 65.1],  // N Snæfellsnes
  [-22.8, 65.2],  // back to coast
  [-22.5, 65.4],  // coast heading N
  [-22.0, 65.3],  // Borgarfjörður area
  [-23.0, 65.5],  // entering Westfjords base
  [-24.0, 65.7],  // Westfjords
  [-25.0, 65.9],  // Westfjords W tip (Látrabjarg)
  [-24.3, 66.1],  // Westfjords N
  [-23.5, 65.8],  // re-entering coast
  [-23.0, 65.8],  // N Westfjords base
  [-22.5, 65.7],  // heading east
  [-22.0, 65.6],  // north coast W
  [-21.5, 65.6],  // Húnaflói
  [-21.0, 65.8],  // Skagi peninsula
  [-20.3, 66.0],  // N coast
  [-19.5, 66.0],  // Skagafjörður entrance
  [-19.0, 66.0],  // Skagafjörður
  [-18.5, 65.9],  // Tröllaskagi
  [-18.1, 65.7],  // near Akureyri (in fjord)
  [-18.0, 65.8],  // Eyjafjörður N
  [-17.5, 66.1],  // between fjords
  [-16.5, 66.4],  // NE peninsula
  [-15.5, 66.5],  // NE tip (Melrakkaslétta)
  [-15.0, 66.3],  // turning SE
  [-14.5, 66.1],  // NE headland
  [-14.0, 65.8],  // start of east coast
  [-13.5, 65.5],  // east coast
  [-13.5, 65.0],  // mid east coast
  [-13.7, 64.7],  // E fjords mid
  [-13.8, 64.2],  // SE coast
  [-14.0, 63.9],  // Höfn area
  [-15.0, 63.7],  // SE glacier coast
  [-16.5, 63.5],  // Vatnajökull south
  [-17.5, 63.4],  // Mýrdalsjökull
  [-19.0, 63.4],  // Vík area
  [-20.0, 63.5],  // south coast
  [-20.5, 63.5],  // Þórsmörk area
  [-21.5, 63.7],  // SW coast
  [-22.0, 63.8],  // back toward Reykjanes
].map(([lon, lat]) => `${toX(lon).toFixed(1)},${toY(lat).toFixed(1)}`).join(' L ')

// Aurora visibility boundary latitude (geographic, approximate)
// Based on NOAA's Kp equatorward boundary chart (effective visibility including horizon effect)
// At Iceland's longitude, geomagnetic correction is small
function getVisibilityBoundaryLat(kp: number): number {
  // KP 0 → ~70°N, KP 5 → ~63°N, KP 9 → ~55°N
  // Quadratic fit for Iceland range
  return Math.max(55, 70 - kp * 1.8)
}

// Key cities / landmarks to label on map
const CITIES = [
  { name: 'Reykjavík', lon: -22.0, lat: 64.1, dot: true },
  { name: 'Akureyri', lon: -18.1, lat: 65.7, dot: true },
  { name: 'Höfn', lon: -15.2, lat: 64.25, dot: true },
  { name: 'Ísafjörður', lon: -23.1, lat: 66.07, dot: true },
]

// Aurora quality label for a location given KP
function getLocationActivity(lat: number, darknessFactor: number, kp: number): { label: string; color: string; opacity: number } {
  const boundaryLat = getVisibilityBoundaryLat(kp)
  const aboveBoundary = lat > boundaryLat
  if (!aboveBoundary) return { label: 'No activity', color: '#6b7280', opacity: 0 }

  const latMargin = lat - boundaryLat
  const baseFactor = Math.min(1, latMargin / 4) * darknessFactor * Math.min(1, kp / 3)

  if (baseFactor >= 0.7 || kp >= 6) return { label: 'High', color: '#00ff88', opacity: baseFactor }
  if (baseFactor >= 0.35 || kp >= 4) return { label: 'Moderate', color: '#7ee8a2', opacity: baseFactor }
  if (baseFactor >= 0.1 || kp >= 2) return { label: 'Low', color: '#3b82f6', opacity: Math.max(0.15, baseFactor) }
  return { label: 'Minimal', color: '#3b82f6', opacity: 0.08 }
}

export default function AuroraActivityMap({ kpIndex }: AuroraActivityMapProps) {
  const zones = getAuroraZones(kpIndex)
  const boundaryLat = getVisibilityBoundaryLat(kpIndex)
  const boundaryY = toY(Math.min(LAT_MAX, Math.max(62.8, boundaryLat)))

  // Whether the boundary line is within the Iceland map area
  const boundaryVisible = boundaryLat > 62.8 && boundaryLat < LAT_MAX

  return (
    <div style={{ position: 'relative' }}>
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        style={{
          width: '100%',
          height: 'auto',
          display: 'block',
          borderRadius: 10,
          background: 'linear-gradient(180deg, #050810 0%, #0a0f1e 40%, #0d1420 100%)',
        }}
        aria-label="Aurora activity map of Iceland"
      >
        <defs>
          {/* Radial gradient for each zone */}
          {zones.map((zone) => {
            const activity = getLocationActivity(zone.coordinates[1], zone.darknessFactor, kpIndex)
            return (
              <radialGradient
                key={`grad-${zone.id}`}
                id={`grad-${zone.id}`}
                cx="50%"
                cy="50%"
                r="50%"
              >
                <stop offset="0%" stopColor={activity.color} stopOpacity={activity.opacity * 0.7} />
                <stop offset="60%" stopColor={activity.color} stopOpacity={activity.opacity * 0.25} />
                <stop offset="100%" stopColor={activity.color} stopOpacity={0} />
              </radialGradient>
            )
          })}

          {/* Stars pattern */}
          <pattern id="stars" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
            {[
              [10, 15], [35, 8], [60, 22], [78, 5], [22, 40],
              [50, 35], [70, 48], [15, 60], [40, 68], [65, 72],
              [5, 75], [28, 25], [55, 55], [75, 30], [45, 18],
            ].map(([x, y], i) => (
              <circle
                key={i}
                cx={x}
                cy={y}
                r={i % 3 === 0 ? 0.8 : 0.5}
                fill="white"
                opacity={0.3 + (i % 5) * 0.08}
              />
            ))}
          </pattern>

          {/* Aurora shimmer gradient across top */}
          <linearGradient id="aurora-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"
              stopColor={kpIndex >= 3 ? '#00ff88' : kpIndex >= 1 ? '#3b82f6' : '#1a1f2e'}
              stopOpacity={Math.min(0.18, kpIndex * 0.04)}
            />
            <stop offset="100%" stopColor="transparent" stopOpacity={0} />
          </linearGradient>

          {/* Clip path for Iceland shape */}
          <clipPath id="iceland-clip">
            <path d={`M ${ICELAND_PATH} Z`} />
          </clipPath>
        </defs>

        {/* Star field background */}
        <rect width={SVG_W} height={SVG_H} fill="url(#stars)" />

        {/* Aurora sky glow */}
        <rect width={SVG_W} height={SVG_H} fill="url(#aurora-sky)" />

        {/* Latitude grid lines (faint) */}
        {[64, 65, 66].map((lat) => (
          <line
            key={lat}
            x1={0}
            y1={toY(lat)}
            x2={SVG_W}
            y2={toY(lat)}
            stroke="rgba(255,255,255,0.04)"
            strokeWidth={0.5}
            strokeDasharray="4 6"
          />
        ))}

        {/* Aurora activity zone blobs — rendered BEFORE Iceland outline so they glow through */}
        {zones.map((zone) => {
          const x = toX(zone.coordinates[0])
          const y = toY(zone.coordinates[1])
          const activity = getLocationActivity(zone.coordinates[1], zone.darknessFactor, kpIndex)
          if (activity.opacity <= 0) return null
          return (
            <ellipse
              key={zone.id}
              cx={x}
              cy={y}
              rx={32}
              ry={22}
              fill={`url(#grad-${zone.id})`}
            />
          )
        })}

        {/* Iceland landmass */}
        <path
          d={`M ${ICELAND_PATH} Z`}
          fill="#1a2235"
          stroke="rgba(255,255,255,0.18)"
          strokeWidth={1.2}
          strokeLinejoin="round"
        />

        {/* Aurora activity glow INSIDE Iceland */}
        {zones.map((zone) => {
          const x = toX(zone.coordinates[0])
          const y = toY(zone.coordinates[1])
          const activity = getLocationActivity(zone.coordinates[1], zone.darknessFactor, kpIndex)
          if (activity.opacity <= 0) return null
          return (
            <ellipse
              key={`inner-${zone.id}`}
              cx={x}
              cy={y}
              rx={28}
              ry={18}
              fill={`url(#grad-${zone.id})`}
              clipPath="url(#iceland-clip)"
            />
          )
        })}

        {/* Aurora visibility boundary line */}
        {boundaryVisible && (
          <g>
            <line
              x1={0}
              y1={boundaryY}
              x2={SVG_W}
              y2={boundaryY}
              stroke="#f5a623"
              strokeWidth={1}
              strokeDasharray="6 4"
              opacity={0.6}
            />
            <rect
              x={SVG_W - 130}
              y={boundaryY - 16}
              width={128}
              height={14}
              rx={3}
              fill="rgba(10,11,14,0.8)"
            />
            <text
              x={SVG_W - 66}
              y={boundaryY - 5}
              textAnchor="middle"
              fontSize={9}
              fill="#f5a623"
              opacity={0.9}
            >
              Aurora boundary (KP {kpIndex.toFixed(0)})
            </text>
          </g>
        )}

        {/* "All visible" banner when KP is high */}
        {!boundaryVisible && kpIndex >= 3 && (
          <g>
            <rect x={SVG_W - 148} y={8} width={140} height={14} rx={3} fill="rgba(0,255,136,0.12)" />
            <text
              x={SVG_W - 78}
              y={19}
              textAnchor="middle"
              fontSize={9}
              fill="#00ff88"
              fontWeight="bold"
            >
              Visible across all Iceland
            </text>
          </g>
        )}

        {/* City markers */}
        {CITIES.map((city) => {
          const cx = toX(city.lon)
          const cy = toY(city.lat)
          return (
            <g key={city.name}>
              <circle cx={cx} cy={cy} r={2.5} fill="#ffffff" opacity={0.7} />
              <text
                x={cx + 4}
                y={cy + 4}
                fontSize={8.5}
                fill="rgba(255,255,255,0.6)"
                style={{ userSelect: 'none' }}
              >
                {city.name}
              </text>
            </g>
          )
        })}

        {/* Zone activity dots with labels */}
        {zones.map((zone) => {
          const x = toX(zone.coordinates[0])
          const y = toY(zone.coordinates[1])
          const activity = getLocationActivity(zone.coordinates[1], zone.darknessFactor, kpIndex)
          const dotColor = activity.opacity > 0 ? activity.color : '#3a3f4e'
          const dotOpacity = activity.opacity > 0 ? 0.9 : 0.3

          return (
            <g key={`dot-${zone.id}`}>
              {activity.opacity > 0.3 && (
                <circle
                  cx={x}
                  cy={y}
                  r={5}
                  fill={dotColor}
                  opacity={0.15}
                />
              )}
              <circle
                cx={x}
                cy={y}
                r={2.5}
                fill={dotColor}
                opacity={dotOpacity}
              />
            </g>
          )
        })}

        {/* Legend */}
        <g transform="translate(8, 8)">
          <rect width={110} height={60} rx={5} fill="rgba(10,11,14,0.82)" />
          <text x={8} y={16} fontSize={8} fill="#8a8f9e" fontWeight="bold" style={{ textTransform: 'uppercase' as const }}>
            Activity Level
          </text>
          {[
            { color: '#00ff88', label: 'High (KP 5+)' },
            { color: '#7ee8a2', label: 'Moderate (KP 3-5)' },
            { color: '#3b82f6', label: 'Low (KP 1-3)' },
            { color: '#3a3f4e', label: 'None' },
          ].map(({ color, label }, i) => (
            <g key={label} transform={`translate(8, ${26 + i * 10})`}>
              <circle cx={3} cy={3} r={3} fill={color} opacity={0.85} />
              <text x={10} y={7} fontSize={8} fill="rgba(255,255,255,0.6)">
                {label}
              </text>
            </g>
          ))}
        </g>

        {/* Data source */}
        <text
          x={8}
          y={SVG_H - 5}
          fontSize={7.5}
          fill="rgba(255,255,255,0.25)"
        >
          Source: NOAA SWPC · Aurora visibility model for 65°N
        </text>
      </svg>
    </div>
  )
}
