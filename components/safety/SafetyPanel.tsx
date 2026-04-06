'use client'

import { useEffect, useState } from 'react'
import { ShieldAlert, AlertTriangle, CheckCircle, ExternalLink, Phone, Wind, Snowflake, Droplets, X, Info } from 'lucide-react'
import { F_ROADS, getFRoadCurrentStatus, STATUS_COLORS } from '@/data/f-roads'
import type { RoadWarning } from '@/types'

interface RoadConditionsResponse {
  warnings: RoadWarning[]
  roadClosures: { road: string; description: string; region: string }[]
  lastUpdated: string
  source: string
}

const WARNING_ICONS = {
  wind:    Wind,
  snow:    Snowflake,
  ice:     Snowflake,
  flood:   Droplets,
  closure: X,
  general: AlertTriangle,
}

const SEVERITY_CONFIG = {
  red:    { color: '#ef4444', bg: 'rgba(239,68,68,0.10)', border: 'rgba(239,68,68,0.25)',    label: 'Danger' },
  yellow: { color: '#f5a623', bg: 'rgba(245,166,35,0.10)', border: 'rgba(245,166,35,0.25)', label: 'Caution' },
  green:  { color: '#10b981', bg: 'rgba(16,185,129,0.10)', border: 'rgba(16,185,129,0.25)', label: 'Clear' },
}

