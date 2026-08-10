'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Scissors } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useLanguage } from '@/lib/context/LanguageContext'
import LanguageSelector from '@/components/LanguageSelector'

export default function LoginPage() {
  const router = useRouter()
  const { t, isRTL } = useLanguage()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) { setError(t('login', 'err_fill_fields')); return }
    setLoading(true)
    setError('')
    try {
      const supabase = createClient()
      const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password })
      if (signInError) {
        const msg = signInError.message
        if (msg.toLowerCase().includes('not confirmed') || msg.toLowerCase().includes('email not confirmed')) {
          setError(t('login', 'err_not_confirmed'))
        } else if (msg.toLowerCase().includes('invalid login credentials')) {
          setError(t('login', 'err_invalid'))
        } else {
          setError(msg)
        }
        setLoading(false)
        return
      }
      if (data?.session) {
        router.replace('/home')
      }
    } catch {
      setError(t('login', 'err_generic'))
      setLoading(false)
    }
  }

  return (
    <div className="min-h-dvh flex flex-col bg-white" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Pink header with branding */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-16 pb-8"
        style={{ background: 'linear-gradient(160deg, #e91e8c 0%, #f06292 50%, #fce4ec 100%)' }}>
        <div className="w-20 h-20 rounded-3xl bg-white flex items-center justify-center mb-4"
          style={{ boxShadow: '0 8px 30px rgba(233,30,140,0.3)' }}>
          <Scissors size={40} color="#e91e8c" strokeWidth={1.8} />
        </div>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: 'white', letterSpacing: -0.5 }}>tarzi</h1>
        <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 15, marginTop: 4 }}>{t('login', 'slogan')}</p>
      </div>

      {/* Login form */}
      <div className="px-6 py-8 -mt-8 rounded-t-3xl bg-white flex-1">
        <h2 style={{ fontSize: 24, fontWeight: 700, color: '#1a1a1a', marginBottom: 6 }}>{t('login', 'title')}</h2>
        <p style={{ color: '#9e9e9e', fontSize: 14, marginBottom: 28 }}>{t('login', 'subtitle')}</p>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl text-sm"
            style={{ background: '#fff0f0', color: '#d32f2f', border: '1px solid #ffcdd2' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#555', display: 'block', marginBottom: 6 }}>
              {t('login', 'email')}
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder={t('login', 'email_placeholder')}
              autoComplete="email"
              className="w-full px-4 py-3.5 rounded-xl outline-none transition-all"
              style={{ border: '1.5px solid #e8e8e8', background: '#fafafa', fontSize: 15 }}
              onFocus={e => e.target.style.borderColor = '#e91e8c'}
              onBlur={e => e.target.style.borderColor = '#e8e8e8'}
            />
          </div>

          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#555', display: 'block', marginBottom: 6 }}>
              {t('login', 'password')}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder={t('login', 'password_placeholder')}
                autoComplete="current-password"
                className="w-full px-4 py-3.5 rounded-xl outline-none transition-all pr-12"
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
            <button type="button" style={{ fontSize: 13, color: '#e91e8c', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>
              {t('login', 'forgot')}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-full text-white font-bold text-base mt-2 transition-all"
            style={{
              background: loading ? '#f9a0c8' : 'linear-gradient(135deg, #e91e8c 0%, #f06292 100%)',
              boxShadow: '0 4px 15px rgba(233, 30, 140, 0.3)',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? t('common', 'loading') : t('login', 'btn')}
          </button>
        </form>

        {/* Language selector */}
        <div className="mt-4">
          <p style={{ fontSize: 12, fontWeight: 600, color: '#9e9e9e', marginBottom: 8, textAlign: 'center' }}>
            {t('login', 'language_label')}
          </p>
          <div className="flex justify-center"><LanguageSelector compact /></div>
        </div>

        <div className="mt-6 text-center">
          <span style={{ color: '#9e9e9e', fontSize: 14 }}>{t('login', 'no_account')} </span>
          <Link href="/signup" style={{ color: '#e91e8c', fontWeight: 700, fontSize: 14 }}>
            {t('login', 'create')}
          </Link>
        </div>
      </div>
    </div>
  )
}
