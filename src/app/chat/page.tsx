'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { MessageCircle, Scissors, Sparkles, RefreshCw } from 'lucide-react'
import BottomNav from '@/components/layout/BottomNav'
import { createClient } from '@/lib/supabase/client'
import { useApp } from '@/lib/context/AppContext'
import { useLanguage } from '@/lib/context/LanguageContext'
import type { Order } from '@/types/database'

const SERVICE_ICONS = { alterations: Scissors, from_scratch: Sparkles, upcycling: RefreshCw }

function timeAgo(dateStr: string, t: ReturnType<typeof useLanguage>['t']) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const m = Math.floor(diff / 60000)
  const h = Math.floor(diff / 3600000)
  const d = Math.floor(diff / 86400000)
  if (m < 1) return t('chat', 'just_now')
  if (m < 60) return t('chat', 'min_ago').replace('{n}', String(m))
  if (h < 24) return t('chat', 'hr_ago').replace('{n}', String(h))
  return t('chat', 'day_ago').replace('{n}', String(d))
}

export default function ChatListPage() {
  const { user, loading: authLoading } = useApp()
  const { t, isRTL } = useLanguage()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return
    if (!user) { setLoading(false); return }

    const supabase = createClient()
    const safetyTimer = setTimeout(() => setLoading(false), 10000)

    Promise.resolve(
      supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .not('status', 'eq', 'delivered')
        .order('created_at', { ascending: false })
    )
      .then(({ data }) => {
        setOrders(data || [])
        setLoading(false)
      })
      .catch((err: unknown) => {
        console.error('Failed to load chats:', err)
        setLoading(false)
      })

    return () => clearTimeout(safetyTimer)
  }, [user, authLoading])

  return (
    <div className="min-h-dvh bg-white pb-24" dir={isRTL ? 'rtl' : undefined}>
      {/* Header */}
      <div className="px-5 pt-12 pb-5"
        style={{ background: 'linear-gradient(135deg, #e91e8c 0%, #f06292 100%)' }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: 'white' }}>{t('chat', 'title')}</h1>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 4 }}>
          {t('chat', 'subtitle')}
        </p>
      </div>

      <div className="px-5 py-4">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 rounded-full border-2 border-pink-200 border-t-pink-500 animate-spin" />
          </div>
        ) : !user ? (
          <div className="text-center py-16">
            <MessageCircle size={48} color="#e8e8e8" className="mx-auto mb-4" />
            <p style={{ fontSize: 16, fontWeight: 700, color: '#1a1a1a', marginBottom: 8 }}>
              {t('chat', 'sign_in_title')}
            </p>
            <Link href="/login"
              className="px-6 py-3 rounded-full text-white font-bold text-sm inline-block mt-2"
              style={{ background: 'linear-gradient(135deg, #e91e8c 0%, #f06292 100%)' }}>
              {t('chat', 'log_in')}
            </Link>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
              style={{ background: '#fce4ec' }}>
              <MessageCircle size={36} color="#e91e8c" />
            </div>
            <p style={{ fontSize: 17, fontWeight: 700, color: '#1a1a1a', marginBottom: 8 }}>
              {t('chat', 'no_chats')}
            </p>
            <p style={{ color: '#9e9e9e', fontSize: 13, maxWidth: 240 }}>
              {t('chat', 'no_chats_sub')}
            </p>
            <Link href="/home"
              className="mt-6 px-8 py-3 rounded-full text-white font-bold text-sm"
              style={{ background: 'linear-gradient(135deg, #e91e8c 0%, #f06292 100%)' }}>
              {t('chat', 'browse_services')}
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {orders.map(order => {
              const svc = order.service_type as keyof typeof SERVICE_ICONS
              const Icon = SERVICE_ICONS[svc] || Scissors
              return (
                <Link
                  key={order.id}
                  href={`/chat/${order.id}`}
                  className="flex items-center gap-3 p-4 rounded-2xl transition-all"
                  style={{
                    background: 'white',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.07)',
                    flexDirection: isRTL ? 'row-reverse' : 'row',
                  }}>
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{ background: '#fce4ec' }}>
                    <Icon size={20} color="#e91e8c" />
                  </div>
                  <div className="flex-1 min-w-0" style={{ textAlign: isRTL ? 'right' : 'left' }}>
                    <p style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a' }}>
                      {order.tailor_name || t('chat', 'pending_tailor')}
                    </p>
                    <p style={{ fontSize: 12, color: '#9e9e9e' }} className="truncate">
                      {order.garment_type} • #{order.order_number}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span style={{ fontSize: 11, color: '#bbb' }}>{timeAgo(order.created_at, t)}</span>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ background: '#fce4ec' }}>
                      <MessageCircle size={15} color="#e91e8c" />
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
