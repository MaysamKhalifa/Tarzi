'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search, MapPin, Star, Scissors, Filter } from 'lucide-react'
import BottomNav from '@/components/layout/BottomNav'
import PageHeader from '@/components/layout/PageHeader'
import { SAMPLE_TAILORS } from '@/lib/data/tailors'

type ServiceFilter = 'all' | 'alterations' | 'from_scratch' | 'upcycling'

export default function TailorsPage() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<ServiceFilter>('all')

  const tailors = SAMPLE_TAILORS.filter(t => {
    const matchSearch = t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.area.toLowerCase().includes(search.toLowerCase()) ||
      t.expertise.some(e => e.toLowerCase().includes(search.toLowerCase()))
    const matchFilter = filter === 'all' || t.specialties.includes(filter as any)
    return matchSearch && matchFilter
  })

  const filters: { key: ServiceFilter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'alterations', label: 'Alterations' },
    { key: 'from_scratch', label: 'From Scratch' },
    { key: 'upcycling', label: 'Upcycling' },
  ]

  return (
    <div className="min-h-dvh bg-white pb-24">
      {/* Pink header */}
      <div className="px-5 pt-12 pb-5"
        style={{ background: 'linear-gradient(135deg, #e91e8c 0%, #f06292 100%)' }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: 'white', marginBottom: 12 }}>Nearby Tailors</h1>
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search tailors, areas, expertise..."
            className="w-full pl-11 pr-4 py-3 rounded-2xl text-sm outline-none"
            style={{ background: 'white', fontSize: 14 }}
          />
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2" color="#9e9e9e" />
        </div>
      </div>

      {/* Filter chips */}
      <div className="px-5 py-3 flex gap-2 overflow-x-auto no-scrollbar">
        {filters.map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className="px-4 py-2 rounded-full text-sm font-semibold flex-shrink-0 transition-all"
            style={{
              background: filter === f.key ? '#e91e8c' : '#f5f5f5',
              color: filter === f.key ? 'white' : '#555',
            }}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Count */}
      <div className="px-5 pb-2">
        <p style={{ fontSize: 13, color: '#9e9e9e' }}>{tailors.length} tailors found</p>
      </div>

      {/* Tailor list */}
      <div className="px-5 flex flex-col gap-3 pb-4">
        {tailors.map(tailor => (
          <Link key={tailor.id} href={`/tailors/${tailor.id}`}
            className="flex gap-4 p-4 rounded-2xl transition-all"
            style={{ background: 'white', boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>
            {/* Avatar */}
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #fce4ec 0%, #f8bbd0 100%)' }}>
              <Scissors size={26} color="#e91e8c" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <p style={{ fontSize: 15, fontWeight: 700, color: '#1a1a1a' }}>{tailor.name}</p>
                {tailor.is_available ? (
                  <span style={{ fontSize: 10, background: '#e8f5e9', color: '#2e7d32', padding: '2px 8px', borderRadius: 50, fontWeight: 600 }}>Available</span>
                ) : (
                  <span style={{ fontSize: 10, background: '#f5f5f5', color: '#9e9e9e', padding: '2px 8px', borderRadius: 50, fontWeight: 600 }}>Busy</span>
                )}
              </div>

              <div className="flex items-center gap-1 mt-1">
                <MapPin size={11} color="#9e9e9e" />
                <span style={{ fontSize: 12, color: '#9e9e9e' }}>{tailor.location}</span>
                <span style={{ fontSize: 12, color: '#ddd' }}>•</span>
                <span style={{ fontSize: 12, color: '#e91e8c', fontWeight: 600 }}>
                  {tailor.distance_km < 1 ? `${tailor.distance_km * 1000}m` : `${tailor.distance_km}km`}
                </span>
              </div>

              <div className="flex items-center gap-2 mt-1.5">
                <div className="flex items-center gap-0.5">
                  <Star size={11} color="#ffc107" fill="#ffc107" />
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#1a1a1a' }}>{tailor.rating}</span>
                  <span style={{ fontSize: 11, color: '#9e9e9e' }}> ({tailor.review_count})</span>
                </div>
                <span style={{ fontSize: 11, color: '#9e9e9e' }}>• {tailor.experience_years} yrs exp</span>
              </div>

              <div className="flex flex-wrap gap-1 mt-2">
                {tailor.expertise.slice(0, 3).map(e => (
                  <span key={e} style={{ fontSize: 10, background: '#fce4ec', color: '#e91e8c', padding: '2px 8px', borderRadius: 50, fontWeight: 500 }}>
                    {e}
                  </span>
                ))}
              </div>
            </div>
          </Link>
        ))}

        {tailors.length === 0 && (
          <div className="text-center py-16">
            <Scissors size={40} color="#ddd" className="mx-auto mb-3" />
            <p style={{ color: '#9e9e9e', fontSize: 14 }}>No tailors found</p>
            <p style={{ color: '#bbb', fontSize: 12 }}>Try a different search</p>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
