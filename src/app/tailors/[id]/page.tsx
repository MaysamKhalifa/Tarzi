'use client'

import { use, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { MapPin, Star, Clock, Phone, Heart, ChevronLeft, Scissors, Check, MessageCircle } from 'lucide-react'
import { SAMPLE_TAILORS, TAILOR_REVIEWS } from '@/lib/data/tailors'
import { translateTailorFields, translateReviewComment } from '@/lib/data/tailorTranslations'
import { createClient } from '@/lib/supabase/client'
import { useApp } from '@/lib/context/AppContext'
import { useLanguage } from '@/lib/context/LanguageContext'

export default function TailorProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { user } = useApp()
  const { lang, t: tl } = useLanguage()
  const [saved, setSaved] = useState(false)
  const [saveLoading, setSaveLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'about' | 'reviews'>('about')

  const tailor = SAMPLE_TAILORS.find(t => t.id === id)
  const reviews = TAILOR_REVIEWS.filter(r => r.tailor_id === id)
  const td = tailor ? translateTailorFields(tailor, lang) : null

  useEffect(() => {
    if (!user || !tailor) return
    const supabase = createClient()
    supabase
      .from('saved_tailors')
      .select('id')
      .eq('user_id', user.id)
      .eq('tailor_id', id)
      .maybeSingle()
      .then(({ data }) => setSaved(!!data))
  }, [user, id, tailor])

  const toggleSave = async () => {
    if (saveLoading) return
    if (!user) {
      window.location.href = '/login'
      return
    }
    setSaveLoading(true)
    const supabase = createClient()
    try {
      if (saved) {
        const { error } = await supabase.from('saved_tailors').delete().eq('user_id', user.id).eq('tailor_id', id)
        if (!error) setSaved(false)
      } else {
        const { error } = await supabase.from('saved_tailors').insert({ user_id: user.id, tailor_id: id })
        if (!error) setSaved(true)
      }
    } catch {
      // ignore
    }
    setSaveLoading(false)
  }

  if (!tailor) return (
    <div className="min-h-dvh flex items-center justify-center">
      <p style={{ color: '#9e9e9e' }}>Tailor not found</p>
    </div>
  )

  return (
    <div className="min-h-dvh bg-white pb-24">
      {/* Header */}
      <div className="relative h-52"
        style={{ background: 'linear-gradient(135deg, #e91e8c 0%, #f06292 100%)' }}>
        <button
          onClick={() => router.back()}
          className="absolute top-12 left-4 w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center"
        >
          <ChevronLeft size={22} color="white" />
        </button>
        <button
          onClick={toggleSave}
          disabled={saveLoading}
          className="absolute top-12 right-4 w-10 h-10 rounded-xl flex items-center justify-center transition-all"
          style={{ background: saved ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.2)' }}
        >
          <Heart
            size={20}
            color="white"
            fill={saved ? 'white' : 'none'}
            strokeWidth={2}
          />
        </button>

        {/* Fully white logo */}
        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
          <div
            className="w-20 h-20 rounded-2xl border-4 border-white flex items-center justify-center"
            style={{ background: 'white', boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}
          >
            <Scissors size={32} color="#e91e8c" />
          </div>
        </div>
      </div>

      <div className="px-5 pt-14 flex flex-col gap-5">
        {/* Name + rating */}
        <div className="text-center">
          <h1 style={{ fontSize: 20, fontWeight: 800, color: '#1a1a1a' }}>{tailor.name}</h1>
          <div className="flex items-center justify-center gap-2 mt-1">
            <MapPin size={13} color="#9e9e9e" />
            <span style={{ fontSize: 13, color: '#9e9e9e' }}>{td?.location || tailor.location}</span>
            <span style={{ fontSize: 12, color: '#e91e8c', fontWeight: 700 }}>
              • {tailor.distance_km < 1 ? `${tailor.distance_km * 1000}m` : `${tailor.distance_km}km`}
            </span>
          </div>
          <div className="flex items-center justify-center gap-3 mt-2">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map(s => (
                <Star key={s} size={14} color="#ffc107" fill={s <= Math.round(tailor.rating) ? '#ffc107' : 'none'} />
              ))}
              <span style={{ fontSize: 13, fontWeight: 700, marginLeft: 4 }}>{tailor.rating}</span>
            </div>
            <span style={{ fontSize: 12, color: '#9e9e9e' }}>({tailor.review_count} reviews)</span>
          </div>
          {saved && (
            <p style={{ fontSize: 12, color: '#e91e8c', fontWeight: 600, marginTop: 6 }}>❤️ Saved to favourites</p>
          )}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: tl('tailor_profile', 'experience'), value: `${tailor.experience_years} ${tl('common', 'yrs_exp')}` },
            { label: tl('tailor_profile', 'reviews'), value: tailor.review_count.toString() },
            { label: tl('tailor_profile', 'status'), value: tailor.is_available ? tl('common', 'available') : tl('common', 'busy') },
          ].map(stat => (
            <div key={stat.label} className="text-center p-3 rounded-2xl" style={{ background: '#f9f9f9' }}>
              <p style={{ fontSize: 16, fontWeight: 800, color: stat.label === 'Status' && !tailor.is_available ? '#f44336' : '#1a1a1a' }}>
                {stat.value}
              </p>
              <p style={{ fontSize: 11, color: '#9e9e9e' }}>{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-0 p-1 rounded-2xl" style={{ background: '#f5f5f5' }}>
          {(['about', 'reviews'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold capitalize transition-all"
              style={{
                background: activeTab === tab ? 'white' : 'transparent',
                color: activeTab === tab ? '#e91e8c' : '#9e9e9e',
                boxShadow: activeTab === tab ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
              }}>
              {tab === 'about' ? tl('tailor_profile', 'about') : tl('tailor_profile', 'reviews_tab')} {tab === 'reviews' ? `(${reviews.length})` : ''}
            </button>
          ))}
        </div>

        {activeTab === 'about' ? (
          <>
            {/* Availability */}
            <div className="p-4 rounded-2xl" style={{ background: '#f9f9f9' }}>
              <div className="flex items-center gap-2 mb-2">
                <Clock size={16} color="#e91e8c" />
                <p style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a' }}>{tl('tailor_profile', 'availability')}</p>
              </div>
              <p style={{ fontSize: 13, color: '#555' }}>{td?.availability || tailor.availability}</p>
              <p style={{ fontSize: 13, color: '#555' }}>{td?.availability_hours || tailor.availability_hours}</p>
            </div>

            {/* Expertise */}
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a', marginBottom: 10 }}>{tl('tailor_profile', 'expertise')}</p>
              <div className="flex flex-wrap gap-2">
                {(td?.expertise || tailor.expertise).map((e, i) => (
                  <span key={i} className="flex items-center gap-1 px-3 py-1.5 rounded-xl"
                    style={{ background: '#fce4ec', fontSize: 12, color: '#e91e8c', fontWeight: 600 }}>
                    <Check size={11} /> {e}
                  </span>
                ))}
              </div>
            </div>

            {/* Services */}
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a', marginBottom: 10 }}>{tl('tailor_profile', 'services')}</p>
              <div className="flex flex-wrap gap-2">
                {tailor.specialties.map(s => (
                  <span key={s} style={{ background: '#f3e5f5', color: '#7b1fa2', padding: '6px 14px', borderRadius: 50, fontSize: 12, fontWeight: 600, textTransform: 'capitalize' }}>
                    {s === 'alterations' ? tl('home', 'alterations') : s === 'from_scratch' ? tl('home', 'from_scratch') : tl('home', 'upcycling')}
                  </span>
                ))}
              </div>
            </div>
          </>
        ) : (
          /* Scrollable reviews */
          <div className="flex flex-col gap-3 overflow-y-auto" style={{ maxHeight: '55vh', paddingBottom: 16 }}>
            {reviews.length > 0 ? reviews.map((r, i) => (
              <div key={i} className="p-4 rounded-2xl flex-shrink-0" style={{ background: '#f9f9f9' }}>
                <div className="flex items-center justify-between mb-2">
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a' }}>{r.user_name}</p>
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star key={s} size={11} color="#ffc107" fill={s <= r.rating ? '#ffc107' : 'none'} />
                    ))}
                  </div>
                </div>
                <p style={{ fontSize: 13, color: '#555', lineHeight: 1.5 }}>
                  {translateReviewComment(id, i, r.comment, lang)}
                </p>
                <p style={{ fontSize: 11, color: '#bbb', marginTop: 6 }}>{r.created_at}</p>
              </div>
            )) : (
              <div className="text-center py-8">
                <p style={{ color: '#9e9e9e', fontSize: 14 }}>{tl('tailor_profile', 'no_reviews')}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action buttons — fixed at bottom */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-5 py-4 bg-white"
        style={{ borderTop: '1px solid #f0f0f0', boxShadow: '0 -4px 20px rgba(0,0,0,0.06)' }}>
        <div className="flex gap-2">
          <a href={`tel:${tailor.phone}`}
            className="flex items-center justify-center gap-1.5 py-3 px-4 rounded-full font-semibold text-sm"
            style={{ border: '2px solid #e91e8c', color: '#e91e8c' }}>
            <Phone size={15} /> {tl('tailor_profile', 'call')}
          </a>
          <Link href={`/orders`}
            className="flex items-center justify-center gap-1.5 py-3 px-4 rounded-full font-semibold text-sm"
            style={{ border: '2px solid #e91e8c', color: '#e91e8c' }}>
            <MessageCircle size={15} /> {tl('orders', 'chat')}
          </Link>
          <Link
            href={`/booking/alterations?tailorId=${tailor.id}&tailorName=${encodeURIComponent(tailor.name)}`}
            className="flex items-center justify-center py-3 rounded-full text-white font-bold text-sm flex-1"
            style={{ background: 'linear-gradient(135deg, #e91e8c 0%, #f06292 100%)' }}>
            {tl('tailor_profile', 'book')}
          </Link>
        </div>
      </div>
    </div>
  )
}
