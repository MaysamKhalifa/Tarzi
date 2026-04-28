'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  User, Bell, Package, Heart, CreditCard, Settings,
  HelpCircle, FileText, LogOut, ChevronRight, Camera, Edit3
} from 'lucide-react'
import BottomNav from '@/components/layout/BottomNav'
import { useApp } from '@/lib/context/AppContext'
import { createClient } from '@/lib/supabase/client'

const MENU_SECTIONS = [
  {
    title: 'Account',
    items: [
      { icon: Bell, label: 'Notifications', href: '#' },
      { icon: Package, label: 'Order History', href: '/orders' },
      { icon: Heart, label: 'Saved Tailors', href: '/tailors' },
      { icon: User, label: 'My Addresses', href: '/location' },
    ]
  },
  {
    title: 'Payments',
    items: [
      { icon: CreditCard, label: 'Payment & Refunds', href: '#' },
    ]
  },
  {
    title: 'Support',
    items: [
      { icon: Settings, label: 'Settings', href: '#' },
      { icon: HelpCircle, label: 'Help & Support', href: '#' },
      { icon: FileText, label: 'Terms & Conditions', href: '#' },
    ]
  }
]

export default function ProfilePage() {
  const router = useRouter()
  const { user, profile, refreshProfile } = useApp()
  const [editingName, setEditingName] = useState(false)
  const [newName, setNewName] = useState(profile?.full_name || '')
  const [saving, setSaving] = useState(false)

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
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

  return (
    <div className="min-h-dvh bg-white pb-24">
      {/* Pink header */}
      <div className="px-5 pt-12 pb-16"
        style={{ background: 'linear-gradient(135deg, #e91e8c 0%, #f06292 100%)' }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: 'white' }}>Profile</h1>
      </div>

      {/* Profile card - overlapping header */}
      <div className="px-5 -mt-10 mb-4">
        <div className="p-5 rounded-2xl bg-white"
          style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.10)' }}>
          <div className="flex items-center gap-4">
            {/* Avatar */}
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

            {/* Name & email */}
            <div className="flex-1">
              {editingName ? (
                <div className="flex items-center gap-2">
                  <input
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-lg text-sm outline-none"
                    style={{ border: '1.5px solid #e91e8c', fontSize: 14 }}
                    autoFocus
                  />
                  <button onClick={handleSaveName} disabled={saving}
                    className="px-3 py-1.5 rounded-lg text-white text-xs font-bold"
                    style={{ background: '#e91e8c' }}>
                    {saving ? '...' : 'Save'}
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <p style={{ fontSize: 17, fontWeight: 700, color: '#1a1a1a' }}>
                    {profile?.full_name || 'Set your name'}
                  </p>
                  <button onClick={() => { setNewName(profile?.full_name || ''); setEditingName(true) }}>
                    <Edit3 size={14} color="#9e9e9e" />
                  </button>
                </div>
              )}
              <p style={{ fontSize: 13, color: '#9e9e9e' }}>{user?.email}</p>
              {profile?.phone && (
                <p style={{ fontSize: 12, color: '#bbb' }}>{profile.phone}</p>
              )}
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
                return (
                  <Link key={item.label} href={item.href}
                    className="flex items-center gap-3 px-4 py-3.5 transition-all"
                    style={{
                      borderBottom: i < section.items.length - 1 ? '1px solid #f5f5f5' : 'none',
                    }}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                      style={{ background: '#fce4ec' }}>
                      <Icon size={16} color="#e91e8c" />
                    </div>
                    <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: '#1a1a1a' }}>{item.label}</span>
                    <ChevronRight size={16} color="#bbb" />
                  </Link>
                )
              })}
            </div>
          </div>
        ))}

        {/* Logout */}
        <button onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3.5 rounded-2xl w-full transition-all"
          style={{ background: '#fff0f0', border: '1px solid #ffcdd2' }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: '#ffebee' }}>
            <LogOut size={16} color="#f44336" />
          </div>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#f44336' }}>Logout</span>
        </button>

        {/* App version */}
        <p style={{ textAlign: 'center', fontSize: 12, color: '#bbb', marginTop: 4 }}>
          Tarzi v1.0.0 • Made with ❤️ in Dubai
        </p>
      </div>

      <BottomNav />
    </div>
  )
}
