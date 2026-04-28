'use client'

import { useState, useEffect } from 'react'
import { MapPin, Plus, Check, Trash2, Home, Briefcase } from 'lucide-react'
import PageHeader from '@/components/layout/PageHeader'
import BottomNav from '@/components/layout/BottomNav'
import { createClient } from '@/lib/supabase/client'
import { useApp } from '@/lib/context/AppContext'
import type { UserAddress } from '@/types/database'

const DUBAI_AREAS = [
  'Mirdif', 'Al Khawaneej', 'Mizhar', 'Deira', 'Bur Dubai', 'Karama',
  'Jumeirah', 'Al Barsha', 'Dubai Marina', 'JBR', 'Business Bay',
  'Downtown Dubai', 'Dubai Hills', 'Arabian Ranches', 'Muhaisnah',
  'Al Quoz', 'Al Nahda', 'Rashidiya', 'Al Warqa', 'Nad Al Hamar'
]

export default function LocationPage() {
  const { user } = useApp()
  const [addresses, setAddresses] = useState<UserAddress[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    label: 'Home', fullName: '', phone: '', city: 'Dubai', area: '', street: '', isDefault: false
  })
  const [saving, setSaving] = useState(false)

  const fetchAddresses = async () => {
    if (!user) return
    const supabase = createClient()
    const { data } = await supabase.from('user_addresses').select('*').eq('user_id', user.id).order('is_default', { ascending: false })
    setAddresses(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchAddresses() }, [user])

  const handleSave = async () => {
    if (!user || !form.fullName || !form.area || !form.street) return
    setSaving(true)
    const supabase = createClient()
    await supabase.from('user_addresses').insert({
      user_id: user.id,
      label: form.label,
      full_name: form.fullName,
      phone: form.phone,
      city: form.city,
      area: form.area,
      street: form.street,
      is_default: form.isDefault,
    })
    await fetchAddresses()
    setSaving(false)
    setShowForm(false)
    setForm({ label: 'Home', fullName: '', phone: '', city: 'Dubai', area: '', street: '', isDefault: false })
  }

  const handleDelete = async (id: string) => {
    const supabase = createClient()
    await supabase.from('user_addresses').delete().eq('id', id)
    setAddresses(prev => prev.filter(a => a.id !== id))
  }

  const inputStyle = {
    border: '1.5px solid #e8e8e8', background: '#fafafa', borderRadius: 12,
    padding: '12px 14px', fontSize: 15, width: '100%', outline: 'none',
  }

  return (
    <div className="min-h-dvh bg-white pb-24">
      <PageHeader title="My Addresses" subtitle="Manage your pickup & delivery addresses" />

      <div className="px-5 py-4 flex flex-col gap-4">
        {/* Add button */}
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-3 rounded-2xl w-full transition-all"
          style={{ border: '2px dashed #e91e8c', background: showForm ? '#fce4ec' : 'transparent' }}>
          <Plus size={18} color="#e91e8c" />
          <span style={{ fontSize: 14, fontWeight: 600, color: '#e91e8c' }}>Add New Address</span>
        </button>

        {/* Add form */}
        {showForm && (
          <div className="p-4 rounded-2xl flex flex-col gap-3"
            style={{ background: '#f9f9f9' }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a' }}>New Address</p>

            {/* Label */}
            <div className="flex gap-2">
              {['Home', 'Work', 'Other'].map(l => (
                <button key={l} onClick={() => setForm(f => ({ ...f, label: l }))}
                  className="flex-1 py-2 rounded-xl text-sm font-semibold transition-all"
                  style={{
                    border: `2px solid ${form.label === l ? '#e91e8c' : '#e8e8e8'}`,
                    background: form.label === l ? '#fce4ec' : 'white',
                    color: form.label === l ? '#e91e8c' : '#555',
                  }}>
                  {l === 'Home' ? '🏠' : l === 'Work' ? '💼' : '📍'} {l}
                </button>
              ))}
            </div>

            <input type="text" value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
              placeholder="Full name *" style={inputStyle}
              onFocus={e => (e.target.style.borderColor = '#e91e8c')}
              onBlur={e => (e.target.style.borderColor = '#e8e8e8')}
            />
            <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              placeholder="Phone number" style={inputStyle}
              onFocus={e => (e.target.style.borderColor = '#e91e8c')}
              onBlur={e => (e.target.style.borderColor = '#e8e8e8')}
            />

            <select value={form.area} onChange={e => setForm(f => ({ ...f, area: e.target.value }))}
              style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }}>
              <option value="">Select area *</option>
              {DUBAI_AREAS.map(a => <option key={a} value={a}>{a}</option>)}
            </select>

            <input type="text" value={form.street} onChange={e => setForm(f => ({ ...f, street: e.target.value }))}
              placeholder="Street / Building / Villa *" style={inputStyle}
              onFocus={e => (e.target.style.borderColor = '#e91e8c')}
              onBlur={e => (e.target.style.borderColor = '#e8e8e8')}
            />

            <div className="flex items-center justify-between p-3 rounded-xl bg-white">
              <span style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a' }}>Set as default</span>
              <button onClick={() => setForm(f => ({ ...f, isDefault: !f.isDefault }))}
                className="w-11 h-6 rounded-full transition-all relative"
                style={{ background: form.isDefault ? '#e91e8c' : '#e0e0e0' }}>
                <span className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all"
                  style={{ left: form.isDefault ? '24px' : '2px', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
              </button>
            </div>

            <button onClick={handleSave} disabled={saving || !form.fullName || !form.area || !form.street}
              className="w-full py-3 rounded-full text-white font-bold text-sm"
              style={{ background: 'linear-gradient(135deg, #e91e8c 0%, #f06292 100%)' }}>
              {saving ? 'Saving...' : 'Save Address'}
            </button>
          </div>
        )}

        {/* Addresses list */}
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 rounded-full border-2 border-pink-200 border-t-pink-500 animate-spin" />
          </div>
        ) : addresses.length === 0 ? (
          <div className="text-center py-12">
            <MapPin size={40} color="#ddd" className="mx-auto mb-3" />
            <p style={{ color: '#9e9e9e', fontSize: 14 }}>No addresses saved</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {addresses.map(addr => (
              <div key={addr.id} className="flex items-start gap-3 p-4 rounded-2xl"
                style={{ background: 'white', boxShadow: '0 2px 10px rgba(0,0,0,0.07)' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: '#fce4ec' }}>
                  {addr.label === 'Home' ? <Home size={18} color="#e91e8c" /> :
                    addr.label === 'Work' ? <Briefcase size={18} color="#e91e8c" /> :
                      <MapPin size={18} color="#e91e8c" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a' }}>{addr.label}</p>
                    {addr.is_default && (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full"
                        style={{ background: '#e8f5e9', fontSize: 10, color: '#2e7d32', fontWeight: 700 }}>
                        <Check size={9} /> Default
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: 13, color: '#555' }}>{addr.full_name}</p>
                  <p style={{ fontSize: 12, color: '#9e9e9e' }}>{addr.street}, {addr.area}, {addr.city}</p>
                  {addr.phone && <p style={{ fontSize: 12, color: '#9e9e9e' }}>{addr.phone}</p>}
                </div>
                <button onClick={() => handleDelete(addr.id)}>
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
