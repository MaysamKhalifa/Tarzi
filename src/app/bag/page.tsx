'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ShoppingBag, Trash2, ChevronRight, Calendar, Clock,
  MapPin, Scissors, RefreshCw, Sparkles, CheckCircle
} from 'lucide-react'
import dynamic from 'next/dynamic'
import { Navigation } from 'lucide-react'
import BottomNav from '@/components/layout/BottomNav'
import PageHeader from '@/components/layout/PageHeader'
import { useApp } from '@/lib/context/AppContext'
import { createClient } from '@/lib/supabase/client'

const MapPicker = dynamic(() => import('@/components/MapPicker'), {
  ssr: false,
  loading: () => (
    <div style={{ height: 200, borderRadius: 16, background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="w-7 h-7 rounded-full border-2 border-pink-200 border-t-pink-500 animate-spin" />
    </div>
  ),
})

const SERVICE_ICONS = { alterations: Scissors, from_scratch: Sparkles, upcycling: RefreshCw }
const SERVICE_COLORS = { alterations: '#e91e8c', from_scratch: '#f57c00', upcycling: '#7b1fa2' }
const SERVICE_BG = { alterations: '#fce4ec', from_scratch: '#fff3e0', upcycling: '#f3e5f5' }

// Generate time slots from 8 AM to 10 PM every 30 min
function generateTimeSlots(): string[] {
  const slots: string[] = []
  for (let h = 8; h <= 22; h++) {
    for (const m of [0, 30]) {
      if (h === 22 && m === 30) break
      const ampm = h < 12 ? 'AM' : 'PM'
      const hour = h === 0 ? 12 : h > 12 ? h - 12 : h
      const min = m === 0 ? '00' : '30'
      slots.push(`${hour}:${min} ${ampm}`)
    }
  }
  return slots
}

const TIME_SLOTS = generateTimeSlots()

export default function BagPage() {
  const router = useRouter()
  const { cart, removeFromCart, clearCart, cartTotal, user } = useApp()
  const [pickupDate, setPickupDate] = useState('')
  const [pickupTime, setPickupTime] = useState('')
  const [address, setAddress] = useState('')
  const [placing, setPlacing] = useState(false)
  const [ordered, setOrdered] = useState(false)
  const [orderError, setOrderError] = useState('')
  const [showMap, setShowMap] = useState(false)
  const [mapLat, setMapLat] = useState(25.2048)
  const [mapLng, setMapLng] = useState(55.2708)
  const [locating, setLocating] = useState(false)

  const handleDetectLocation = () => {
    if (!navigator.geolocation) return
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords
        setMapLat(lat)
        setMapLng(lng)
        setShowMap(true)
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`, { headers: { 'Accept-Language': 'en' } })
          const data = await res.json()
          setAddress(data.display_name?.split(',').slice(0, 3).join(',').trim() || `${lat.toFixed(4)}, ${lng.toFixed(4)}`)
        } catch { setAddress(`${lat.toFixed(4)}, ${lng.toFixed(4)}`) }
        setLocating(false)
      },
      () => setLocating(false),
      { enableHighAccuracy: true }
    )
  }

  // Returns true only if s is a valid UUID (i.e. a real Supabase profile ID)
  const isValidUUID = (s: string) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s)

  const handleCheckout = async () => {
    if (!user) { router.push('/login'); return }
    if (!pickupDate || !pickupTime || !address.trim() || cart.length === 0) {
      setOrderError('Please select a pickup date, time, and enter your address.')
      return
    }

    setPlacing(true)
    setOrderError('')

    try {
      const supabase = createClient()

      for (const item of cart) {
        // Sanitise tailor_id — only pass it if it's a real UUID.
        // Old localStorage items may carry fake sample IDs like 'tailor-1'.
        const safeTailorId = item.tailorId && isValidUUID(item.tailorId)
          ? item.tailorId
          : null

        const orderNum = `ORD-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`
        const { data: newOrder, error } = await supabase.from('orders').insert({
          user_id:         user.id,
          tailor_id:       safeTailorId,
          tailor_name:     safeTailorId ? (item.tailorName || null) : null,
          service_type:    item.serviceType,
          garment_type:    item.garmentType,
          gender:          item.gender,
          comments:        item.comments || null,
          measurement_id:  item.measurementId || null,
          image_urls:      item.imageUrls || [],
          price:           item.price,
          pickup_date:     pickupDate,
          pickup_time:     pickupTime,
          pickup_address:  address.trim(),
          status:          'pending',
          order_number:    orderNum,
        }).select('id').single()

        if (error) {
          console.error('Order insert error:', error)
          setOrderError(
            error.message?.includes('policy') || error.code === '42501'
              ? 'Permission denied. Please log out and log back in, then try again.'
              : `Could not place order: ${error.message}`
          )
          return   // finally will reset placing
        }

        // ── Notify the tailor (fire-and-forget — don't block checkout) ──
        if (safeTailorId && newOrder?.id) {
          supabase.from('notifications').insert({
            user_id:  safeTailorId,
            order_id: newOrder.id,
            type:     'new_order',
            title:    'New Order Request',
            message:  `You have a new order request for ${item.garmentType} (${item.serviceType.replace('_', ' ')})`,
            is_read:  false,
          }).then(() => {}) // intentional fire-and-forget
        }
      }

      clearCart()
      setOrdered(true)
    } catch (err) {
      console.error('Checkout error:', err)
      setOrderError('Something went wrong. Please try again.')
    } finally {
      // Always reset the loading state — even if an early return happened
      setPlacing(false)
    }
  }

  // Generate 14 days starting tomorrow
  const today = new Date()
  const dates = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() + i + 1)
    return d
  })

  const isReady = !!pickupDate && !!pickupTime && !!address.trim() && !placing

  if (ordered) {
    return (
      <div className="min-h-dvh bg-white flex flex-col items-center justify-center px-6 text-center pb-24">
        <div className="w-24 h-24 rounded-full flex items-center justify-center mb-5" style={{ background: '#e8f5e9' }}>
          <CheckCircle size={48} color="#4caf50" />
        </div>
        <h2 style={{ fontSize: 26, fontWeight: 800, color: '#1a1a1a', marginBottom: 8 }}>Order Placed! 🎉</h2>
        <p style={{ color: '#9e9e9e', fontSize: 14, lineHeight: 1.7, marginBottom: 32 }}>
          Your order has been placed successfully. The tailor will confirm shortly and arrange pickup.
        </p>
        <Link href="/orders"
          className="w-full py-4 rounded-full text-white font-bold text-base text-center block"
          style={{ background: 'linear-gradient(135deg, #e91e8c 0%, #f06292 100%)' }}>
          View My Orders
        </Link>
        <Link href="/home" style={{ color: '#9e9e9e', fontSize: 14, marginTop: 16, display: 'block' }}>
          Continue Shopping
        </Link>
        <BottomNav />
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-white" style={{ paddingBottom: 160 }}>
      <PageHeader title="My Bag" subtitle={`${cart.length} item${cart.length !== 1 ? 's' : ''}`} showBack={false} />

      {cart.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
          <ShoppingBag size={56} color="#e8e8e8" className="mb-4" />
          <p style={{ fontSize: 18, fontWeight: 700, color: '#1a1a1a', marginBottom: 8 }}>Your bag is empty</p>
          <p style={{ color: '#9e9e9e', fontSize: 14, marginBottom: 24 }}>Add services to get started</p>
          <Link href="/home"
            className="px-8 py-3 rounded-full text-white font-bold text-sm"
            style={{ background: 'linear-gradient(135deg, #e91e8c 0%, #f06292 100%)' }}>
            Browse Services
          </Link>
        </div>
      ) : (
        <div className="px-5 flex flex-col gap-5 py-4">
          {/* Error message */}
          {orderError && (
            <div className="px-4 py-3 rounded-xl text-sm"
              style={{ background: '#fff0f0', color: '#d32f2f', border: '1px solid #ffcdd2' }}>
              ⚠️ {orderError}
            </div>
          )}

          {/* Cart items */}
          <div className="flex flex-col gap-3">
            {cart.map((item, index) => {
              const svc = item.serviceType as keyof typeof SERVICE_ICONS
              const Icon = SERVICE_ICONS[svc] || Scissors
              return (
                <div key={index} className="flex gap-3 p-4 rounded-2xl"
                  style={{ background: 'white', boxShadow: '0 2px 10px rgba(0,0,0,0.07)' }}>
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: SERVICE_BG[svc] || '#fce4ec' }}>
                    <Icon size={22} color={SERVICE_COLORS[svc] || '#e91e8c'} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a' }}>{item.garmentType}</p>
                        <p style={{ fontSize: 12, color: '#9e9e9e', textTransform: 'capitalize' }}>
                          {item.serviceType.replace('_', ' ')} • {item.tailorName}
                        </p>
                      </div>
                      <p style={{ fontSize: 15, fontWeight: 800, color: '#e91e8c' }}>AED {item.price}</p>
                    </div>
                    {item.comments && (
                      <p style={{ fontSize: 11, color: '#bbb', marginTop: 4 }} className="line-clamp-1">{item.comments}</p>
                    )}
                  </div>
                  <button onClick={() => removeFromCart(index)} className="self-start ml-1 p-1">
                    <Trash2 size={16} color="#f44336" />
                  </button>
                </div>
              )
            })}
          </div>

          {/* Order summary */}
          <div className="p-4 rounded-2xl" style={{ background: '#f9f9f9' }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: '#1a1a1a', marginBottom: 12 }}>Order Summary</p>
            {cart.map((item, i) => (
              <div key={i} className="flex justify-between mb-2">
                <span style={{ fontSize: 13, color: '#555' }}>{item.garmentType} ({item.serviceType.replace('_', ' ')})</span>
                <span style={{ fontSize: 13, fontWeight: 600 }}>AED {item.price}</span>
              </div>
            ))}
            <div style={{ borderTop: '1px solid #e8e8e8', marginTop: 10, paddingTop: 10 }} className="flex justify-between">
              <span style={{ fontSize: 15, fontWeight: 700, color: '#1a1a1a' }}>Total</span>
              <span style={{ fontSize: 17, fontWeight: 800, color: '#e91e8c' }}>AED {cartTotal.toFixed(2)}</span>
            </div>
            <p style={{ fontSize: 11, color: '#bbb', marginTop: 6 }}>Final price confirmed by tailor • Delivery decided by tailor</p>
          </div>

          {/* Pickup section */}
          <div>
            <p style={{ fontSize: 15, fontWeight: 700, color: '#1a1a1a', marginBottom: 12 }}>
              <MapPin size={15} className="inline mr-1" color="#e91e8c" />
              Pickup Details
            </p>

            {/* Pickup date — 14 days, horizontal scroll */}
            <div className="mb-4">
              <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 8 }}>
                <Calendar size={12} className="inline mr-1" /> Pickup Date *
              </label>
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                {dates.map(d => {
                  const val = d.toISOString().split('T')[0]
                  const label = d.toLocaleDateString('en-AE', { weekday: 'short' })
                  const day = d.getDate()
                  const month = d.toLocaleDateString('en-AE', { month: 'short' })
                  const isSelected = pickupDate === val
                  return (
                    <button key={val} onClick={() => setPickupDate(val)}
                      className="flex flex-col items-center py-3 px-3 rounded-2xl flex-shrink-0 transition-all"
                      style={{
                        minWidth: 58,
                        border: `2px solid ${isSelected ? '#e91e8c' : '#e8e8e8'}`,
                        background: isSelected ? '#fce4ec' : '#fafafa',
                        boxShadow: isSelected ? '0 2px 8px rgba(233,30,140,0.2)' : 'none',
                      }}>
                      <span style={{ fontSize: 10, color: isSelected ? '#e91e8c' : '#9e9e9e', fontWeight: 700, textTransform: 'uppercase' }}>{label}</span>
                      <span style={{ fontSize: 20, fontWeight: 800, color: isSelected ? '#e91e8c' : '#1a1a1a', lineHeight: 1.2, marginTop: 2 }}>{day}</span>
                      <span style={{ fontSize: 9, color: isSelected ? '#e91e8c' : '#bbb', fontWeight: 600 }}>{month}</span>
                    </button>
                  )
                })}
              </div>
              {pickupDate && (
                <p style={{ fontSize: 11, color: '#e91e8c', marginTop: 4, fontWeight: 600 }}>
                  ✓ {new Date(pickupDate + 'T12:00:00').toLocaleDateString('en-AE', { weekday: 'long', month: 'long', day: 'numeric' })}
                </p>
              )}
            </div>

            {/* Pickup time — scrollable grid */}
            <div className="mb-4">
              <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 8 }}>
                <Clock size={12} className="inline mr-1" /> Pickup Time *
              </label>
              <div className="overflow-x-auto no-scrollbar pb-2">
                <div className="flex gap-2" style={{ width: 'max-content' }}>
                  {TIME_SLOTS.map(slot => {
                    const isSelected = pickupTime === slot
                    return (
                      <button key={slot} onClick={() => setPickupTime(slot)}
                        className="py-2.5 px-3 rounded-xl text-xs font-semibold transition-all flex-shrink-0"
                        style={{
                          border: `2px solid ${isSelected ? '#e91e8c' : '#e8e8e8'}`,
                          background: isSelected ? '#fce4ec' : '#fafafa',
                          color: isSelected ? '#e91e8c' : '#555',
                          boxShadow: isSelected ? '0 2px 8px rgba(233,30,140,0.2)' : 'none',
                          minWidth: 72,
                        }}>
                        {slot}
                      </button>
                    )
                  })}
                </div>
              </div>
              {pickupTime && (
                <p style={{ fontSize: 11, color: '#e91e8c', marginTop: 4, fontWeight: 600 }}>✓ {pickupTime}</p>
              )}
            </div>

            {/* Address */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 6 }}>
                Pickup Address *
              </label>

              <div className="flex gap-2 mb-3">
                <button type="button" onClick={() => setShowMap(s => !s)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition-all"
                  style={{ border: `2px solid ${showMap ? '#e91e8c' : '#e8e8e8'}`, background: showMap ? '#fce4ec' : 'white', color: showMap ? '#e91e8c' : '#555' }}>
                  <MapPin size={13} /> {showMap ? 'Hide Map' : 'Pick on Map'}
                </button>
                <button type="button" onClick={handleDetectLocation} disabled={locating}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition-all"
                  style={{ border: '2px solid #e8e8e8', background: 'white', color: '#555' }}>
                  <Navigation size={13} /> {locating ? 'Locating...' : 'Use My Location'}
                </button>
              </div>

              {showMap && (
                <div className="mb-3">
                  <MapPicker
                    lat={mapLat}
                    lng={mapLng}
                    onSelect={(lat, lng, addr) => {
                      setMapLat(lat)
                      setMapLng(lng)
                      setAddress(addr.split(',').slice(0, 3).join(',').trim())
                    }}
                  />
                  <p style={{ fontSize: 11, color: '#9e9e9e', marginTop: 6, textAlign: 'center' }}>
                    Tap anywhere on the map to set pickup location
                  </p>
                </div>
              )}

              <textarea
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder="Villa 12, Street 5, Mirdif, Dubai"
                rows={2}
                className="w-full px-4 py-3 rounded-xl outline-none"
                style={{ border: `1.5px solid ${address.trim() ? '#e91e8c' : '#e8e8e8'}`, background: '#fafafa', fontSize: 14, resize: 'none' }}
                onFocus={e => (e.target.style.borderColor = '#e91e8c')}
                onBlur={e => (e.target.style.borderColor = address.trim() ? '#e91e8c' : '#e8e8e8')}
              />
            </div>
          </div>

          {/* Readiness indicator */}
          {!isReady && (
            <div className="px-4 py-3 rounded-xl text-sm" style={{ background: '#fffde7', color: '#f57c00', border: '1px solid #fff9c4' }}>
              {!pickupDate ? '📅 Select a pickup date' : !pickupTime ? '🕐 Select a pickup time' : !address.trim() ? '📍 Enter your pickup address' : ''}
            </div>
          )}
        </div>
      )}

      {/* Sticky checkout button — sits above BottomNav */}
      {cart.length > 0 && (
        <div
          className="fixed left-1/2 -translate-x-1/2 w-full max-w-[430px] px-5 py-3 bg-white"
          style={{
            bottom: 'calc(56px + env(safe-area-inset-bottom, 0px))',
            borderTop: '1px solid #f0f0f0',
            zIndex: 60,
            boxShadow: '0 -2px 12px rgba(0,0,0,0.06)',
          }}
        >
          {orderError && (
            <div className="mb-2 px-3 py-2 rounded-xl text-xs"
              style={{ background: '#fff0f0', color: '#d32f2f', border: '1px solid #ffcdd2' }}>
              ⚠️ {orderError}
            </div>
          )}
          <button
            onClick={handleCheckout}
            disabled={!isReady}
            className="w-full py-4 rounded-full text-white font-bold text-base flex items-center justify-center gap-2 transition-all"
            style={{
              background: isReady
                ? 'linear-gradient(135deg, #e91e8c 0%, #f06292 100%)'
                : '#f0f0f0',
              color: isReady ? 'white' : '#bbb',
              boxShadow: isReady ? '0 4px 15px rgba(233, 30, 140, 0.3)' : 'none',
              cursor: isReady ? 'pointer' : 'not-allowed',
            }}
          >
            {placing ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-white/50 border-t-white animate-spin" />
                Placing order...
              </>
            ) : (
              <>Check Out • AED {cartTotal.toFixed(2)} <ChevronRight size={18} /></>
            )}
          </button>
        </div>
      )}

      <BottomNav />
    </div>
  )
}
