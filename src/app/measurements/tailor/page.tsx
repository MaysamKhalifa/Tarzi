'use client'

import { useState } from 'react'
import PageHeader from '@/components/layout/PageHeader'
import Link from 'next/link'
import { Calendar, Clock, MapPin, CheckCircle, Star } from 'lucide-react'
import { SAMPLE_TAILORS } from '@/lib/data/tailors'

const TIME_SLOTS = ['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '4:00 PM', '5:00 PM', '6:00 PM', '7:00 PM']

export default function MeasurementByTailorPage() {
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [selectedTailor, setSelectedTailor] = useState('')
  const [address, setAddress] = useState('')
  const [booked, setBooked] = useState(false)

  const handleBook = () => {
    if (!selectedDate || !selectedTime || !address) return
    setBooked(true)
  }

  if (booked) {
    return (
      <div className="min-h-dvh bg-white flex flex-col items-center justify-center px-6 text-center">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mb-5"
          style={{ background: '#e8f5e9' }}>
          <CheckCircle size={40} color="#4caf50" />
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: '#1a1a1a', marginBottom: 8 }}>Booking Confirmed!</h2>
        <p style={{ color: '#9e9e9e', fontSize: 14, lineHeight: 1.6, marginBottom: 28 }}>
          A tailor will visit you on <strong>{selectedDate}</strong> at <strong>{selectedTime}</strong>.
          You'll receive a confirmation shortly.
        </p>
        <Link href="/measurements"
          className="w-full py-4 rounded-full text-white font-bold text-base text-center block"
          style={{ background: 'linear-gradient(135deg, #e91e8c 0%, #f06292 100%)' }}>
          Back to Measurements
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
    <div className="min-h-dvh bg-white pb-8">
      <PageHeader title="Measurement by Tailor" subtitle="We come to you" />

      <div className="px-5 py-4 flex flex-col gap-5">
        {/* Info card */}
        <div className="p-4 rounded-2xl" style={{ background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)' }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: '#1a1a1a', marginBottom: 4 }}>🏠 Home Visit Service</p>
          <p style={{ fontSize: 12, color: '#555', lineHeight: 1.6 }}>
            Our experienced tailors will visit your home and take all your measurements professionally. Free for bookings over AED 200.
          </p>
        </div>

        {/* Select tailor (optional) */}
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, color: '#555', display: 'block', marginBottom: 8 }}>
            Preferred Tailor (optional)
          </label>
          <div className="flex flex-col gap-2">
            {SAMPLE_TAILORS.slice(0, 3).map(t => (
              <button key={t.id} onClick={() => setSelectedTailor(selectedTailor === t.id ? '' : t.id)}
                className="flex items-center gap-3 p-3 rounded-xl transition-all text-left"
                style={{
                  border: `2px solid ${selectedTailor === t.id ? '#e91e8c' : '#e8e8e8'}`,
                  background: selectedTailor === t.id ? '#fce4ec' : '#fafafa',
                }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: '#e91e8c' }}>
                  <span style={{ color: 'white', fontSize: 14, fontWeight: 700 }}>
                    {t.name.charAt(0)}
                  </span>
                </div>
                <div className="flex-1">
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#1a1a1a' }}>{t.name}</p>
                  <div className="flex items-center gap-1">
                    <Star size={11} color="#ffc107" fill="#ffc107" />
                    <span style={{ fontSize: 12, color: '#9e9e9e' }}>{t.rating} • {t.experience_years}yr exp</span>
                  </div>
                </div>
                {selectedTailor === t.id && <CheckCircle size={18} color="#e91e8c" />}
              </button>
            ))}
          </div>
        </div>

        {/* Date selection */}
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, color: '#555', display: 'block', marginBottom: 8 }}>
            <Calendar size={14} className="inline mr-1" /> Select Date *
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
            <Clock size={14} className="inline mr-1" /> Select Time *
          </label>
          <div className="grid grid-cols-3 gap-2">
            {TIME_SLOTS.map(t => (
              <button key={t} onClick={() => setSelectedTime(t)}
                className="py-2.5 rounded-xl text-sm font-semibold transition-all"
                style={{
                  border: `2px solid ${selectedTime === t ? '#e91e8c' : '#e8e8e8'}`,
                  background: selectedTime === t ? '#fce4ec' : '#fafafa',
                  color: selectedTime === t ? '#e91e8c' : '#555',
                }}>
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Address */}
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, color: '#555', display: 'block', marginBottom: 6 }}>
            <MapPin size={14} className="inline mr-1" /> Your Address *
          </label>
          <textarea value={address} onChange={e => setAddress(e.target.value)}
            placeholder="Villa 12, Street 5, Mirdif, Dubai"
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
          Book Measurement Visit
        </button>
      </div>
    </div>
  )
}
