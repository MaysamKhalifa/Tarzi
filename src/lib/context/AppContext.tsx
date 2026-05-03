'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
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
  const [loading, setLoading] = useState(true)

  const fetchProfile = async (userId: string) => {
    const supabase = createClient()
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    if (data) {
      setProfile(data)
      // Load saved language preference
      if (data.language && ['en', 'ar', 'ur'].includes(data.language)) {
        localStorage.setItem('tarzi_lang', data.language)
        document.documentElement.setAttribute('lang', data.language)
        document.documentElement.setAttribute('dir', ['ar', 'ur'].includes(data.language) ? 'rtl' : 'ltr')
      }
    }
  }

  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      if (user) fetchProfile(user.id)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user ?? null)
        if (session?.user) {
          await fetchProfile(session.user.id)
        } else {
          setProfile(null)
        }
      }
    )

    // Load cart from localStorage
    const savedCart = localStorage.getItem('tarzi_cart')
    if (savedCart) setCart(JSON.parse(savedCart))

    return () => subscription.unsubscribe()
  }, [])

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
