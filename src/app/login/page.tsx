'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Scissors } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) { setError('Please fill in all fields'); return }
    setLoading(true)
    setError('')
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) { setError(error.message); return }
      router.push('/home')
      router.refresh()
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-dvh flex flex-col bg-white">
      {/* Pink header with branding */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-16 pb-8"
        style={{ background: 'linear-gradient(160deg, #e91e8c 0%, #f06292 50%, #fce4ec 100%)' }}>
        <div className="w-20 h-20 rounded-3xl bg-white flex items-center justify-center mb-4"
          style={{ boxShadow: '0 8px 30px rgba(233,30,140,0.3)' }}>
          <Scissors size={40} color="#e91e8c" strokeWidth={1.8} />
        </div>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: 'white', letterSpacing: -0.5 }}>tarzi</h1>
        <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 15, marginTop: 4 }}>Your tailor, your style</p>
      </div>

      {/* Login form */}
      <div className="px-6 py-8 -mt-8 rounded-t-3xl bg-white flex-1">
        <h2 style={{ fontSize: 24, fontWeight: 700, color: '#1a1a1a', marginBottom: 6 }}>Welcome back!</h2>
        <p style={{ color: '#9e9e9e', fontSize: 14, marginBottom: 28 }}>Sign in to your account</p>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl text-sm"
            style={{ background: '#fff0f0', color: '#d32f2f', border: '1px solid #ffcdd2' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#555', display: 'block', marginBottom: 6 }}>
              Email address
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@email.com"
              className="w-full px-4 py-3.5 rounded-xl text-sm outline-none transition-all"
              style={{ border: '1.5px solid #e8e8e8', background: '#fafafa', fontSize: 15 }}
              onFocus={e => e.target.style.borderColor = '#e91e8c'}
              onBlur={e => e.target.style.borderColor = '#e8e8e8'}
            />
          </div>

          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#555', display: 'block', marginBottom: 6 }}>
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-4 py-3.5 rounded-xl text-sm outline-none transition-all pr-12"
                style={{ border: '1.5px solid #e8e8e8', background: '#fafafa', fontSize: 15 }}
                onFocus={e => e.target.style.borderColor = '#e91e8c'}
                onBlur={e => e.target.style.borderColor = '#e8e8e8'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2"
                style={{ color: '#9e9e9e' }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="text-right">
            <Link href="/forgot-password" style={{ fontSize: 13, color: '#e91e8c', fontWeight: 600 }}>
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-full text-white font-bold text-base mt-2 transition-all"
            style={{
              background: loading ? '#f9a0c8' : 'linear-gradient(135deg, #e91e8c 0%, #f06292 100%)',
              boxShadow: '0 4px 15px rgba(233, 30, 140, 0.3)',
            }}
          >
            {loading ? 'Signing in...' : 'Log In'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <span style={{ color: '#9e9e9e', fontSize: 14 }}>Don't have an account? </span>
          <Link href="/signup" style={{ color: '#e91e8c', fontWeight: 700, fontSize: 14 }}>
            Create Account
          </Link>
        </div>
      </div>
    </div>
  )
}
