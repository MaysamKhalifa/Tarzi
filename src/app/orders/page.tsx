'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Package, MessageCircle, Clock, CheckCircle, Truck, XCircle, Scissors, RefreshCw, Sparkles } from 'lucide-react'
import BottomNav from '@/components/layout/BottomNav'
import PageHeader from '@/components/layout/PageHeader'
import { createClient } from '@/lib/supabase/client'
import { useApp } from '@/lib/context/AppContext'
import { useLanguage } from '@/lib/context/LanguageContext'
import type { Order } from '@/types/database'

type Tab = 'in_progress' | 'done'

const STATUS_CONFIG = {
  pending:     { label: 'Pending',     color: '#f57c00', bg: '#fff3e0', icon: Clock },
  confirmed:   { label: 'Confirmed',   color: '#1565c0', bg: '#e3f2fd', icon: CheckCircle },
  accepted:    { label: 'Accepted',    color: '#2e7d32', bg: '#e8f5e9', icon: CheckCircle },
  in_progress: { label: 'In Progress', color: '#7b1fa2', bg: '#f3e5f5', icon: Scissors },
  ready:       { label: 'Ready',       color: '#2e7d32', bg: '#e8f5e9', icon: CheckCircle },
  delivered:   { label: 'Delivered',   color: '#2e7d32', bg: '#e8f5e9', icon: Truck },
  cancelled:   { label: 'Cancelled',   color: '#d32f2f', bg: '#fff0f0', icon: XCircle },
  declined:    { label: 'Declined',    color: '#d32f2f', bg: '#fff0f0', icon: XCircle },
}

const SERVICE_ICONS = { alterations: Scissors, from_scratch: Sparkles, upcycling: RefreshCw }

