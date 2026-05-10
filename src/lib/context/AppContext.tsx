'use client'

import React, { createContext, useContext, useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import type { Profile, Order } from '@/types/database'

interface CartItem {
  tailorId: string
  tailorName: string
  serviceType: string
  garmentType: string
  gender: string
  comments: string
  imageUrls: string[]
  price: number
  measurementId: string | null
}

interface AppContextType {
  user: User | null
  profile: Profile | null
  cart: CartItem[]
  addToCart: (item: CartItem) => void
  removeFromCart: (index: number) => void
  clearCart: () => void
  cartTotal: number
  loading: boolean
  refreshProfile: () => Promise<void>
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [cart, setCart] = useState<CartItem[]>([])
  // loading = true until we know the auth state for certain
  const [loading, setLoading] = useState(true)
  // Ensure setLoading(false) only fires once, even if both getUser() and
  // onAuthStateChange(INITIAL_SESSION) resolve around the same time
  const loadingResolvedRef = useRef(false)

  const resolveLoading = () => {
    if (!loadingResolvedRef.current) {
      loadingResolvedRef.current = true
      setLoading(false)
    }
  }

  const fetchProfile = async (userId: string) => {
    try {
      const supabase = createClient()
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      if (data) {
        setProfile(data as Profile)
        // Apply saved language preference
        const lang = (data as Record<string, unknown>).preferred_language as string | undefined
        if (lang && ['en', 'ar', 'ur'].includes(lang)) {
          localStorage.setItem('tarzi_lang', lang)
          document.documentElement.setAttribute('lang', lang)
          document.documentElement.setAttribute('dir', ['ar', 'ur'].includes(lang) ? 'rtl' : 'ltr')
        }
      }
    } catch {
      // Profile fetch is non-critical — auth still works without it
    }
  }

  useEffect(() => {
    const supabase = createClient()

    // Load cart from localStorage immediately
    try {
      const savedCart = localStorage.getItem('tarzi_cart')
      if (savedCart) setCart(JSON.parse(savedCart))
    } catch { /* ignore */ }

    // Safety net: if neither getUser() nor onAuthStateChange resolves within
    // 5 seconds, force loading=false so the app doesn't get stuck forever
    const safetyTimeout = setTimeout(() => {
      console.warn('[AppContext] Auth safety timeout — forcing loading=false')
      resolveLoading()
    }, 5000)

    // Primary auth check: works even when cookies are expired
    supabase.auth.getUser().then(({ data: { user: u } }) => {
      clearTimeout(safetyTimeout)
      setUser(u)
      if (u) fetchProfile(u.id)
      resolveLoading()
    }).catch(() => {
      clearTimeout(safetyTimeout)
      resolveLoading()
    })

    // Real-time auth state changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const u = session?.user ?? null
        setUser(u)
        if (u) {
          fetchProfile(u.id)
        } else {
          setProfile(null)
        }
        // Also resolve loading here — whichever fires first (getUser or this) wins
        clearTimeout(safetyTimeout)
        resolveLoading()
      }
    )

    return () => {
      clearTimeout(safetyTimeout)
      subscription.unsubscribe()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const addToCart = (item: CartItem) => {
    const newCart = [...cart, item]
    setCart(newCart)
    localStorage.setItem('tarzi_cart', JSON.stringify(newCart))
  }

  const removeFromCart = (index: number) => {
    const newCart = cart.filter((_, i) => i !== index)
    setCart(newCart)
    localStorage.setItem('tarzi_cart', JSON.stringify(newCart))
  }

  const clearCart = () => {
    setCart([])
    localStorage.removeItem('tarzi_cart')
  }

  const cartTotal = cart.reduce((sum, item) => sum + item.price, 0)

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id)
  }

  return (
    <AppContext.Provider value={{
      user, profile, cart, addToCart, removeFromCart,
      clearCart, cartTotal, loading, refreshProfile
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