export default function SafetyPanel() {
  const [data, setData] = useState<RoadConditionsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [fRoadExpanded, setFRoadExpanded] = useState(false)

  useEffect(() => {
    fetch('/api/road-conditions')
      .then((r) => r.json())
      .then((d: RoadConditionsResponse) => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const openRoads  = F_ROADS.filter((r) => getFRoadCurrentStatus(r) === 'open')
  const marginal   = F_ROADS.filter((r) => getFRoadCurrentStatus(r) === 'marginal')
  const closedRoads = F_ROADS.filter((r) => getFRoadCurrentStatus(r) === 'closed')

  return (
    <div style={{ padding: '12px 12px 48px', fontFamily: 'system-ui, -apple-system, sans-serif', display: 'flex', flexDirection: 'column', gap: 12 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', backgroundColor: 'rgba(18,20,28,0.95)', borderRadius: 14, border: '1px solid rgba(255,255,255,0.07)' }}>
        <ShieldAlert size={20} color="#f5a623" />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>Road & Safety</div>
          <div style={{ fontSize: 11, color: '#8a8f9e', marginTop: 1 }}>Live conditions · F-road status · Emergency info</div>
        </div>
        {data && (
          <div style={{ fontSize: 10, color: '#5a5f6e' }}>
            {new Date(data.lastUpdated).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
          </div>
        )}
      </div>

      {/* Emergency Banner */}
      <div style={{ backgroundColor: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 14, padding: '14px 16px' }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#ef4444', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Phone size={13} color="#ef4444" />
          Emergency Contacts
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {[
            { label: '112 Iceland', sub: 'Police · Fire · Medical', color: '#ef4444' },
            { label: 'Safetravel.is', sub: 'Travel alerts & info', color: '#f5a623' },
            { label: '1777', sub: 'Road conditions hotline', color: '#4a9eff' },
            { label: '522 1000', sub: 'ICE-SAR Mountain Rescue', color: '#10b981' },
          ].map((c) => (
            <div key={c.label} style={{ backgroundColor: 'rgba(10,11,14,0.7)', borderRadius: 10, padding: '8px 10px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: c.color }}>{c.label}</div>
              <div style={{ fontSize: 10, color: '#8a8f9e', marginTop: 1 }}>{c.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Active warnings */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#8a8f9e', marginBottom: 8, textTransform: 'uppercase' as const, letterSpacing: '0.07em', paddingLeft: 4 }}>
          Active Warnings {data ? `· ${data.warnings.length}` : ''}
        </div>
        {loading ? (
          <div style={{ backgroundColor: 'rgba(18,20,28,0.95)', borderRadius: 14, padding: 20, textAlign: 'center', color: '#5a5f6e', fontSize: 13 }}>
            Loading conditions…
          </div>
        ) : !data || data.warnings.length === 0 ? (
          <div style={{ backgroundColor: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 14, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <CheckCircle size={16} color="#10b981" />
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#10b981' }}>No active warnings</div>
              <div style={{ fontSize: 11, color: '#8a8f9e', marginTop: 2 }}>Conditions look good. Always check road.is before driving.</div>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {data.warnings.map((w, i) => {
              const cfg = SEVERITY_CONFIG[w.severity]
              const Icon = WARNING_ICONS[w.type] ?? AlertTriangle
              return (
                <div key={i} style={{ backgroundColor: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: 12, padding: '12px 14px', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <Icon size={14} color={cfg.color} style={{ marginTop: 1, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: cfg.color, textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>{cfg.label}</span>
                      <span style={{ fontSize: 10, color: '#8a8f9e' }}>· {w.region}</span>
                    </div>
                    <div style={{ fontSize: 12, color: '#c8cbd5', lineHeight: 1.5 }}>{w.message}</div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* F-Road Status */}
      <div>
        <button
          onClick={() => setFRoadExpanded((v) => !v)}
          style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0, marginBottom: 8 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#8a8f9e', textTransform: 'uppercase' as const, letterSpacing: '0.07em', paddingLeft: 4 }}>
              F-Road Status (Highland Routes)
            </div>
            <div style={{ fontSize: 11, color: '#5a5f6e', paddingRight: 4 }}>
              {openRoads.length} open · {fRoadExpanded ? '▲' : '▼'}
            </div>
          </div>
        </button>

        {/* Summary pills */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
          {[
            { count: openRoads.length, label: 'Open', color: STATUS_COLORS.open.color, bg: STATUS_COLORS.open.bg },
            { count: marginal.length, label: 'Marginal', color: STATUS_COLORS.marginal.color, bg: STATUS_COLORS.marginal.bg },
            { count: closedRoads.length, label: 'Closed', color: STATUS_COLORS.closed.color, bg: STATUS_COLORS.closed.bg },
          ].map((s) => (
            <div key={s.label} style={{ flex: 1, textAlign: 'center', backgroundColor: s.bg, borderRadius: 10, padding: '8px 4px', border: `1px solid ${s.color}30` }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: s.color }}>{s.count}</div>
              <div style={{ fontSize: 10, color: '#8a8f9e' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {fRoadExpanded && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {F_ROADS.map((road) => {
              const status = getFRoadCurrentStatus(road)
              const cfg = STATUS_COLORS[status]
              return (
                <div key={road.id} style={{ backgroundColor: 'rgba(18,20,28,0.95)', borderRadius: 12, padding: '10px 12px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <div style={{ flexShrink: 0, backgroundColor: cfg.bg, border: `1px solid ${cfg.color}40`, borderRadius: 8, padding: '3px 8px', marginTop: 1 }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: cfg.color }}>{road.id}</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{road.name}</span>
                      <span style={{ fontSize: 10, fontWeight: 700, color: cfg.color }}>{cfg.label}</span>
                    </div>
                    <div style={{ fontSize: 11, color: '#8a8f9e', lineHeight: 1.4 }}>{road.description}</div>
                    {road.requiresSuperJeep && (
                      <div style={{ marginTop: 4, display: 'inline-flex', alignItems: 'center', gap: 4, backgroundColor: 'rgba(245,166,35,0.1)', border: '1px solid rgba(245,166,35,0.25)', borderRadius: 6, padding: '2px 7px' }}>
                        <span style={{ fontSize: 10, color: '#f5a623', fontWeight: 600 }}>🚙 Super-jeep required</span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Useful Links */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#8a8f9e', marginBottom: 8, textTransform: 'uppercase' as const, letterSpacing: '0.07em', paddingLeft: 4 }}>
          Useful Links
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {[
            { label: 'road.is', sub: 'Live road conditions & closures', url: 'https://www.road.is' },
            { label: 'vedur.is', sub: 'IMO weather forecasts & warnings', url: 'https://en.vedur.is' },
            { label: 'safetravel.is', sub: 'Iceland travel safety alerts', url: 'https://safetravel.is' },
            { label: '112.is', sub: 'Emergency location sharing app', url: 'https://www.112.is' },
          ].map((link) => (
            <a
              key={link.label}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(18,20,28,0.95)', borderRadius: 12, padding: '10px 14px', border: '1px solid rgba(255,255,255,0.06)', textDecoration: 'none', cursor: 'pointer' }}
            >
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#4a9eff' }}>{link.label}</div>
                <div style={{ fontSize: 11, color: '#8a8f9e', marginTop: 1 }}>{link.sub}</div>
              </div>
              <ExternalLink size={13} color="#5a5f6e" />
            </a>
          ))}
        </div>
      </div>

      {/* Driving Tips */}
      <div style={{ backgroundColor: 'rgba(74,158,255,0.06)', border: '1px solid rgba(74,158,255,0.15)', borderRadius: 14, padding: '14px 16px' }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#4a9eff', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Info size={13} color="#4a9eff" />
          Iceland Driving Tips
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {[
            '4WD required for ALL F-roads — regular cars will void your insurance',
            'Sudden weather changes — conditions can go from clear to whiteout in minutes',
            'Single-lane bridges — yield to oncoming traffic before crossing',
            'Sheep on roads — year-round, especially in summer and at dusk',
            'Fuel stations are sparse in the Highlands — always fill up before remote routes',
            'Never drive off-road — illegal and causes irreversible damage to moss/vegetation',
          ].map((tip, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
              <span style={{ color: '#4a9eff', fontSize: 12, marginTop: 1, flexShrink: 0 }}>·</span>
              <span style={{ fontSize: 12, color: '#8a8f9e', lineHeight: 1.5 }}>{tip}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
