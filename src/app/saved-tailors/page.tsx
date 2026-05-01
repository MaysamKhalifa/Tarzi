'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Heart, MapPin, Star, Scissors, ChevronRight, Trash2 } from 'lucide-react'
import PageHeader from '@/components/layout/PageHeader'
import BottomNav from '@/components/layout/BottomNav'
import { createClient } from '@/lib/supabase/client'
import { useApp } from '@/lib/context/AppContext'
import { SAMPLE_TAILORS } from '@/lib/data/tailors'
import type { Tailor } from '@/types/database'

export default function SavedTailorsPage() {
  const { user } = useApp()
  const [savedTailors, setSavedTailors] = useState<Tailor[]>([])
  const [loading, setLoading] = useState(true)

  const fetchSaved = async () => {
    if (!user) return
    const supabase = createClient()
    const { data } = await supabase
      .from('saved_tailors')
      .select('tailor_id')
      .eq('user_id', user.id)

    const ids = (data || []).map((r: { tailor_id: string }) => r.tailor_id)
    const matched = SAMPLE_TAILORS.filter(t => ids.includes(t.id))
    setSavedTailors(matched)
    setLoading(false)
  }

  useEffect(() => { fetchSaved() }, [user])

  const handleRemove = async (tailorId: string) => {
    if (!user) return
    const supabase = createClient()
    await supabase.from('saved_tailors').delete().eq('user_id', user.id).eq('tailor_id', tailorId)
    setSavedTailors(prev => prev.filter(t => t.id !== tailorId))
  }

  return (
    <div className="min-h-dvh bg-white pb-24">
      <div className="px-5 pt-12 pb-5"
        style={{ background: 'linear-gradient(135deg, #e91e8c 0%, #f06292 100%)' }}>
        <PageHeader title="Saved Tailors" transparent showBack />
      </div>

      <div className="px-5 py-4">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-10 h-10 rounded-full border-2 border-pink-200 border-t-pink-500 animate-spin" />
          </div>
        ) : savedTailors.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
              style={{ background: '#fce4ec' }}>
              <Heart size={36} color="#e91e8c" />
            </div>
            <p style={{ fontSize: 18, fontWeight: 700, color: '#1a1a1a', marginBottom: 8 }}>No saved tailors yet</p>
            <p style={{ color: '#9e9e9e', fontSize: 14, marginBottom: 24, maxWidth: 250 }}>
              Tap the heart icon on any tailor profile to save them here
            </p>
            <Link href="/tailors"
              className="px-8 py-3 rounded-full text-white font-bold text-sm"
              style={{ background: 'linear-gradient(135deg, #e91e8c 0%, #f06292 100%)' }}>
              Browse Tailors
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <p style={{ fontSize: 13, color: '#9e9e9e', marginBottom: 4 }}>
              {savedTailors.length} saved tailor{savedTailors.length !== 1 ? 's' : ''}
            </p>
            {savedTailors.map(tailor => (
              <div key={tailor.id} className="flex items-center gap-3 p-4 rounded-2xl"
                style={{ background: 'white', boxShadow: '0 2px 10px rgba(0,0,0,0.07)' }}>
                <Link href={`/tailors/${tailor.id}`} className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #fce4ec 0%, #f8bbd0 100%)' }}>
                    <Scissors size={24} color="#e91e8c" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p style={{ fontSize: 15, fontWeight: 700, color: '#1a1a1a' }} className="truncate">{tailor.name}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <MapPin size={11} color="#9e9e9e" />
                      <span style={{ fontSize: 12, color: '#9e9e9e' }} className="truncate">{tailor.location}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-0.5">
                        <Star size={11} color="#ffc107" fill="#ffc107" />
                        <span style={{ fontSize: 12, fontWeight: 700 }}>{tailor.rating}</span>
                      </div>
                      <span style={{ fontSize: 11, color: '#9e9e9e' }}>• {tailor.experience_years}yr exp</span>
                      <span className="text-xs px-2 py-0.5 rounded-full"
                        style={{ background: tailor.is_available ? '#e8f5e9' : '#f5f5f5', color: tailor.is_available ? '#2e7d32' : '#9e9e9e', fontSize: 10, fontWeight: 600 }}>
                        {tailor.is_available ? 'Available' : 'Busy'}
                      </span>
                    </div>
                  </div>
                  <ChevronRight size={16} color="#9e9e9e" />
                </Link>
                <button onClick={() => handleRemove(tailor.id)}
                  className="p-2 rounded-xl flex-shrink-0"
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
