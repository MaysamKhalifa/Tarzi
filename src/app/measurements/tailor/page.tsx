'use client'

import { useState, useEffect } from 'react'
import PageHeader from '@/components/layout/PageHeader'
import Link from 'next/link'
import { Calendar, Clock, MapPin, CheckCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useLanguage } from '@/lib/context/LanguageContext'
import TailorPicker, { type RealTailor } from '@/components/TailorPicker'

const TIME_SLOTS = ['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '4:00 PM', '5:00 PM', '6:00 PM', '7:00 PM']

export default function MeasurementByTailorPage() {
  const { t, isRTL } = useLanguage()
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [selectedTailor, setSelectedTailor] = useState('')
  const [address, setAddress] = useState('')
  const [booked, setBooked] = useState(false)
  const [tailors, setTailors] = useState<RealTailor[]>([])
  const [tailorsLoading, setTailorsLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('profiles')
      .select('id, full_name, shop_name, area, city, avatar_url')
      .eq('role', 'tailor')
      .eq('is_approved', true)
      .then(({ data, error }) => {
        if (error || !data || data.length === 0) {
          return supabase
            .from('profiles')
            .select('id, full_name, shop_name, area, city, avatar_url')
            .eq('role', 'tailor')
            .then(({ data: fallback }) => {
              setTailors((fallback as RealTailor[]) || [])
              setTailorsLoading(false)
            })
        }
        setTailors((data as RealTailor[]) || [])
        setTailorsLoading(false)
      })
  }, [])

  const handleBook = () => {
    if (!selectedDate || !selectedTime || !address) return
    setBooked(true)
  }

  if (booked) {
    return (
      <div className="min-h-dvh bg-white flex flex-col items-center justify-center px-6 text-center" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="w-20 h-20 rounded-full flex items-center justify-center mb-5"
          style={{ background: '#e8f5e9' }}>
          <CheckCircle size={40} color="#4caf50" />
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: '#1a1a1a', marginBottom: 8 }}>{t('measure_tailor', 'confirmed_title')}</h2>
        <p style={{ color: '#9e9e9e', fontSize: 14, lineHeight: 1.6, marginBottom: 28 }}>
          {t('measure_tailor', 'confirmed_msg').replace('{date}', selectedDate).replace('{time}', selectedTime)}
        </p>
        <Link href="/measurements"
          className="w-full py-4 rounded-full text-white font-bold text-base text-center block"
          style={{ background: 'linear-gradient(135deg, #e91e8c 0%, #f06292 100%)' }}>
          {t('measure_tailor', 'back_to_measurements')}
        </Link>
      </div>
    )
  }

  const today = new Date()
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() + i + 1)
    return d
  })

  const inputStyle = {
    border: '1.5px solid #e8e8e8', background: '#fafafa', borderRadius: 12,
    padding: '12px 14px', fontSize: 15, width: '100%', outline: 'none',
  }

  return (
    <div className="min-h-dvh bg-white pb-8" dir={isRTL ? 'rtl' : 'ltr'}>
      <PageHeader title={t('measure_tailor', 'title')} subtitle={t('measure_tailor', 'subtitle')} />

      <div className="px-5 py-4 flex flex-col gap-5">
        {/* Info card */}
        <div className="p-4 rounded-2xl" style={{ background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)' }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: '#1a1a1a', marginBottom: 4 }}>{t('measure_tailor', 'info_title')}</p>
          <p style={{ fontSize: 12, color: '#555', lineHeight: 1.6 }}>
            {t('measure_tailor', 'info_body')}
          </p>
        </div>

        {/* Select tailor (optional) — searchable dropdown */}
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, color: '#555', display: 'block', marginBottom: 8 }}>
            {t('measure_tailor', 'preferred_tailor')}
          </label>
          <TailorPicker
            value={selectedTailor}
            tailors={tailors}
            loading={tailorsLoading}
            onChange={(id) => setSelectedTailor(id)}
          />
        </div>

        {/* Date selection */}
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, color: '#555', display: 'block', marginBottom: 8 }}>
            <Calendar size={14} className="inline mr-1" /> {t('measure_tailor', 'select_date')}
          </label>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
            {dates.map(d => {
              const label = d.toLocaleDateString('en-AE', { weekday: 'short' })
              const day = d.getDate()
              const val = d.toISOString().split('T')[0]
              return (
                <button key={val} onClick={() => setSelectedDate(val)}
                  className="flex flex-col items-center p-3 rounded-xl flex-shrink-0 transition-all"
                  style={{
                    minWidth: 58,
                    border: `2px solid ${selectedDate === val ? '#e91e8c' : '#e8e8e8'}`,
                    background: selectedDate === val ? '#fce4ec' : '#fafafa',
                  }}>
                  <span style={{ fontSize: 11, color: selectedDate === val ? '#e91e8c' : '#9e9e9e', fontWeight: 600 }}>{label}</span>
                  <span style={{ fontSize: 18, fontWeight: 800, color: selectedDate === val ? '#e91e8c' : '#1a1a1a' }}>{day}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Time selection */}
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, color: '#555', display: 'block', marginBottom: 8 }}>
            <Clock size={14} className="inline mr-1" /> {t('measure_tailor', 'select_time')}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {TIME_SLOTS.map(slot => (
              <button key={slot} onClick={() => setSelectedTime(slot)}
                className="py-2.5 rounded-xl text-sm font-semibold transition-all"
                style={{
                  border: `2px solid ${selectedTime === slot ? '#e91e8c' : '#e8e8e8'}`,
                  background: selectedTime === slot ? '#fce4ec' : '#fafafa',
                  color: selectedTime === slot ? '#e91e8c' : '#555',
                }}>
                {slot}
              </button>
            ))}
          </div>
        </div>

        {/* Address */}
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, color: '#555', display: 'block', marginBottom: 6 }}>
            <MapPin size={14} className="inline mr-1" /> {t('measure_tailor', 'your_address')}
          </label>
          <textarea value={address} onChange={e => setAddress(e.target.value)}
            placeholder={t('measure_tailor', 'address_placeholder')}
            rows={3}
            style={{ ...inputStyle, resize: 'none' as const }}
            onFocus={e => (e.target.style.borderColor = '#e91e8c')}
            onBlur={e => (e.target.style.borderColor = '#e8e8e8')}
          />
        </div>

        <button onClick={handleBook}
          disabled={!selectedDate || !selectedTime || !address}
          className="w-full py-4 rounded-full text-white font-bold text-base transition-all"
          style={{
            background: (!selectedDate || !selectedTime || !address)
              ? '#f9a0c8'
              : 'linear-gradient(135deg, #e91e8c 0%, #f06292 100%)',
            boxShadow: '0 4px 15px rgba(233, 30, 140, 0.3)',
          }}>
          {t('measure_tailor', 'book_btn')}
        </button>
      </div>
    </div>
  )
}
