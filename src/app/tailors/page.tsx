'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, MapPin, Star, Scissors, Heart } from 'lucide-react'
import BottomNav from '@/components/layout/BottomNav'
import PageHeader from '@/components/layout/PageHeader'
import { SAMPLE_TAILORS } from '@/lib/data/tailors'
import { createClient } from '@/lib/supabase/client'
import { useApp } from '@/lib/context/AppContext'
import { useLanguage } from '@/lib/context/LanguageContext'

type ServiceFilter = 'all' | 'alterations' | 'from_scratch' | 'upcycling'

export default function TailorsPage() {
  const { user } = useApp()
  const { t } = useLanguage()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<ServiceFilter>('all')
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set())
  const [savingId, setSavingId] = useState<string | null>(null)

  // Load saved tailors for current user
  useEffect(() => {
    if (!user) return
    const supabase = createClient()
    supabase
      .from('saved_tailors')
      .select('tailor_id')
      .eq('user_id', user.id)
      .then(({ data }) => {
        setSavedIds(new Set((data || []).map((r: { tailor_id: string }) => r.tailor_id)))
      })
  }, [user])

  const toggleSave = async (e: React.MouseEvent, tailorId: string) => {
    e.preventDefault()
    e.stopPropagation()
    if (!user || savingId) return
    setSavingId(tailorId)
    const supabase = createClient()
    if (savedIds.has(tailorId)) {
      await supabase.from('saved_tailors').delete().eq('user_id', user.id).eq('tailor_id', tailorId)
      setSavedIds(prev => { const s = new Set(prev); s.delete(tailorId); return s })
    } else {
      await supabase.from('saved_tailors').insert({ user_id: user.id, tailor_id: tailorId })
      setSavedIds(prev => new Set([...prev, tailorId]))
    }
    setSavingId(null)
  }

  const tailors = SAMPLE_TAILORS.filter(t => {
    const matchSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.area.toLowerCase().includes(search.toLowerCase()) ||
      t.expertise.some(e => e.toLowerCase().includes(search.toLowerCase()))
    const matchFilter = filter === 'all' || t.specialties.includes(filter as 'alterations' | 'from_scratch' | 'upcycling')
    return matchSearch && matchFilter
  })

  const filters: { key: ServiceFilter; label: string }[] = [
    { key: 'all', label: t('tailors', 'all') },
    { key: 'alterations', label: t('tailors', 'alterations') },
    { key: 'from_scratch', label: t('tailors', 'from_scratch') },
    { key: 'upcycling', label: t('tailors', 'upcycling') },
  ]

  return (
    <div className="min-h-dvh bg-white pb-24">
      {/* Pink header */}
      <div className="px-5 pt-12 pb-5"
        style={{ background: 'linear-gradient(135deg, #e91e8c 0%, #f06292 100%)' }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: 'white', marginBottom: 12 }}>{t('tailors', 'title')}</h1>
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t('tailors', 'search_placeholder')}
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
        <p style={{ fontSize: 13, color: '#9e9e9e' }}>{tailors.length} {t('tailors', 'found')}</p>
      </div>

      {/* Tailor list */}
      <div className="px-5 flex flex-col gap-3 pb-4">
        {tailors.map(tailor => {
          const isSaved = savedIds.has(tailor.id)
          const isSaving = savingId === tailor.id
          return (
            <Link key={tailor.id} href={`/tailors/${tailor.id}`}
              className="flex gap-4 p-4 rounded-2xl transition-all relative"
              style={{ background: 'white', boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>

              {/* Avatar */}
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #fce4ec 0%, #f8bbd0 100%)' }}>
                <Scissors size={26} color="#e91e8c" />
              </div>

              <div className="flex-1 min-w-0 pr-10">
                <div className="flex items-start justify-between">
                  <p style={{ fontSize: 15, fontWeight: 700, color: '#1a1a1a' }}>{tailor.name}</p>
                  {tailor.is_available ? (
                    <span style={{ fontSize: 10, background: '#e8f5e9', color: '#2e7d32', padding: '2px 8px', borderRadius: 50, fontWeight: 600, flexShrink: 0 }}>
                      {t('common', 'available')}
                    </span>
                  ) : (
                    <span style={{ fontSize: 10, background: '#f5f5f5', color: '#9e9e9e', padding: '2px 8px', borderRadius: 50, fontWeight: 600, flexShrink: 0 }}>
                      {t('common', 'busy')}
                    </span>
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
                  <span style={{ fontSize: 11, color: '#9e9e9e' }}>• {tailor.experience_years} {t('common', 'yrs_exp')}</span>
                </div>

                <div className="flex flex-wrap gap-1 mt-2">
                  {tailor.expertise.slice(0, 3).map(e => (
                    <span key={e} style={{ fontSize: 10, background: '#fce4ec', color: '#e91e8c', padding: '2px 8px', borderRadius: 50, fontWeight: 500 }}>
                      {e}
                    </span>
                  ))}
                </div>
              </div>

              {/* Heart button */}
              <button
                onClick={(e) => toggleSave(e, tailor.id)}
                disabled={isSaving}
                className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-all"
                style={{ background: isSaved ? '#fce4ec' : '#f5f5f5' }}
              >
                <Heart
                  size={16}
                  color={isSaved ? '#e91e8c' : '#bbb'}
                  fill={isSaved ? '#e91e8c' : 'none'}
                />
              </button>
            </Link>
          )
        })}

        {tailors.length === 0 && (
          <div className="text-center py-16">
            <Scissors size={40} color="#ddd" className="mx-auto mb-3" />
            <p style={{ color: '#9e9e9e', fontSize: 14 }}>{t('tailors', 'no_results')}</p>
            <p style={{ color: '#bbb', fontSize: 12 }}>{t('tailors', 'no_results_sub')}</p>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
