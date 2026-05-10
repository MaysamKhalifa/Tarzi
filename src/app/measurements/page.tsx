'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Ruler, User, ChevronRight, Plus, Check } from 'lucide-react'
import BottomNav from '@/components/layout/BottomNav'
import PageHeader from '@/components/layout/PageHeader'
import { createClient } from '@/lib/supabase/client'
import { useApp } from '@/lib/context/AppContext'
import { useLanguage } from '@/lib/context/LanguageContext'
import type { Measurement } from '@/types/database'

export default function MeasurementsPage() {
  const { user, loading: authLoading } = useApp()
  const { t } = useLanguage()
  const [measurements, setMeasurements] = useState<Measurement[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState('')

  useEffect(() => {
    // Wait until auth resolves
    if (authLoading) return

    // Not logged in — stop loading, show empty state
    if (!user) {
      setLoading(false)
      return
    }

    let cancelled = false

    const load = async () => {
      setLoading(true)
      setFetchError('')
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('measurements')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (cancelled) return

        if (error) {
          console.error('Measurements fetch error:', error)
          setFetchError(error.message)
        } else {
          setMeasurements(data || [])
        }
      } catch (err) {
        if (cancelled) return
        console.error('Measurements unexpected error:', err)
        setFetchError('Could not load measurements. Please try again.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()

    return () => { cancelled = true }
  }, [user?.id, authLoading]) // depend on user.id (stable), not user object (new ref each render)

  return (
    <div className="min-h-dvh bg-white pb-24">
      <PageHeader title={t('measurements', 'title')} showBack={false} />

      <div className="px-5 flex flex-col gap-5 py-4">
        {/* Options */}
        <div className="flex flex-col gap-3">
          <Link href="/measurements/self"
            className="flex items-center gap-4 p-5 rounded-2xl transition-all"
            style={{ background: 'linear-gradient(135deg, #fce4ec 0%, #f8bbd0 100%)' }}>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: 'white', boxShadow: '0 2px 10px rgba(233,30,140,0.2)' }}>
              <Ruler size={26} color="#e91e8c" />
            </div>
            <div className="flex-1">
              <p style={{ fontSize: 16, fontWeight: 700, color: '#1a1a1a' }}>{t('measurements', 'self')}</p>
              <p style={{ fontSize: 13, color: '#757575', marginTop: 2, lineHeight: 1.4 }}>
                {t('measurements', 'self_desc')}
              </p>
            </div>
            <ChevronRight size={18} color="#e91e8c" />
          </Link>

          <Link href="/measurements/tailor"
            className="flex items-center gap-4 p-5 rounded-2xl transition-all"
            style={{ background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)' }}>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: 'white', boxShadow: '0 2px 10px rgba(46,125,50,0.15)' }}>
              <User size={26} color="#2e7d32" />
            </div>
            <div className="flex-1">
              <p style={{ fontSize: 16, fontWeight: 700, color: '#1a1a1a' }}>{t('measurements', 'tailor')}</p>
              <p style={{ fontSize: 13, color: '#757575', marginTop: 2, lineHeight: 1.4 }}>
                {t('measurements', 'tailor_desc')}
              </p>
            </div>
            <ChevronRight size={18} color="#2e7d32" />
          </Link>
        </div>

        {/* Saved measurements */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 style={{ fontSize: 17, fontWeight: 700, color: '#1a1a1a' }}>Saved Profiles</h2>
            <Link href="/measurements/self"
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl"
              style={{ background: '#fce4ec' }}>
              <Plus size={14} color="#e91e8c" />
              <span style={{ fontSize: 12, color: '#e91e8c', fontWeight: 600 }}>Add</span>
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 rounded-full border-2 border-pink-200 border-t-pink-500 animate-spin" />
            </div>
          ) : fetchError ? (
            <div className="text-center py-10 rounded-2xl" style={{ background: '#fff0f0' }}>
              <p style={{ color: '#d32f2f', fontSize: 14, fontWeight: 600 }}>Could not load measurements</p>
              <p style={{ color: '#9e9e9e', fontSize: 12, marginTop: 4 }}>{fetchError}</p>
              <button
                onClick={() => { setLoading(true); setFetchError(''); window.location.reload() }}
                className="mt-4 px-5 py-2 rounded-xl text-sm font-semibold"
                style={{ background: '#fce4ec', color: '#e91e8c' }}>
                Retry
              </button>
            </div>
          ) : measurements.length === 0 ? (
            <div className="text-center py-10 rounded-2xl" style={{ background: '#f9f9f9' }}>
              <Ruler size={40} color="#ddd" className="mx-auto mb-3" />
              <p style={{ color: '#9e9e9e', fontSize: 14 }}>{t('measurements', 'no_measurements')}</p>
              <p style={{ color: '#bbb', fontSize: 12, marginTop: 4 }}>{t('measurements', 'add_first')}</p>
              <Link href="/measurements/self"
                className="inline-block mt-4 px-5 py-2 rounded-xl text-sm font-semibold"
                style={{ background: '#fce4ec', color: '#e91e8c' }}>
                Add your first profile
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {measurements.map(m => (
                <div key={m.id} className="flex items-center gap-3 p-4 rounded-2xl"
                  style={{ background: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ background: m.gender === 'female' ? '#fce4ec' : '#e3f2fd' }}>
                    <User size={20} color={m.gender === 'female' ? '#e91e8c' : '#1565c0'} />
                  </div>
                  <div className="flex-1">
                    <p style={{ fontSize: 15, fontWeight: 700, color: '#1a1a1a' }}>{m.name}</p>
                    <p style={{ fontSize: 12, color: '#9e9e9e', textTransform: 'capitalize' }}>
                      {m.gender} • {(m as Measurement & { unit?: string }).unit ?? 'cm'} • {new Date(m.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  {m.is_default && (
                    <span className="flex items-center gap-1 px-2 py-1 rounded-lg"
                      style={{ background: '#e8f5e9', fontSize: 11, color: '#2e7d32', fontWeight: 600 }}>
                      <Check size={10} /> {t('measurements', 'default_label')}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
