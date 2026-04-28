'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Truck, Package, CheckCircle, Clock, Scissors, MapPin } from 'lucide-react'
import PageHeader from '@/components/layout/PageHeader'
import BottomNav from '@/components/layout/BottomNav'
import { createClient } from '@/lib/supabase/client'
import { useApp } from '@/lib/context/AppContext'
import type { Order } from '@/types/database'

const STEPS = [
  { key: 'pending', label: 'Order Placed', icon: Package, desc: 'Your order has been received' },
  { key: 'confirmed', label: 'Tailor Confirmed', icon: CheckCircle, desc: 'Tailor has accepted your order' },
  { key: 'in_progress', label: 'In Progress', icon: Scissors, desc: 'Your item is being worked on' },
  { key: 'ready', label: 'Ready for Pickup', icon: CheckCircle, desc: 'Item ready — pickup scheduled' },
  { key: 'delivered', label: 'Delivered', icon: Truck, desc: 'Your order has been delivered' },
]

const STATUS_ORDER = ['pending', 'confirmed', 'in_progress', 'ready', 'delivered']

function DeliveryContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')
  const { user } = useApp()
  const [orders, setOrders] = useState<Order[]>([])
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const supabase = createClient()
    supabase.from('orders').select('*').eq('user_id', user.id)
      .not('status', 'eq', 'cancelled')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        const list = data || []
        setOrders(list)
        if (orderId) {
          setSelectedOrder(list.find(o => o.id === orderId) || list[0] || null)
        } else {
          setSelectedOrder(list[0] || null)
        }
        setLoading(false)
      })
  }, [user, orderId])

  const currentStepIndex = selectedOrder
    ? STATUS_ORDER.indexOf(selectedOrder.status)
    : -1

  return (
    <div className="min-h-dvh bg-white pb-24">
      <div className="px-5 pt-12 pb-5"
        style={{ background: 'linear-gradient(135deg, #e91e8c 0%, #f06292 100%)' }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: 'white', marginBottom: 4 }}>Delivery Tracking</h1>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13 }}>Track your orders in real-time</p>
      </div>

      <div className="px-5 py-4 flex flex-col gap-4">
        {/* Order selector */}
        {orders.length > 1 && (
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#555', display: 'block', marginBottom: 8 }}>
              Select Order
            </label>
            <div className="flex flex-col gap-2">
              {orders.slice(0, 5).map(o => (
                <button key={o.id} onClick={() => setSelectedOrder(o)}
                  className="flex items-center gap-3 p-3 rounded-xl text-left transition-all"
                  style={{
                    border: `2px solid ${selectedOrder?.id === o.id ? '#e91e8c' : '#e8e8e8'}`,
                    background: selectedOrder?.id === o.id ? '#fce4ec' : '#fafafa',
                  }}>
                  <Package size={16} color={selectedOrder?.id === o.id ? '#e91e8c' : '#9e9e9e'} />
                  <div className="flex-1">
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a' }}>{o.order_number}</p>
                    <p style={{ fontSize: 11, color: '#9e9e9e' }}>{o.garment_type} • {o.tailor_name}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-10 h-10 rounded-full border-2 border-pink-200 border-t-pink-500 animate-spin" />
          </div>
        ) : !selectedOrder ? (
          <div className="text-center py-16">
            <Truck size={48} color="#e8e8e8" className="mx-auto mb-4" />
            <p style={{ color: '#9e9e9e', fontSize: 14 }}>No active deliveries</p>
          </div>
        ) : (
          <>
            {/* Order summary card */}
            <div className="p-4 rounded-2xl" style={{ background: '#f9f9f9' }}>
              <div className="flex items-center justify-between mb-2">
                <p style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a' }}>{selectedOrder.order_number}</p>
                <span className="px-3 py-1 rounded-full text-xs font-bold"
                  style={{ background: '#fce4ec', color: '#e91e8c' }}>
                  {selectedOrder.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>
              <p style={{ fontSize: 13, color: '#555' }}>{selectedOrder.garment_type} – {selectedOrder.service_type.replace('_', ' ')}</p>
              <p style={{ fontSize: 12, color: '#9e9e9e', marginTop: 3 }}>Tailor: {selectedOrder.tailor_name}</p>
              {selectedOrder.price && (
                <p style={{ fontSize: 14, fontWeight: 700, color: '#e91e8c', marginTop: 6 }}>AED {selectedOrder.price}</p>
              )}
            </div>

            {/* Progress tracker */}
            <div className="p-4 rounded-2xl" style={{ background: 'white', boxShadow: '0 2px 10px rgba(0,0,0,0.07)' }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a', marginBottom: 16 }}>Order Progress</p>
              <div className="flex flex-col gap-0">
                {STEPS.map((step, i) => {
                  const StepIcon = step.icon
                  const isCompleted = i <= currentStepIndex
                  const isCurrent = i === currentStepIndex
                  const isLast = i === STEPS.length - 1

                  return (
                    <div key={step.key} className="flex gap-3">
                      {/* Line + dot */}
                      <div className="flex flex-col items-center">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
                          style={{
                            background: isCompleted ? (isCurrent ? '#e91e8c' : '#4caf50') : '#f5f5f5',
                            boxShadow: isCurrent ? '0 0 0 4px rgba(233,30,140,0.2)' : 'none',
                          }}>
                          <StepIcon size={16} color={isCompleted ? 'white' : '#9e9e9e'} />
                        </div>
                        {!isLast && (
                          <div className="w-0.5 flex-1 my-1 min-h-6"
                            style={{ background: i < currentStepIndex ? '#4caf50' : '#e8e8e8' }} />
                        )}
                      </div>

                      {/* Content */}
                      <div className="pb-4 flex-1">
                        <p style={{ fontSize: 13, fontWeight: isCurrent ? 700 : 600, color: isCompleted ? '#1a1a1a' : '#9e9e9e' }}>
                          {step.label}
                          {isCurrent && <span className="ml-2 text-xs font-bold" style={{ color: '#e91e8c' }}>← Current</span>}
                        </p>
                        <p style={{ fontSize: 11, color: '#bbb', marginTop: 1 }}>{step.desc}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Pickup info */}
            {selectedOrder.pickup_date && (
              <div className="p-4 rounded-2xl" style={{ background: '#f9f9f9' }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a', marginBottom: 8 }}>Pickup Information</p>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Clock size={14} color="#e91e8c" />
                    <span style={{ fontSize: 13, color: '#555' }}>
                      {new Date(selectedOrder.pickup_date).toLocaleDateString('en-AE', { weekday: 'long', month: 'long', day: 'numeric' })} at {selectedOrder.pickup_time}
                    </span>
                  </div>
                  {selectedOrder.pickup_address && (
                    <div className="flex items-center gap-2">
                      <MapPin size={14} color="#e91e8c" />
                      <span style={{ fontSize: 13, color: '#555' }}>{selectedOrder.pickup_address}</span>
                    </div>
                  )}
                </div>
                {selectedOrder.expected_delivery && (
                  <div className="mt-3 pt-3" style={{ borderTop: '1px solid #e8e8e8' }}>
                    <p style={{ fontSize: 12, color: '#9e9e9e' }}>
                      Expected delivery: <strong>{new Date(selectedOrder.expected_delivery).toLocaleDateString('en-AE', { month: 'short', day: 'numeric' })}</strong>
                    </p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      <BottomNav />
    </div>
  )
}

export default function DeliveryPage() {
  return (
    <Suspense fallback={
      <div className="min-h-dvh bg-white flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-pink-200 border-t-pink-500 animate-spin" />
      </div>
    }>
      <DeliveryContent />
    </Suspense>
  )
}
