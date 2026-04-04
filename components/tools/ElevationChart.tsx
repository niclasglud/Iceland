'use client'

import {
  ResponsiveContainer,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Area,
  ComposedChart,
} from 'recharts'

interface ElevationPoint {
  name: string
  elevation: number
  type: 'peak' | 'pass' | 'camp' | 'start' | 'end'
  isHighlight?: boolean
}

interface ElevationChartProps {
  points?: ElevationPoint[]
  title?: string
}

const DEFAULT_POINTS: ElevationPoint[] = [
  { name: 'Reykjavik', elevation: 20, type: 'start' },
  { name: 'Þórsmörk', elevation: 280, type: 'camp' },
  { name: 'Fimmvörðuháls', elevation: 1116, type: 'peak', isHighlight: true },
  { name: 'Skógar', elevation: 60, type: 'end' },
  { name: 'Landmannalaugar', elevation: 600, type: 'camp' },
  { name: 'Hrafntinnusker', elevation: 920, type: 'peak', isHighlight: true },
  { name: 'Álftavatn', elevation: 540, type: 'camp' },
  { name: 'Emstrur', elevation: 490, type: 'camp' },
]

function CustomDot(props: {
  cx?: number
  cy?: number
  payload?: ElevationPoint
  index?: number
}) {
  const { cx, cy, payload } = props
  if (cx === undefined || cy === undefined || !payload) return null

  const isPeak = payload.type === 'peak' || payload.type === 'pass'
  const r = isPeak ? 6 : 4
  const fill = isPeak ? '#ef4444' : '#ffffff'

  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill={fill} stroke="rgba(0,0,0,0.5)" strokeWidth={1} />
      {payload.isHighlight && (
        <text
          x={cx}
          y={cy - 10}
          textAnchor="middle"
          fill="#f87171"
          fontSize={10}
          transform={`rotate(-45, ${cx}, ${cy - 10})`}
          style={{ pointerEvents: 'none' }}
        >
          {payload.name}
        </text>
      )}
    </g>
  )
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: { payload: ElevationPoint }[]
}) {
  if (!active || !payload || payload.length === 0) return null
  const pt = payload[0].payload
  return (
    <div
      style={{
        backgroundColor: 'rgba(18,20,28,0.97)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 8,
        padding: '8px 12px',
      }}
    >
      <div style={{ fontSize: 12, fontWeight: 600, color: '#ffffff', marginBottom: 2 }}>
        {pt.name}
      </div>
      <div style={{ fontSize: 12, color: '#f5a623' }}>{pt.elevation} m</div>
      <div style={{ fontSize: 10, color: '#8a8f9e', textTransform: 'capitalize' }}>{pt.type}</div>
    </div>
  )
}

export default function ElevationChart({ points, title }: ElevationChartProps) {
  const data = points && points.length > 0 ? points : DEFAULT_POINTS
  const displayTitle =
    title ??
    (points && points.length > 0
      ? `${data[0].name} → ${data[data.length - 1].name}`
      : 'Laugavegur & Fimmvörðuháls Route')

  const chartData = data.map((pt, i) => ({
    ...pt,
    index: i,
    distance: `${Math.round((i / (data.length - 1)) * 100)}%`,
  }))

  return (
    <div
      style={{
        backgroundColor: 'rgba(18,20,28,0.8)',
        borderRadius: 12,
        padding: '14px 12px 10px',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <ResponsiveContainer width="100%" height={160}>
        <ComposedChart data={chartData} margin={{ top: 20, right: 8, bottom: 4, left: 0 }}>
          <defs>
            <linearGradient id="elevGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f5a623" stopOpacity={0.1} />
              <stop offset="100%" stopColor="#f5a623" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid
            horizontal
            vertical={false}
            stroke="rgba(255,255,255,0.05)"
            strokeDasharray="0"
          />

          <XAxis
            dataKey="name"
            tick={false}
            axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
            tickLine={false}
          />

          <YAxis
            tickFormatter={(v: number) => `${v}m`}
            tick={{ fontSize: 10, fill: '#8a8f9e' }}
            axisLine={false}
            tickLine={false}
            width={38}
          />

          <Tooltip content={<CustomTooltip />} />

          <Area
            type="monotone"
            dataKey="elevation"
            fill="url(#elevGradient)"
            stroke="none"
          />

          <Line
            type="monotone"
            dataKey="elevation"
            stroke="#f5a623"
            strokeWidth={2}
            dot={(props) => <CustomDot key={props.index} {...props} />}
            activeDot={{ r: 6, fill: '#f5a623', stroke: '#ffffff', strokeWidth: 1.5 }}
          />
        </ComposedChart>
      </ResponsiveContainer>

      {displayTitle && (
        <p
          style={{
            margin: '6px 0 0',
            fontSize: 11,
            color: '#8a8f9e',
            fontStyle: 'italic',
            textAlign: 'center',
          }}
        >
          {displayTitle}
        </p>
      )}
    </div>
  )
}
