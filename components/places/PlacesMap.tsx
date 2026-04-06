'use client'

import { useEffect, useRef, useState } from 'react'
import * as maplibregl from 'maplibre-gl'
import { Place } from '@/types'

interface PlacesMapProps {
  places: Place[]
  selectedPlace: Place | null
  onPlaceSelect: (place: Place) => void
}

export default function PlacesMap({ places, selectedPlace, onPlaceSelect }: PlacesMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const markerMap = useRef<Map<string, maplibregl.Marker>>(new Map())
  const [loading, setLoading] = useState(true)

  function makeMarkerEl(place: Place, selected: boolean): HTMLDivElement {
    const el = document.createElement('div')
    const size = selected ? 32 : 26
    const shadow = selected
      ? '0 0 0 3px rgba(245,166,35,0.6), 0 4px 12px rgba(0,0,0,0.5)'
      : '0 2px 8px rgba(0,0,0,0.4)'

    let bg = '#fff7e6'
    let border = '#f5a623'
    let emoji = '🍴'
    if (place.type === 'cafe') {
      emoji = '☕'
    } else if (place.type === 'hotel') {
      bg = '#e6f0ff'
      border = '#4a9eff'
      emoji = '🛏'
    }

    el.style.cssText = [
      `width:${size}px`,
      `height:${size}px`,
      `border-radius:6px`,
      `display:flex`,
      `align-items:center`,
      `justify-content:center`,
      `font-size:14px`,
      `cursor:pointer`,
      `box-shadow:${shadow}`,
      `background:${bg}`,
      `border:2px solid ${border}`,
      `transition:all 0.2s ease`,
    ].join(';')
    el.textContent = emoji
    return el
  }

  function addMarkers(map: maplibregl.Map, placeList: Place[]) {
    // Clear existing markers
    markerMap.current.forEach((m) => m.remove())
    markerMap.current.clear()

    placeList.forEach((place) => {
      const selected = selectedPlace?.id === place.id
      const el = makeMarkerEl(place, selected)
      el.addEventListener('click', () => onPlaceSelect(place))

      const marker = new maplibregl.Marker({ element: el, anchor: 'center' })
        .setLngLat(place.coordinates as [number, number])
        .addTo(map)

      markerMap.current.set(place.id, marker)
    })
  }

  // Initialise map
  useEffect(() => {
    if (!containerRef.current) return

    let map: maplibregl.Map | null = null
    let cancelled = false

    async function init() {
      try {
        const res = await fetch('/api/config')
        if (cancelled) return
        const data = await res.json()
        const apiKey = data.maptilerKey || ''

        if (!containerRef.current || cancelled) return

        map = new maplibregl.Map({
          container: containerRef.current,
          style: `https://api.maptiler.com/maps/streets/style.json?key=${apiKey}`,
          center: [-18.97, 64.96],
          zoom: 5.5,
          pitch: 0,
          bearing: 0,
        })

        map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'bottom-right')

        map.on('load', () => {
          if (cancelled) return
          mapRef.current = map
          setLoading(false)
          addMarkers(map!, places)
        })
      } catch (e) {
        console.error('PlacesMap init error', e)
        if (!cancelled) setLoading(false)
      }
    }

    init()

    return () => {
      cancelled = true
      map?.remove()
      mapRef.current = null
      markerMap.current.clear()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Update markers when places change
  useEffect(() => {
    if (!mapRef.current) return
    addMarkers(mapRef.current, places)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [places])

  // Handle selectedPlace changes
  useEffect(() => {
    if (!mapRef.current) return

    markerMap.current.forEach((marker, id) => {
      const place = places.find((p) => p.id === id)
      if (!place) return
      const el = marker.getElement()
      const selected = selectedPlace?.id === id
      const size = selected ? 32 : 26
      const shadow = selected
        ? '0 0 0 3px rgba(245,166,35,0.6), 0 4px 12px rgba(0,0,0,0.5)'
        : '0 2px 8px rgba(0,0,0,0.4)'
      el.style.width = `${size}px`
      el.style.height = `${size}px`
      el.style.boxShadow = shadow
    })

    if (selectedPlace) {
      mapRef.current.flyTo({
        center: selectedPlace.coordinates as [number, number],
        zoom: 13,
        duration: 1000,
      })
    }
  }, [selectedPlace, places])

  return (
    <div style={{ height: 280, width: '100%', position: 'relative' }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
      {loading && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#0d1117',
          }}
        >
          <div
            className="animate-spin"
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              border: '2px solid #f5a623',
              borderTopColor: 'transparent',
            }}
          />
        </div>
      )}
    </div>
  )
}
