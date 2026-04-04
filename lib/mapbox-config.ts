// MapTiler configuration for Iceland 3D terrain app
// Set NEXT_PUBLIC_MAPTILER_KEY in Railway environment variables
export const MAPTILER_KEY = process.env.NEXT_PUBLIC_MAPTILER_KEY || ''
export const MAPBOX_TOKEN = MAPTILER_KEY // legacy alias

export const ICELAND_BOUNDS: [number, number, number, number] = [
  -25.0, 63.0, // SW [lng, lat]
  -12.0, 67.5, // NE [lng, lat]
]

export const ICELAND_CENTER: [number, number] = [-19.0, 65.0]
export const ICELAND_ZOOM = 5.5
export const ICELAND_PITCH = 45
export const ICELAND_BEARING = 0

// MapTiler style keys (used with maptilerSdk.MapStyle)
export const MAP_STYLES = {
  satellite: 'SATELLITE',
  hybrid: 'HYBRID',
  outdoor: 'OUTDOOR',
  dark: 'DARK',
  topo: 'TOPO',
}

export const DEFAULT_MAP_STYLE = 'SATELLITE'

// Marker colors matching PeakVisor style
export const MARKER_COLORS = {
  lake: '#4a9eff',        // blue circle
  waterfall: '#60a5fa',   // lighter blue
  glacier: '#a5f3fc',     // ice blue
  volcano: '#ef4444',     // red triangle
  mountain: '#f87171',    // light red
  canyon: '#f59e0b',      // amber
  'hot-spring': '#f97316', // orange
  beach: '#fbbf24',       // yellow
  lava: '#dc2626',        // dark red
  geothermal: '#fb923c',  // orange
  ruins: '#a78bfa',       // purple
  valley: '#34d399',      // green
  aurora: '#00ff88',      // aurora green (for best aurora spots)
}

export const CATEGORY_COLORS = {
  popular: '#4a9eff',
  'hidden-gem': '#f5a623',
  highland: '#10b981',
}

// Terrain exaggeration for dramatic effect
export const TERRAIN_EXAGGERATION = 1.8

// Offline tile settings for Iceland
export const OFFLINE_ZOOM_RANGE = { min: 8, max: 13 }
export const OFFLINE_BBOX = ICELAND_BOUNDS
