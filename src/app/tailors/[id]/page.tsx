'use client'

import { use, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { MapPin, Clock, Phone, Heart, ChevronLeft, Scissors, Check, MessageCircle, Globe, Images } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useApp } from '@/lib/context/AppContext'
import { useLanguage } from '@/lib/context/LanguageContext'
import type { PortfolioItem } from '@/types/database'

interface TailorProfile {
  id: string
  full_name: string | null
  shop_name: string | null
  shop_address: string | null
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
  phone: string | null
}

export default function TailorProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { user } = useApp()
  const { t: tl, isRTL } = useLanguage()
  const [saved, setSaved] = useState(false)
  const [saveLoading, setSaveLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'about' | 'portfolio'>('about')
  const [tailor, setTailor] = useState<TailorProfile | null>(null)
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedImage, setExpandedImage] = useState<string | null>(null)

  // Load tailor profile from Supabase
  useEffect(() => {
    const supabase = createClient()

    Promise.all([
      supabase
        .from('profiles')
        .select('id, full_name, shop_name, shop_address, avatar_url, city, area, specialties, languages, availability, bio, years_exp, specialty, preferred_language, phone')
        .eq('id', id)
        .eq('role', 'tailor')
        .maybeSingle(),
      supabase
        .from('tailor_portfolio')
        .select('*')
        .eq('tailor_id', id)
        .order('created_at', { ascending: false }),
    ]).then(([profileResult, portfolioResult]) => {
      if (profileResult.data) setTailor(profileResult.data as TailorProfile)
      if (portfolioResult.data) setPortfolio(portfolioResult.data as PortfolioItem[])
      setLoading(false)
    })
  }, [id])

  // Load saved state
  useEffect(() => {
    if (!user) return
    const supabase = createClient()
    supabase
      .from('saved_tailors')
      .select('id')
      .eq('user_id', user.id)
      .eq('tailor_id', id)
      .maybeSingle()
      .then(({ data }) => setSaved(!!data))
  }, [user, id])

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

  if (loading) {
    return (
      <div className="min-h-dvh bg-white">
        <div className="relative h-52 animate-pulse" style={{ background: 'linear-gradient(135deg, #e91e8c 0%, #f06292 100%)' }}>
          <button onClick={() => router.back()} className="absolute top-12 left-4 w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <ChevronLeft size={22} color="white" />
          </button>
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
            <div className="w-20 h-20 rounded-2xl border-4 border-white" style={{ background: '#f0f0f0' }} />
          </div>
        </div>
        <div className="px-5 pt-14 flex flex-col gap-4">
          <div className="flex flex-col items-center gap-2">
            <div className="h-5 w-40 rounded-full animate-pulse" style={{ background: '#f0f0f0' }} />
            <div className="h-4 w-28 rounded-full animate-pulse" style={{ background: '#f0f0f0' }} />
          </div>
        </div>
      </div>
    )
  }

  if (!tailor) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <p style={{ color: '#9e9e9e' }}>{tl('tailor_profile', 'not_found')}</p>
      </div>
    )
  }

  const displayName = tailor.shop_name || tailor.full_name || 'Unknown Tailor'
  const displayLocation = [tailor.area, tailor.city].filter(Boolean).join(', ')
  const expertise = tailor.specialties || (tailor.specialty ? [tailor.specialty] : [])

  return (
    <div className="min-h-dvh bg-white pb-24" dir={isRTL ? 'rtl' : 'ltr'}>
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

        {/* Avatar */}
        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
          <div
            className="w-20 h-20 rounded-2xl border-4 border-white flex items-center justify-center overflow-hidden"
            style={{ background: 'white', boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}
          >
            {tailor.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={tailor.avatar_url} alt={displayName} className="w-full h-full object-cover" />
            ) : (
              <Scissors size={32} color="#e91e8c" />
            )}
          </div>
        </div>
      </div>

      <div className="px-5 pt-14 flex flex-col gap-5">
        {/* Name + location */}
        <div className="text-center">
          <h1 style={{ fontSize: 20, fontWeight: 800, color: '#1a1a1a' }}>{displayName}</h1>
          {displayLocation && (
            <div className="flex items-center justify-center gap-2 mt-1">
              <MapPin size={13} color="#9e9e9e" />
              <span style={{ fontSize: 13, color: '#9e9e9e' }}>{displayLocation}</span>
            </div>
          )}
          {saved && (
            <p style={{ fontSize: 12, color: '#e91e8c', fontWeight: 600, marginTop: 6 }}>{tl('tailor_profile', 'saved')}</p>
          )}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          {[
            {
              label: tl('tailor_profile', 'experience'),
              value: tailor.years_exp != null ? `${tailor.years_exp} ${tl('common', 'yrs_exp')}` : '—',
            },
            {
              label: tl('tailor_profile', 'portfolio'),
              value: portfolio.length.toString(),
            },
            {
              label: tl('tailor_profile', 'status'),
              value: tailor.availability ? tl('common', 'available') : tl('common', 'busy'),
            },
          ].map(stat => (
            <div key={stat.label} className="text-center p-3 rounded-2xl" style={{ background: '#f9f9f9' }}>
              <p style={{ fontSize: 16, fontWeight: 800, color: '#1a1a1a' }}>{stat.value}</p>
              <p style={{ fontSize: 11, color: '#9e9e9e' }}>{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-0 p-1 rounded-2xl" style={{ background: '#f5f5f5' }}>
          {(['about', 'portfolio'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold capitalize transition-all"
              style={{
                background: activeTab === tab ? 'white' : 'transparent',
                color: activeTab === tab ? '#e91e8c' : '#9e9e9e',
                boxShadow: activeTab === tab ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
              }}>
              {tab === 'about' ? tl('tailor_profile', 'about') : `${tl('tailor_profile', 'portfolio') || 'Portfolio'} (${portfolio.length})`}
            </button>
          ))}
        </div>

        {activeTab === 'about' ? (
          <>
            {/* Bio */}
            {tailor.bio && (
              <div className="p-4 rounded-2xl" style={{ background: '#f9f9f9' }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a', marginBottom: 8 }}>{tl('tailor_profile', 'about') || 'About'}</p>
                <p style={{ fontSize: 13, color: '#555', lineHeight: 1.6 }}>{tailor.bio}</p>
              </div>
            )}

            {/* Availability */}
            {tailor.availability && (
              <div className="p-4 rounded-2xl" style={{ background: '#f9f9f9' }}>
                <div className="flex items-center gap-2 mb-2">
                  <Clock size={16} color="#e91e8c" />
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a' }}>{tl('tailor_profile', 'availability')}</p>
                </div>
                <p style={{ fontSize: 13, color: '#555' }}>{tailor.availability}</p>
              </div>
            )}

            {/* Shop address */}
            {tailor.shop_address && (
              <div className="p-4 rounded-2xl" style={{ background: '#f9f9f9' }}>
                <div className="flex items-center gap-2 mb-2">
                  <MapPin size={16} color="#e91e8c" />
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a' }}>{tl('tailor_profile', 'shop_address')}</p>
                </div>
                <p style={{ fontSize: 13, color: '#555' }}>{tailor.shop_address}</p>
              </div>
            )}

            {/* Languages */}
            {tailor.languages && tailor.languages.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Globe size={16} color="#e91e8c" />
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a' }}>{tl('tailor_profile', 'languages')}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tailor.languages.map(lang => (
                    <span key={lang} className="px-3 py-1.5 rounded-xl"
                      style={{ background: '#e3f2fd', fontSize: 12, color: '#1565c0', fontWeight: 600 }}>
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Expertise */}
            {expertise.length > 0 && (
              <div>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a', marginBottom: 10 }}>{tl('tailor_profile', 'expertise')}</p>
                <div className="flex flex-wrap gap-2">
                  {expertise.map((e, i) => (
                    <span key={i} className="flex items-center gap-1 px-3 py-1.5 rounded-xl"
                      style={{ background: '#fce4ec', fontSize: 12, color: '#e91e8c', fontWeight: 600 }}>
                      <Check size={11} /> {e}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          /* Portfolio tab */
          <div>
            {portfolio.length > 0 ? (
              <>
                <div className="flex items-center gap-2 mb-3">
                  <Images size={16} color="#e91e8c" />
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a' }}>{tl('tailor_profile', 'previous_work')}</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {portfolio.map(item => (
                    <button
                      key={item.id}
                      onClick={() => setExpandedImage(expandedImage === item.id ? null : item.id)}
                      className="rounded-2xl overflow-hidden w-full text-left"
                      style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.image_url}
                        alt={item.caption || 'Portfolio image'}
                        className="w-full object-cover"
                        style={{ aspectRatio: '1/1' }}
                      />
                      {item.caption && (
                        <div className="px-3 py-2" style={{ background: 'white' }}>
                          <p style={{ fontSize: 11, color: '#555', lineHeight: 1.4 }}>{item.caption}</p>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <Images size={40} color="#ddd" className="mx-auto mb-3" />
                <p style={{ color: '#9e9e9e', fontSize: 14 }}>{tl('tailor_profile', 'no_portfolio')}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Expanded image overlay */}
      {expandedImage && (() => {
        const item = portfolio.find(p => p.id === expandedImage)
        if (!item) return null
        return (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.85)' }}
            onClick={() => setExpandedImage(null)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.image_url}
              alt={item.caption || 'Portfolio image'}
              className="max-w-full max-h-full rounded-2xl object-contain"
              onClick={e => e.stopPropagation()}
            />
            {item.caption && (
              <p className="absolute bottom-8 left-4 right-4 text-center text-white text-sm font-medium"
                style={{ textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}>
                {item.caption}
              </p>
            )}
          </div>
        )
      })()}

      {/* Action buttons — fixed at bottom */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-5 py-4 bg-white"
        style={{ borderTop: '1px solid #f0f0f0', boxShadow: '0 -4px 20px rgba(0,0,0,0.06)' }}>
        <div className="flex gap-2">
          {tailor.phone && (
            <a href={`tel:${tailor.phone}`}
              className="flex items-center justify-center gap-1.5 py-3 px-4 rounded-full font-semibold text-sm"
              style={{ border: '2px solid #e91e8c', color: '#e91e8c' }}>
              <Phone size={15} /> {tl('tailor_profile', 'call')}
            </a>
          )}
          <Link href={`/orders`}
            className="flex items-center justify-center gap-1.5 py-3 px-4 rounded-full font-semibold text-sm"
            style={{ border: '2px solid #e91e8c', color: '#e91e8c' }}>
            <MessageCircle size={15} /> {tl('orders', 'chat')}
          </Link>
          <Link
            href={`/booking/alterations?tailorId=${tailor.id}&tailorName=${encodeURIComponent(displayName)}`}
            className="flex items-center justify-center py-3 rounded-full text-white font-bold text-sm flex-1"
            style={{ background: 'linear-gradient(135deg, #e91e8c 0%, #f06292 100%)' }}>
            {tl('tailor_profile', 'book')}
          </Link>
        </div>
      </div>
    </div>
  )
}
