'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Scissors, User, Phone } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const router = useRouter()
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '', confirmPassword: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.fullName || !form.email || !form.password) { setError('Please fill in all required fields'); return }
    if (form.password.length < 8) { setError('Password must be at least 8 characters'); return }
    if (form.password !== form.confirmPassword) { setError('Passwords do not match'); return }

    setLoading(true)
    setError('')
    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: { full_name: form.fullName },
        },
      })
      if (error) { setError(error.message); return }

      // Update profile with phone
      if (data.user && form.phone) {
        await supabase.from('profiles').update({ phone: form.phone }).eq('id', data.user.id)
      }

      router.push('/home')
      router.refresh()
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const update = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const InputStyle = {
    border: '1.5px solid #e8e8e8',
    background: '#fafafa',
    fontSize: 15,
  }

  return (
    <div className="min-h-dvh flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-center px-6 pt-12 pb-8"
        style={{ background: 'linear-gradient(160deg, #e91e8c 0%, #f06292 60%, #fce4ec 100%)' }}>
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center mx-auto mb-3"
            style={{ boxShadow: '0 6px 20px rgba(233,30,140,0.25)' }}>
            <Scissors size={30} color="#e91e8c" strokeWidth={1.8} />
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: 'white' }}>Join Tarzi</h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, marginTop: 2 }}>Create your account</p>
        </div>
      </div>

      {/* Form */}
      <div className="px-6 py-6 -mt-6 rounded-t-3xl bg-white flex-1">
        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl text-sm"
            style={{ background: '#fff0f0', color: '#d32f2f', border: '1px solid #ffcdd2' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="flex flex-col gap-4">
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#555', display: 'block', marginBottom: 6 }}>
              Full Name *
            </label>
            <div className="relative">
              <input
                type="text"
                value={form.fullName}
                onChange={e => update('fullName', e.target.value)}
                placeholder="Hamda Khalifa"
                className="w-full px-4 py-3.5 rounded-xl pl-11 outline-none transition-all"
                style={InputStyle}
                onFocus={e => e.target.style.borderColor = '#e91e8c'}
                onBlur={e => e.target.style.borderColor = '#e8e8e8'}
              />
              <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2" color="#9e9e9e" />
            </div>
          </div>

          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#555', display: 'block', marginBottom: 6 }}>
              Email address *
            </label>
            <input
              type="email"
              value={form.email}
              onChange={e => update('email', e.target.value)}
              placeholder="you@email.com"
              className="w-full px-4 py-3.5 rounded-xl outline-none transition-all"
              style={InputStyle}
              onFocus={e => e.target.style.borderColor = '#e91e8c'}
              onBlur={e => e.target.style.borderColor = '#e8e8e8'}
            />
          </div>

          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#555', display: 'block', marginBottom: 6 }}>
              Phone number
            </label>
            <div className="relative">
              <input
                type="tel"
                value={form.phone}
                onChange={e => update('phone', e.target.value)}
                placeholder="+971 50 000 0000"
                className="w-full px-4 py-3.5 rounded-xl pl-11 outline-none transition-all"
                style={InputStyle}
                onFocus={e => e.target.style.borderColor = '#e91e8c'}
                onBlur={e => e.target.style.borderColor = '#e8e8e8'}
              />
              <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2" color="#9e9e9e" />
            </div>
          </div>

          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#555', display: 'block', marginBottom: 6 }}>
              Password *
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={e => update('password', e.target.value)}
                placeholder="At least 8 characters"
                className="w-full px-4 py-3.5 rounded-xl pr-12 outline-none transition-all"
                style={InputStyle}
                onFocus={e => e.target.style.borderColor = '#e91e8c'}
                onBlur={e => e.target.style.borderColor = '#e8e8e8'}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2" style={{ color: '#9e9e9e' }}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#555', display: 'block', marginBottom: 6 }}>
              Confirm Password *
            </label>
            <input
              type="password"
              value={form.confirmPassword}
              onChange={e => update('confirmPassword', e.target.value)}
              placeholder="Repeat your password"
              className="w-full px-4 py-3.5 rounded-xl outline-none transition-all"
              style={InputStyle}
              onFocus={e => e.target.style.borderColor = '#e91e8c'}
              onBlur={e => e.target.style.borderColor = '#e8e8e8'}
            />
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
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className="mt-5 text-center">
          <span style={{ color: '#9e9e9e', fontSize: 14 }}>Already have an account? </span>
          <Link href="/login" style={{ color: '#e91e8c', fontWeight: 700, fontSize: 14 }}>Log In</Link>
        </div>
      </div>
    </div>
  )
}
