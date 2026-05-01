'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix Leaflet's default icon URLs broken by bundlers
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

// Custom pink marker
const pinkIcon = L.divIcon({
  className: '',
  html: `<div style="
    width:32px;height:32px;
    background:linear-gradient(135deg,#e91e8c,#f06292);
    border-radius:50% 50% 50% 0;
    transform:rotate(-45deg);
    border:3px solid white;
    box-shadow:0 3px 12px rgba(233,30,140,0.5);
  "></div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
})

interface Props {
  lat: number
  lng: number
  onSelect: (lat: number, lng: number, address: string) => void
}

export default function MapPicker({ lat, lng, onSelect }: Props) {
  const mapRef = useRef<L.Map | null>(null)
  const markerRef = useRef<L.Marker | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = L.map(containerRef.current, {
      center: [lat, lng],
      zoom: 14,
      zoomControl: true,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(map)

    const marker = L.marker([lat, lng], { icon: pinkIcon, draggable: true }).addTo(map)
    markerRef.current = marker
    mapRef.current = map

    const handleMove = async (newLat: number, newLng: number) => {
      marker.setLatLng([newLat, newLng])
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${newLat}&lon=${newLng}&format=json`,
          { headers: { 'Accept-Language': 'en' } }
        )
        const data = await res.json()
        const addr = data.display_name || `${newLat.toFixed(5)}, ${newLng.toFixed(5)}`
        onSelect(newLat, newLng, addr)
      } catch {
        onSelect(newLat, newLng, `${newLat.toFixed(5)}, ${newLng.toFixed(5)}`)
      }
    }

    map.on('click', (e) => handleMove(e.latlng.lat, e.latlng.lng))
    marker.on('dragend', () => {
      const pos = marker.getLatLng()
      handleMove(pos.lat, pos.lng)
    })

    return () => {
      map.remove()
      mapRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Update marker when lat/lng props change from outside (e.g. geolocation)
  useEffect(() => {
    if (mapRef.current && markerRef.current) {
      markerRef.current.setLatLng([lat, lng])
      mapRef.current.setView([lat, lng], 15)
    }
  }, [lat, lng])

  return (
    <div
      ref={containerRef}
      style={{ height: 220, width: '100%', borderRadius: 16, overflow: 'hidden', zIndex: 0 }}
    />
  )
}