export default function OrdersPage() {
  // Pull both user AND the auth-loading flag from context
  const { user, loading: authLoading } = useApp()
  const { t } = useLanguage()
  const [orders, setOrders] = useState<Order[]>([])
  const [ordersLoading, setOrdersLoading] = useState(true)
  const [fetchError, setFetchError] = useState('')
  const [tab, setTab] = useState<Tab>('in_progress')

  useEffect(() => {
    if (authLoading) return
    if (!user) { setOrdersLoading(false); return }

    setOrdersLoading(true)
    setFetchError('')

    const supabase = createClient()

    const loadOrders = () => {
      supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .then(({ data, error }) => {
          if (error) {
            console.error('Orders fetch error:', error)
            setFetchError(error.message)
          } else {
            setOrders(data || [])
          }
          setOrdersLoading(false)
        })
    }

    loadOrders()

    // Realtime: update individual orders when tailor changes status/price
    const channel = supabase
      .channel(`customer-orders:${user.id}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'orders',
        filter: `user_id=eq.${user.id}`,
      }, payload => {
        setOrders(prev =>
          prev.map(o => o.id === (payload.new as Order).id ? (payload.new as Order) : o)
        )
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [user?.id, authLoading])

  const doneStatuses = ['delivered', 'cancelled', 'declined']
  const inProgress = orders.filter(o => !doneStatuses.includes(o.status))
  const done       = orders.filter(o =>  doneStatuses.includes(o.status))
  const displayed  = tab === 'in_progress' ? inProgress : done

  return (
    <div className="min-h-dvh bg-white pb-24">
      {/* Pink header */}
      <div className="px-5 pt-12 pb-5"
        style={{ background: 'linear-gradient(135deg, #e91e8c 0%, #f06292 100%)' }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: 'white', marginBottom: 12 }}>
          {t('orders', 'title')}
        </h1>
        <div className="flex gap-1 p-1 rounded-2xl" style={{ background: 'rgba(255,255,255,0.2)' }}>
          {([['in_progress', t('orders', 'in_progress')], ['done', t('orders', 'done')]] as [Tab, string][]).map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)}
              className="flex-1 py-2 rounded-xl text-sm font-semibold transition-all"
              style={{
                background: tab === key ? 'white' : 'transparent',
                color: tab === key ? '#e91e8c' : 'rgba(255,255,255,0.8)',
              }}>
              {label} ({key === 'in_progress' ? inProgress.length : done.length})
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 py-4">
        {/* Auth loading — wait for user session */}
        {(authLoading || ordersLoading) ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-10 h-10 rounded-full border-2 border-pink-200 border-t-pink-500 animate-spin" />
            <p style={{ fontSize: 13, color: '#9e9e9e' }}>Loading your orders…</p>
          </div>
        ) : !user ? (
          /* Not logged in */
          <div className="text-center py-16">
            <Package size={48} color="#e8e8e8" className="mx-auto mb-4" />
            <p style={{ fontSize: 16, fontWeight: 700, color: '#1a1a1a', marginBottom: 8 }}>
              Sign in to view orders
            </p>
            <p style={{ color: '#9e9e9e', fontSize: 13, marginBottom: 20 }}>
              Your orders will appear here once you log in
            </p>
            <Link href="/login"
              className="px-6 py-3 rounded-full text-white font-bold text-sm inline-block"
              style={{ background: 'linear-gradient(135deg, #e91e8c 0%, #f06292 100%)' }}>
              Log In
            </Link>
          </div>
        ) : fetchError ? (
          /* Fetch error */
          <div className="text-center py-12">
            <div className="px-4 py-3 rounded-xl mb-4 text-sm"
              style={{ background: '#fff0f0', color: '#d32f2f', border: '1px solid #ffcdd2' }}>
              ⚠️ Could not load orders: {fetchError}
            </div>
            <button
              onClick={() => {
                setOrdersLoading(true)
                setFetchError('')
                const supabase = createClient()
                supabase
                  .from('orders')
                  .select('*')
                  .eq('user_id', user!.id)
                  .order('created_at', { ascending: false })
                  .then(({ data, error }) => {
                    if (error) setFetchError(error.message)
                    else setOrders(data || [])
                    setOrdersLoading(false)
                  })
              }}
              className="px-6 py-2.5 rounded-full text-white font-semibold text-sm"
              style={{ background: '#e91e8c' }}>
              Try Again
            </button>
          </div>
        ) : displayed.length === 0 ? (
          /* No orders in this tab */
          <div className="text-center py-16">
            <Package size={48} color="#e8e8e8" className="mx-auto mb-4" />
            <p style={{ fontSize: 16, fontWeight: 700, color: '#1a1a1a', marginBottom: 8 }}>
              {tab === 'in_progress' ? t('orders', 'no_active') : t('orders', 'no_done')}
            </p>
            <p style={{ color: '#9e9e9e', fontSize: 13, marginBottom: 20 }}>
              {tab === 'in_progress' ? t('orders', 'no_active_sub') : t('orders', 'no_done_sub')}
            </p>
            {tab === 'in_progress' && (
              <Link href="/home"
                className="px-6 py-3 rounded-full text-white font-bold text-sm inline-block"
                style={{ background: 'linear-gradient(135deg, #e91e8c 0%, #f06292 100%)' }}>
                {t('orders', 'book_now')}
              </Link>
            )}
          </div>
        ) : (
          /* Order cards */
          <div className="flex flex-col gap-3">
            {displayed.map(order => {
              const StatusCfg = STATUS_CONFIG[order.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending
              const StatusIcon = StatusCfg.icon
              const svc = order.service_type as keyof typeof SERVICE_ICONS
              const ServiceIcon = SERVICE_ICONS[svc] || Scissors

              return (
                <div key={order.id} className="p-4 rounded-2xl"
                  style={{ background: 'white', boxShadow: '0 2px 10px rgba(0,0,0,0.07)' }}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ background: '#fce4ec' }}>
                        <ServiceIcon size={18} color="#e91e8c" />
                      </div>
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a' }}>{order.garment_type}</p>
                        <p style={{ fontSize: 11, color: '#9e9e9e' }}>{order.order_number}</p>
                      </div>
                    </div>
                    <span className="flex items-center gap-1 px-2.5 py-1 rounded-xl"
                      style={{ background: StatusCfg.bg, fontSize: 11, fontWeight: 600, color: StatusCfg.color }}>
                      <StatusIcon size={11} />
                      {StatusCfg.label}
                    </span>
                  </div>

                  <div style={{ fontSize: 12, color: '#555' }} className="flex flex-col gap-1 mb-3">
                    <span>🧵 {order.service_type.replace('_', ' ')} • {order.tailor_name || 'Pending assignment'}</span>
                    {order.pickup_date && (
                      <span>📅 Pickup: {new Date(order.pickup_date).toLocaleDateString('en-AE', { weekday: 'short', month: 'short', day: 'numeric' })} at {order.pickup_time}</span>
                    )}
                    {order.tailor_price
                      ? <span>💰 AED {order.tailor_price} <span style={{ color: '#9e9e9e' }}>(confirmed by tailor)</span></span>
                      : order.price ? <span>💰 AED {order.price}</span> : null}
                    {order.tailor_note && (
                      <span style={{ background: '#e8f5e9', color: '#2e7d32', padding: '4px 8px', borderRadius: 6, marginTop: 2 }}>
                        💬 Tailor note: {order.tailor_note}
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Link href={`/chat/${order.id}`}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold"
                      style={{ background: '#fce4ec', color: '#e91e8c' }}>
                      <MessageCircle size={14} /> {t('orders', 'chat')}
                    </Link>
                    <Link href={`/delivery?orderId=${order.id}`}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold"
                      style={{ background: '#f9f9f9', color: '#555' }}>
                      <Truck size={14} /> {t('orders', 'track')}
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
