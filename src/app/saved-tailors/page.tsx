'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Heart, MapPin, Scissors, ChevronRight, Trash2 } from 'lucide-react'
import PageHeader from '@/components/layout/PageHeader'
import BottomNav from '@/components/layout/BottomNav'
import { createClient } from '@/lib/supabase/client'
import { useApp } from '@/lib/context/AppContext'
import { useLanguage } from '@/lib/context/LanguageContext'

interface SavedTailorProfile {
  id: string
  name: string
  location: string
  avatar_url: string | null
  specialties: string[]
  is_available: boolean
}

export default function SavedTailorsPage() {
  const { user, loading: authLoading } = useApp()
  const { t, isRTL } = useLanguage()
  const [savedTailors, setSavedTailors] = useState<SavedTailorProfile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return
    if (!user) { setLoading(false); return }

    const fetchSaved = async () => {
      try {
        const supabase = createClient()

        // 1. Get saved tailor IDs
        const { data: savedRows } = await supabase
          .from('saved_tailors')
          .select('tailor_id')
          .eq('user_id', user.id)

        const ids = (savedRows || []).map((r: { tailor_id: string }) => r.tailor_id)

        if (ids.length === 0) {
          setSavedTailors([])
          return
        }

        // 2. Load real tailor profiles by ID
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, shop_name, avatar_url, city, area, specialties, availability')
          .in('id', ids)

        const mapped: SavedTailorProfile[] = (profiles || []).map((p: {
          id: string; full_name: string | null; shop_name: string | null;
          avatar_url: string | null; city: string | null; area: string | null;
          specialties: string[] | null; availability: string | null;
        }) => ({
          id: p.id,
          name: p.shop_name || p.full_name || 'Unknown Tailor',
          location: [p.area, p.city].filter(Boolean).join(', '),
          avatar_url: p.avatar_url,
          specialties: p.specialties || [],
          is_available: !!p.availability,
        }))

        setSavedTailors(mapped)
      } catch (err) {
        console.error('Failed to load saved tailors:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchSaved()
  }, [user?.id, authLoading])

  const handleRemove = async (tailorId: string) => {
    if (!user) return
    const supabase = createClient()
    await supabase
      .from('saved_tailors')
      .delete()
      .eq('user_id', user.id)
      .eq('tailor_id', tailorId)
    setSavedTailors(prev => prev.filter(t => t.id !== tailorId))
  }

  return (
    <div className="min-h-dvh bg-white pb-24" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="px-5 pt-12 pb-5"
        style={{ background: 'linear-gradient(135deg, #e91e8c 0%, #f06292 100%)' }}>
        <PageHeader title={t('saved_tailors', 'title')} transparent showBack />
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 4 }}>
          {t('saved_tailors', 'subtitle')}
        </p>
      </div>

      <div className="px-5 py-4">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-10 h-10 rounded-full border-2 border-pink-200 border-t-pink-500 animate-spin" />
          </div>
        ) : !user ? (
          <div className="text-center py-16">
            <Heart size={48} color="#e8e8e8" className="mx-auto mb-4" />
            <p style={{ fontSize: 16, fontWeight: 700, color: '#1a1a1a', marginBottom: 8 }}>
              {t('saved_tailors', 'sign_in_title')}
            </p>
            <Link href="/login"
              className="px-6 py-3 rounded-full text-white font-bold text-sm inline-block mt-2"
              style={{ background: 'linear-gradient(135deg, #e91e8c 0%, #f06292 100%)' }}>
              {t('saved_tailors', 'log_in')}
            </Link>
          </div>
        ) : savedTailors.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
              style={{ background: '#fce4ec' }}>
              <Heart size={36} color="#e91e8c" />
            </div>
            <p style={{ fontSize: 18, fontWeight: 700, color: '#1a1a1a', marginBottom: 8 }}>
              {t('saved_tailors', 'empty')}
            </p>
            <p style={{ color: '#9e9e9e', fontSize: 14, marginBottom: 24, maxWidth: 250 }}>
              {t('saved_tailors', 'empty_sub')}
            </p>
            <Link href="/tailors"
              className="px-8 py-3 rounded-full text-white font-bold text-sm"
              style={{ background: 'linear-gradient(135deg, #e91e8c 0%, #f06292 100%)' }}>
              {t('saved_tailors', 'browse')}
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <p style={{ fontSize: 13, color: '#9e9e9e', marginBottom: 4 }}>
              {savedTailors.length} {savedTailors.length === 1 ? t('saved_tailors', 'count_one') : t('saved_tailors', 'count_other')}
            </p>
            {savedTailors.map(tailor => (
              <div key={tailor.id} className="flex items-center gap-3 p-4 rounded-2xl"
                style={{ background: 'white', boxShadow: '0 2px 10px rgba(0,0,0,0.07)' }}>
                <Link href={`/tailors/${tailor.id}`} className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 overflow-hidden"
                    style={{ background: 'linear-gradient(135deg, #fce4ec 0%, #f8bbd0 100%)' }}>
                    {tailor.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={tailor.avatar_url} alt={tailor.name} className="w-full h-full object-cover" />
                    ) : (
                      <Scissors size={24} color="#e91e8c" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p style={{ fontSize: 15, fontWeight: 700, color: '#1a1a1a' }} className="truncate">
                      {tailor.name}
                    </p>
                    {tailor.location && (
                      <div className="flex items-center gap-1 mt-0.5">
                        <MapPin size={11} color="#9e9e9e" />
                        <span style={{ fontSize: 12, color: '#9e9e9e' }} className="truncate">
                          {tailor.location}
                        </span>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {tailor.specialties.slice(0, 2).map(s => (
                        <span key={s}
                          style={{ fontSize: 10, background: '#fce4ec', color: '#e91e8c', padding: '2px 8px', borderRadius: 50, fontWeight: 500 }}>
                          {s}
                        </span>
                      ))}
                      <span
                        style={{
                          fontSize: 10, padding: '2px 8px', borderRadius: 50, fontWeight: 600,
                          background: tailor.is_available ? '#e8f5e9' : '#f5f5f5',
                          color: tailor.is_available ? '#2e7d32' : '#9e9e9e',
                        }}>
                        {tailor.is_available ? t('common', 'available') : t('common', 'busy')}
                      </span>
                    </div>
                  </div>
                  <ChevronRight size={16} color="#9e9e9e" className="flex-shrink-0" />
                </Link>
                <button
                  onClick={() => handleRemove(tailor.id)}
                  className="p-2.5 rounded-xl flex-shrink-0 transition-all"
                  style={{ background: '#fff0f0' }}>
                  <Trash2 size={16} color="#f44336" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
