'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search, Bell, Scissors, RefreshCw, Sparkles, ChevronRight, Star, MapPin } from 'lucide-react'
import BottomNav from '@/components/layout/BottomNav'
import { useApp } from '@/lib/context/AppContext'
import { SAMPLE_TAILORS } from '@/lib/data/tailors'
import { useLanguage } from '@/lib/context/LanguageContext'

type Gender = 'male' | 'female'

export default function HomePage() {
  const { profile } = useApp()
  const { t } = useLanguage()
  const [gender, setGender] = useState<Gender>('female')
  const [search, setSearch] = useState('')

  const MALE_SERVICES = [
    { id: 'alterations', label: t('home', 'alterations'), icon: Scissors, color: '#e91e8c', bg: '#fce4ec', desc: t('home', 'alterations_desc') },
    { id: 'upcycling', label: t('home', 'upcycling'), icon: RefreshCw, color: '#7b1fa2', bg: '#f3e5f5', desc: t('home', 'upcycling_desc') },
    { id: 'from_scratch', label: t('home', 'from_scratch'), icon: Sparkles, color: '#f57c00', bg: '#fff3e0', desc: t('home', 'from_scratch_desc') },
  ]

  const FEMALE_SERVICES = [
    { id: 'alterations', label: t('home', 'alterations'), icon: Scissors, color: '#e91e8c', bg: '#fce4ec', desc: t('home', 'alterations_desc') },
    { id: 'upcycling', label: t('home', 'upcycling'), icon: RefreshCw, color: '#7b1fa2', bg: '#f3e5f5', desc: t('home', 'upcycling_desc') },
    { id: 'from_scratch', label: t('home', 'from_scratch'), icon: Sparkles, color: '#f57c00', bg: '#fff3e0', desc: t('home', 'from_scratch_desc') },
  ]

  const firstName = profile?.full_name?.split(' ')[0] || 'there'
  const services = gender === 'male' ? MALE_SERVICES : FEMALE_SERVICES
  const nearbyTailors = SAMPLE_TAILORS.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.location.toLowerCase().includes(search.toLowerCase())
  ).slice(0, 3)

  return (
    <div className="min-h-dvh bg-white pb-24">
      {/* Pink header */}
      <div className="px-5 pt-12 pb-6"
        style={{ background: 'linear-gradient(135deg, #e91e8c 0%, #f06292 100%)' }}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>{t('home', 'good_day')}</p>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: 'white' }}>{t('home', 'hello')}, {firstName}! 👋</h1>
          </div>
          <Link href="/profile"
            className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center relative">
            <Bell size={20} color="white" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-yellow-300"></span>
          </Link>
        </div>

        {/* Search bar */}
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t('home', 'search_placeholder')}
            className="w-full pl-11 pr-4 py-3 rounded-2xl text-sm outline-none"
            style={{ background: 'white', fontSize: 14 }}
          />
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2" color="#9e9e9e" />
        </div>
      </div>

      <div className="px-5 py-5 flex flex-col gap-6">
        {/* Gender selector */}
        <div>
          <div className="flex p-1 rounded-2xl gap-1" style={{ background: '#f5f5f5' }}>
            {(['female', 'male'] as Gender[]).map(g => (
              <button key={g} onClick={() => setGender(g)}
                className="flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all capitalize"
                style={{
                  background: gender === g ? 'white' : 'transparent',
                  color: gender === g ? '#e91e8c' : '#9e9e9e',
                  boxShadow: gender === g ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                }}>
                {g === 'female' ? t('home', 'female') : t('home', 'male')}
              </button>
            ))}
          </div>
        </div>

        {/* Services grid */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 style={{ fontSize: 17, fontWeight: 700, color: '#1a1a1a' }}>{t('home', 'services_title')}</h2>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {services.map(svc => {
              const Icon = svc.icon
              return (
                <Link key={svc.id} href={`/booking/${svc.id}?gender=${gender}`}
                  className="flex flex-col items-center p-4 rounded-2xl text-center transition-all"
                  style={{ background: svc.bg, border: `2px solid transparent` }}>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-2"
                    style={{ background: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                    <Icon size={22} color={svc.color} />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#1a1a1a' }}>{svc.label}</span>
                  <span style={{ fontSize: 10, color: '#757575', marginTop: 2, lineHeight: 1.3 }}>{svc.desc}</span>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Measurements CTA */}
        <Link href="/measurements"
          className="flex items-center gap-4 p-4 rounded-2xl"
          style={{ background: 'linear-gradient(135deg, #fce4ec 0%, #f8bbd0 100%)' }}>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ background: '#e91e8c' }}>
            <Scissors size={22} color="white" />
          </div>
          <div className="flex-1">
            <p style={{ fontSize: 15, fontWeight: 700, color: '#1a1a1a' }}>My Measurements</p>
            <p style={{ fontSize: 12, color: '#757575' }}>Save your measurements for quick booking</p>
          </div>
          <ChevronRight size={18} color="#e91e8c" />
        </Link>

        {/* Nearby tailors */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 style={{ fontSize: 17, fontWeight: 700, color: '#1a1a1a' }}>{t('home', 'nearby_title')}</h2>
            <Link href="/tailors" style={{ fontSize: 13, color: '#e91e8c', fontWeight: 600 }}>
              {t('home', 'view_all')}
            </Link>
          </div>
          <div className="flex flex-col gap-3">
            {nearbyTailors.map(tailor => (
              <Link key={tailor.id} href={`/tailors/${tailor.id}`}
                className="flex items-center gap-3 p-4 rounded-2xl"
                style={{ background: 'white', boxShadow: '0 2px 10px rgba(0,0,0,0.07)' }}>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #fce4ec 0%, #f8bbd0 100%)' }}>
                  <Scissors size={24} color="#e91e8c" />
                </div>
                <div className="flex-1 min-w-0">
                  <p style={{ fontSize: 15, fontWeight: 700, color: '#1a1a1a' }}>{tailor.name}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <MapPin size={12} color="#9e9e9e" />
                    <span style={{ fontSize: 12, color: '#9e9e9e' }}>{tailor.location}</span>
                    <span style={{ fontSize: 12, color: '#bbb' }}>•</span>
                    <span style={{ fontSize: 12, color: '#9e9e9e' }}>{tailor.distance_km < 1 ? `${tailor.distance_km * 1000}m` : `${tailor.distance_km}km`}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center gap-0.5">
                      <Star size={11} color="#ffc107" fill="#ffc107" />
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#1a1a1a' }}>{tailor.rating}</span>
                    </div>
                    <span style={{ fontSize: 11, color: '#9e9e9e' }}>({tailor.review_count} reviews)</span>
                    <span className="text-xs px-2 py-0.5 rounded-full"
                      style={{ background: '#e8f5e9', color: '#2e7d32', fontSize: 10, fontWeight: 600 }}>
                      {tailor.experience_years}yr exp
                    </span>
                  </div>
                </div>
                <ChevronRight size={16} color="#9e9e9e" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
