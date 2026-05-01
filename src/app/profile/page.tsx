'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  User, Bell, Package, Heart, CreditCard, Settings,
  HelpCircle, FileText, LogOut, ChevronRight, Camera, Edit3,
  X, MapPin
} from 'lucide-react'
import BottomNav from '@/components/layout/BottomNav'
import { useApp } from '@/lib/context/AppContext'
import { createClient } from '@/lib/supabase/client'

type ModalType = 'notifications' | 'payment' | 'settings' | 'help' | 'terms' | null

export default function ProfilePage() {
  const router = useRouter()
  const { user, profile, refreshProfile } = useApp()
  const [editingName, setEditingName] = useState(false)
  const [newName, setNewName] = useState(profile?.full_name || '')
  const [saving, setSaving] = useState(false)
  const [activeModal, setActiveModal] = useState<ModalType>(null)

  const handleLogout = async () => {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
    } catch {
      // ignore errors — still redirect
    }
    // Hard redirect to clear all client-side state
    window.location.href = '/login'
  }

  const handleSaveName = async () => {
    if (!user || !newName.trim()) return
    setSaving(true)
    const supabase = createClient()
    await supabase.from('profiles').update({ full_name: newName }).eq('id', user.id)
    await refreshProfile()
    setSaving(false)
    setEditingName(false)
  }

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.charAt(0).toUpperCase() || 'U'

  const MENU_SECTIONS = [
    {
      title: 'Account',
      items: [
        { icon: Bell, label: 'Notifications', action: () => setActiveModal('notifications') },
        { icon: Package, label: 'Order History', href: '/orders' },
        { icon: Heart, label: 'Saved Tailors', href: '/saved-tailors' },
        { icon: MapPin, label: 'My Addresses', href: '/location' },
      ],
    },
    {
      title: 'Payments',
      items: [
        { icon: CreditCard, label: 'Payment & Refunds', action: () => setActiveModal('payment') },
      ],
    },
    {
      title: 'Support',
      items: [
        { icon: Settings, label: 'Settings', action: () => setActiveModal('settings') },
        { icon: HelpCircle, label: 'Help & Support', action: () => setActiveModal('help') },
        { icon: FileText, label: 'Terms & Conditions', action: () => setActiveModal('terms') },
      ],
    },
  ]

  const MODAL_CONTENT: Record<NonNullable<ModalType>, { title: string; content: React.ReactNode }> = {
    notifications: {
      title: 'Notifications',
      content: (
        <div className="flex flex-col gap-4">
          {[
            { label: 'Order updates', desc: 'Get notified when your order status changes', on: true },
            { label: 'Tailor messages', desc: 'Receive chat messages from your tailor', on: true },
            { label: 'Promotions', desc: 'Special offers and discounts', on: false },
            { label: 'App news', desc: 'New features and updates', on: false },
          ].map(item => (
            <div key={item.label} className="flex items-center justify-between p-4 rounded-2xl" style={{ background: '#f9f9f9' }}>
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: '#1a1a1a' }}>{item.label}</p>
                <p style={{ fontSize: 12, color: '#9e9e9e' }}>{item.desc}</p>
              </div>
              <div className="w-12 h-6 rounded-full relative transition-all" style={{ background: item.on ? '#e91e8c' : '#e0e0e0' }}>
                <span className="absolute top-0.5 w-5 h-5 rounded-full bg-white" style={{ left: item.on ? '26px' : '2px', transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
              </div>
            </div>
          ))}
          <p style={{ fontSize: 11, color: '#bbb', textAlign: 'center' }}>Push notifications coming soon in the mobile app</p>
        </div>
      ),
    },
    payment: {
      title: 'Payment & Refunds',
      content: (
        <div className="flex flex-col gap-4">
          <div className="p-4 rounded-2xl" style={{ background: '#fce4ec' }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#e91e8c', marginBottom: 4 }}>💳 Cash on Pickup</p>
            <p style={{ fontSize: 13, color: '#555' }}>Currently we support cash payment when the tailor picks up or delivers your garment.</p>
          </div>
          <div className="p-4 rounded-2xl" style={{ background: '#f9f9f9' }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a', marginBottom: 4 }}>Refund Policy</p>
            <p style={{ fontSize: 13, color: '#555', lineHeight: 1.6 }}>If you are unsatisfied with the work, contact your tailor within 48 hours of delivery. Refunds are handled case-by-case.</p>
          </div>
          <div className="p-4 rounded-2xl" style={{ background: '#f9f9f9' }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a', marginBottom: 4 }}>Coming Soon</p>
            <p style={{ fontSize: 13, color: '#555' }}>Credit/debit card payments via secure gateway — available in v2.0</p>
          </div>
        </div>
      ),
    },
    settings: {
      title: 'Settings',
      content: (
        <div className="flex flex-col gap-3">
          {[
            { label: 'Language', value: 'English' },
            { label: 'Currency', value: 'AED (د.إ)' },
            { label: 'Region', value: 'Dubai, UAE' },
            { label: 'App Version', value: 'v1.0.0' },
          ].map(s => (
            <div key={s.label} className="flex justify-between items-center p-4 rounded-2xl" style={{ background: '#f9f9f9' }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#1a1a1a' }}>{s.label}</span>
              <span style={{ fontSize: 13, color: '#9e9e9e' }}>{s.value}</span>
            </div>
          ))}
          <div className="p-4 rounded-2xl" style={{ background: '#fff3e0' }}>
            <p style={{ fontSize: 13, color: '#f57c00' }}>More settings available in the mobile app</p>
          </div>
        </div>
      ),
    },
    help: {
      title: 'Help & Support',
      content: (
        <div className="flex flex-col gap-4">
          {[
            { q: 'How do I book a tailor?', a: 'Browse services on the Home page, select a service, choose your garment type and tailor, then add to bag and checkout.' },
            { q: 'How does pickup work?', a: 'During checkout, select a pickup date, time, and address. The tailor will arrive to collect your garment.' },
            { q: 'Can I track my order?', a: 'Yes — go to Orders to see your order status, or use the Delivery page for step-by-step tracking.' },
            { q: 'How do I contact my tailor?', a: 'Once an order is placed, tap "Chat" on the order card to message your tailor directly.' },
            { q: 'Is my data safe?', a: 'Absolutely. All data is stored securely on Supabase with row-level security and encrypted auth.' },
          ].map(({ q, a }) => (
            <div key={q} className="p-4 rounded-2xl" style={{ background: '#f9f9f9' }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a', marginBottom: 4 }}>❓ {q}</p>
              <p style={{ fontSize: 13, color: '#555', lineHeight: 1.6 }}>{a}</p>
            </div>
          ))}
          <div className="p-4 rounded-2xl" style={{ background: '#fce4ec' }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#e91e8c', marginBottom: 2 }}>Still need help?</p>
            <p style={{ fontSize: 13, color: '#555' }}>Email us at <strong>support@tarzi.ae</strong></p>
          </div>
        </div>
      ),
    },
    terms: {
      title: 'Terms & Conditions',
      content: (
        <div className="flex flex-col gap-4">
          {[
            { title: '1. Service Agreement', text: 'Tarzi connects users with independent tailors. Tarzi is a platform and not directly responsible for the quality of tailoring work.' },
            { title: '2. User Responsibilities', text: 'You agree to provide accurate measurements, clear descriptions, and be available at the selected pickup time.' },
            { title: '3. Tailor Responsibilities', text: 'Tailors listed on Tarzi are vetted and agree to deliver work to the agreed standard within the agreed timeline.' },
            { title: '4. Payments', text: 'All prices shown are estimates. Final pricing is agreed between the user and tailor. Tarzi does not process payments at this time.' },
            { title: '5. Privacy', text: 'Your personal data is stored securely and never shared with third parties without consent. See our Privacy Policy for details.' },
            { title: '6. Changes', text: 'Tarzi reserves the right to update these terms at any time. Continued use of the app constitutes acceptance.' },
          ].map(({ title, text }) => (
            <div key={title} className="p-4 rounded-2xl" style={{ background: '#f9f9f9' }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a', marginBottom: 4 }}>{title}</p>
              <p style={{ fontSize: 13, color: '#555', lineHeight: 1.6 }}>{text}</p>
            </div>
          ))}
          <p style={{ fontSize: 11, color: '#bbb', textAlign: 'center' }}>Last updated: April 2025 • Tarzi App</p>
        </div>
      ),
    },
  }

  return (
    <div className="min-h-dvh bg-white pb-24">
      {/* Pink header */}
      <div className="px-5 pt-12 pb-16" style={{ background: 'linear-gradient(135deg, #e91e8c 0%, #f06292 100%)' }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: 'white' }}>Profile</h1>
      </div>

      {/* Profile card */}
      <div className="px-5 -mt-10 mb-4">
        <div className="p-5 rounded-2xl bg-white" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.10)' }}>
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #e91e8c 0%, #f06292 100%)' }}>
                <span style={{ fontSize: 22, fontWeight: 800, color: 'white' }}>{initials}</span>
              </div>
              <button className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white flex items-center justify-center"
                style={{ boxShadow: '0 2px 6px rgba(0,0,0,0.15)' }}>
                <Camera size={12} color="#e91e8c" />
              </button>
            </div>
            <div className="flex-1 min-w-0">
              {editingName ? (
                <div className="flex items-center gap-2">
                  <input value={newName} onChange={e => setNewName(e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-lg text-sm outline-none min-w-0"
                    style={{ border: '1.5px solid #e91e8c', fontSize: 14 }} autoFocus />
                  <button onClick={handleSaveName} disabled={saving}
                    className="px-3 py-1.5 rounded-lg text-white text-xs font-bold flex-shrink-0"
                    style={{ background: '#e91e8c' }}>
                    {saving ? '...' : 'Save'}
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <p style={{ fontSize: 17, fontWeight: 700, color: '#1a1a1a' }} className="truncate">
                    {profile?.full_name || 'Set your name'}
                  </p>
                  <button onClick={() => { setNewName(profile?.full_name || ''); setEditingName(true) }}>
                    <Edit3 size={14} color="#9e9e9e" />
                  </button>
                </div>
              )}
              <p style={{ fontSize: 13, color: '#9e9e9e' }} className="truncate">{user?.email}</p>
              {profile?.phone && <p style={{ fontSize: 12, color: '#bbb' }}>{profile.phone}</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Menu sections */}
      <div className="px-5 flex flex-col gap-4">
        {MENU_SECTIONS.map(section => (
          <div key={section.title}>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#9e9e9e', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
              {section.title}
            </p>
            <div className="rounded-2xl overflow-hidden" style={{ background: 'white', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
              {section.items.map((item, i) => {
                const Icon = item.icon
                const rowStyle = { borderBottom: i < section.items.length - 1 ? '1px solid #f5f5f5' : 'none' }
                const rowClass = "flex items-center gap-3 px-4 py-3.5 w-full text-left transition-all hover:bg-gray-50"
                const inner = (
                  <>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#fce4ec' }}>
                      <Icon size={16} color="#e91e8c" />
                    </div>
                    <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: '#1a1a1a' }}>{item.label}</span>
                    <ChevronRight size={16} color="#bbb" />
                  </>
                )
                if ('href' in item && item.href) {
                  return (
                    <Link key={item.label} href={item.href} className={rowClass} style={rowStyle}>
                      {inner}
                    </Link>
                  )
                }
                return (
                  <button key={item.label} onClick={'action' in item ? item.action : undefined}
                    className={rowClass} style={rowStyle}>
                    {inner}
                  </button>
                )
              })}
            </div>
          </div>
        ))}

        {/* Logout */}
        <button onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3.5 rounded-2xl w-full transition-all hover:bg-red-50"
          style={{ background: '#fff0f0', border: '1px solid #ffcdd2' }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#ffebee' }}>
            <LogOut size={16} color="#f44336" />
          </div>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#f44336' }}>Logout</span>
        </button>

        <p style={{ textAlign: 'center', fontSize: 12, color: '#bbb', marginTop: 4 }}>
          Tarzi v1.0.0 • Made with ❤️ in Dubai
        </p>
      </div>

      <BottomNav />

      {/* Modal overlay */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ background: 'rgba(0,0,0,0.4)' }}
          onClick={() => setActiveModal(null)}>
          <div className="w-full max-w-[430px] bg-white rounded-t-3xl max-h-[80dvh] overflow-y-auto"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 sticky top-0 bg-white border-b border-gray-100">
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1a1a1a' }}>
                {MODAL_CONTENT[activeModal].title}
              </h2>
              <button onClick={() => setActiveModal(null)} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: '#f5f5f5' }}>
                <X size={16} color="#555" />
              </button>
            </div>
            <div className="px-5 py-4 pb-8">
              {MODAL_CONTENT[activeModal].content}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
