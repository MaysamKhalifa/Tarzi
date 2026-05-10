'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, MapPin, Star, Scissors, Heart } from 'lucide-react'
import BottomNav from '@/components/layout/BottomNav'
import { createClient } from '@/lib/supabase/client'
import { useApp } from '@/lib/context/AppContext'
import { useLanguage } from '@/lib/context/LanguageContext'

type ServiceFilter = 'all' | 'alterations' | 'from_scratch' | 'upcycling'

interface TailorRow {
  id: string
  full_name: string | null
  shop_name: string | null
  avatar_url: string | null
  city: string | null
  area: string | null
  specialties: string[] | null
  languages: string[] | null
  availability: string | null
  bio: string | null
  years_exp: number | null
  specialty: string | null
  preferred_language: string | null
}

interface DisplayTailor {
  id: string
  name: string
  location: string
  area: string
  avatar_url: string | null
  specialties: string[]
  expertise: string[]
  availability: string | null
  years_exp: number | null
}

function mapToDisplay(row: TailorRow): DisplayTailor {
  return {
    id: row.id,
    name: row.shop_name || row.full_name || 'Unknown Tailor',
    location: [row.area, row.city].filter(Boolean).join(', '),
    area: row.area || row.city || '',
    avatar_url: row.avatar_url,
    specialties: row.specialties || [],
    expertise: row.specialty ? [row.specialty] : [],
    availability: row.availability,
    years_exp: row.years_exp,
  }
}

// Loading skeleton card
function SkeletonCard() {
  return (
    <div className="flex gap-4 p-4 rounded-2xl animate-pulse" style={{ background: 'white', boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>
      <div className="w-16 h-16 rounded-2xl flex-shrink-0" style={{ background: '#f0f0f0' }} />
      <div className="flex-1 min-w-0 flex flex-col gap-2">
        <div className="h-4 rounded-full w-2/3" style={{ background: '#f0f0f0' }} />
        <div className="h-3 rounded-full w-1/2" style={{ background: '#f0f0f0' }} />
        <div className="h-3 rounded-full w-1/3" style={{ background: '#f0f0f0' }} />
        <div className="flex gap-1 mt-1">
          <div className="h-5 w-16 rounded-full" style={{ background: '#f0f0f0' }} />
          <div className="h-5 w-16 rounded-full" style={{ background: '#f0f0f0' }} />
        </div>
      </div>
    </div>
  )
}

export default function TailorsPage() {
  const { user } = useApp()
  const { t } = useLanguage()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<ServiceFilter>('all')
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set())
  const [savingId, setSavingId] = useState<string | null>(null)
  const [tailors, setTailors] = useState<DisplayTailor[]>([])
  const [loading, setLoading] = useState(true)

  // Load tailors from Supabase
  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('profiles')
      .select('id, full_name, shop_name, avatar_url, city, area, specialties, languages, availability, bio, years_exp, specialty, preferred_language')
      .eq('role', 'tailor')
      .eq('onboarding_complete', true)
      .then(({ data, error }) => {
        if (!error && data) {
          setTailors((data as TailorRow[]).map(mapToDisplay))
        }
        setLoading(false)
      })
  }, [])

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
    if (savingId) return
    if (!user) {
      window.location.href = '/login'
      return
    }
    setSavingId(tailorId)
    const supabase = createClient()
    try {
      if (savedIds.has(tailorId)) {
        const { error } = await supabase.from('saved_tailors').delete().eq('user_id', user.id).eq('tailor_id', tailorId)
        if (!error) setSavedIds(prev => { const s = new Set(prev); s.delete(tailorId); return s })
      } else {
        const { error } = await supabase.from('saved_tailors').insert({ user_id: user.id, tailor_id: tailorId })
        if (!error) setSavedIds(prev => new Set([...prev, tailorId]))
      }
    } catch {
      // Silent fail
    }
    setSavingId(null)
  }

  const filtered = tailors.filter(tailor => {
    const matchSearch =
      tailor.name.toLowerCase().includes(search.toLowerCase()) ||
      tailor.area.toLowerCase().includes(search.toLowerCase()) ||
      tailor.expertise.some(e => e.toLowerCase().includes(search.toLowerCase())) ||
      tailor.specialties.some(s => s.toLowerCase().includes(search.toLowerCase()))
    const matchFilter =
      filter === 'all' || tailor.specialties.includes(filter)
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
        <p style={{ fontSize: 13, color: '#9e9e9e' }}>{loading ? '…' : filtered.length} {t('tailors', 'found')}</p>
      </div>

      {/* Tailor list */}
      <div className="px-5 flex flex-col gap-3 pb-4">
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <>
            {filtered.map(tailor => {
              const isSaved = savedIds.has(tailor.id)
              const isSaving = savingId === tailor.id
              return (
                <Link key={tailor.id} href={`/tailors/${tailor.id}`}
                  className="flex gap-4 p-4 rounded-2xl transition-all relative"
                  style={{ background: 'white', boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>

                  {/* Avatar */}
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 overflow-hidden"
                    style={{ background: 'linear-gradient(135deg, #fce4ec 0%, #f8bbd0 100%)' }}>
                    {tailor.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={tailor.avatar_url} alt={tailor.name} className="w-full h-full object-cover" />
                    ) : (
                      <Scissors size={26} color="#e91e8c" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0 pr-10">
                    <div className="flex items-start justify-between">
                      <p style={{ fontSize: 15, fontWeight: 700, color: '#1a1a1a' }}>{tailor.name}</p>
                      {tailor.availability ? (
                        <span style={{ fontSize: 10, background: '#e8f5e9', color: '#2e7d32', padding: '2px 8px', borderRadius: 50, fontWeight: 600, flexShrink: 0 }}>
                          {t('common', 'available')}
                        </span>
                      ) : (
                        <span style={{ fontSize: 10, background: '#f5f5f5', color: '#9e9e9e', padding: '2px 8px', borderRadius: 50, fontWeight: 600, flexShrink: 0 }}>
                          {t('common', 'busy')}
                        </span>
                      )}
                    </div>

                    {tailor.location && (
                      <div className="flex items-center gap-1 mt-1">
                        <MapPin size={11} color="#9e9e9e" />
                        <span style={{ fontSize: 12, color: '#9e9e9e' }}>{tailor.location}</span>
                      </div>
                    )}

                    {tailor.years_exp != null && (
                      <div className="flex items-center gap-2 mt-1.5">
                        <span style={{ fontSize: 11, color: '#9e9e9e' }}>{tailor.years_exp} {t('common', 'yrs_exp')}</span>
                      </div>
                    )}

                    {/* Expertise / specialties tags */}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {tailor.specialties.slice(0, 3).map(s => (
                        <span key={s} style={{ fontSize: 10, background: '#fce4ec', color: '#e91e8c', padding: '2px 8px', borderRadius: 50, fontWeight: 500 }}>
                          {s}
                        </span>
                      ))}
                      {tailor.expertise.slice(0, 2).map(e => (
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

            {filtered.length === 0 && (
              <div className="text-center py-16">
                <Scissors size={40} color="#ddd" className="mx-auto mb-3" />
                <p style={{ color: '#9e9e9e', fontSize: 14 }}>{t('tailors', 'no_results')}</p>
                <p style={{ color: '#bbb', fontSize: 12 }}>{t('tailors', 'no_results_sub')}</p>
              </div>
            )}
          </>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
