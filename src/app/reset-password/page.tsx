'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Eye, EyeOff, Scissors, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useLanguage } from '@/lib/context/LanguageContext'

type Status = 'loading' | 'ready' | 'invalid' | 'success'

export default function ResetPasswordPage() {
  const { t, isRTL } = useLanguage()
  const [status, setStatus] = useState<Status>('loading')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // The reset-password link carries recovery tokens in the URL (hash or
  // ?code=), which the Supabase client auto-detects (detectSessionInUrl)
  // and exchanges for a session on page load. Poll briefly for that session.
  useEffect(() => {
    const supabase = createClient()
    const check = async () => {
      let session = null
      for (let i = 0; i < 10; i++) {
        const { data } = await supabase.auth.getSession()
        if (data.session) { session = data.session; break }
        await new Promise(r => setTimeout(r, 400))
      }
      setStatus(session ? 'ready' : 'invalid')
    }
    check()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password || !confirmPassword) { setError(t('reset_password', 'err_required')); return }
    if (password.length < 8) { setError(t('reset_password', 'err_length')); return }
    if (password !== confirmPassword) { setError(t('reset_password', 'err_match')); return }
    setSaving(true)
    setError('')
    try {
      const supabase = createClient()
      const { error: err } = await supabase.auth.updateUser({ password })
      if (err) {
        console.error('[reset-password] updateUser failed:', err.status, err.message)
        setError(err.message)
        setSaving(false)
        return
      }
      await supabase.auth.signOut()
      setStatus('success')
    } catch (err) {
      console.error('[reset-password] Unexpected error:', err)
      setError(t('reset_password', 'err_required'))
      setSaving(false)
    }
  }

  const InputStyle = { border: '1.5px solid #e8e8e8', background: '#fafafa', fontSize: 15 }

  if (status === 'loading') {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center bg-white px-6 text-center">
        <Loader2 size={40} color="#e91e8c" className="animate-spin" />
      </div>
    )
  }

  if (status === 'invalid') {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center bg-white px-6 text-center" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6" style={{ background: '#fff0f0' }}>
          <XCircle size={40} color="#d32f2f" />
        </div>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: '#1a1a1a', marginBottom: 10 }}>{t('reset_password', 'invalid_title')}</h2>
        <p style={{ color: '#9e9e9e', fontSize: 14, lineHeight: 1.7, marginBottom: 24 }}>{t('reset_password', 'invalid_sub')}</p>
        <Link href="/forgot-password" className="w-full py-4 rounded-full text-white font-bold text-base block"
          style={{ background: 'linear-gradient(135deg, #e91e8c 0%, #f06292 100%)' }}>
          {t('reset_password', 'request_new')}
        </Link>
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center bg-white px-6 text-center" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6" style={{ background: '#e8f5e9' }}>
          <CheckCircle size={40} color="#2e7d32" />
        </div>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: '#1a1a1a', marginBottom: 10 }}>{t('reset_password', 'success_title')}</h2>
        <p style={{ color: '#9e9e9e', fontSize: 14, lineHeight: 1.7, marginBottom: 24 }}>{t('reset_password', 'success_sub')}</p>
        <Link href="/login" className="w-full py-4 rounded-full text-white font-bold text-base block"
          style={{ background: 'linear-gradient(135deg, #e91e8c 0%, #f06292 100%)' }}>
          {t('reset_password', 'go_login')}
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-dvh flex flex-col bg-white" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-center px-6 pt-12 pb-8"
        style={{ background: 'linear-gradient(160deg, #e91e8c 0%, #f06292 60%, #fce4ec 100%)' }}>
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center mx-auto mb-3"
            style={{ boxShadow: '0 6px 20px rgba(233,30,140,0.25)' }}>
            <Scissors size={30} color="#e91e8c" strokeWidth={1.8} />
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: 'white' }}>{t('reset_password', 'title')}</h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, marginTop: 2 }}>{t('reset_password', 'subtitle')}</p>
        </div>
      </div>

      <div className="px-6 py-6 -mt-6 rounded-t-3xl bg-white flex-1">
        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl text-sm"
            style={{ background: '#fff0f0', color: '#d32f2f', border: '1px solid #ffcdd2' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#555', display: 'block', marginBottom: 6 }}>
              {t('reset_password', 'password')}
            </label>
            <div className="relative">
              <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                placeholder={t('reset_password', 'placeholder_password')} className="w-full px-4 py-3.5 rounded-xl pr-12 outline-none transition-all"
                style={InputStyle} onFocus={e => e.target.style.borderColor = '#e91e8c'} onBlur={e => e.target.style.borderColor = '#e8e8e8'} />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2" style={{ color: '#9e9e9e' }}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#555', display: 'block', marginBottom: 6 }}>
              {t('reset_password', 'confirm_password')}
            </label>
            <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
              placeholder={t('reset_password', 'placeholder_confirm')} className="w-full px-4 py-3.5 rounded-xl outline-none transition-all"
              style={InputStyle} onFocus={e => e.target.style.borderColor = '#e91e8c'} onBlur={e => e.target.style.borderColor = '#e8e8e8'} />
          </div>

          <button type="submit" disabled={saving}
            className="w-full py-4 rounded-full text-white font-bold text-base mt-2 transition-all"
            style={{ background: saving ? '#f9a0c8' : 'linear-gradient(135deg, #e91e8c 0%, #f06292 100%)', boxShadow: '0 4px 15px rgba(233,30,140,0.3)' }}>
            {saving ? t('reset_password', 'saving') : t('reset_password', 'btn')}
          </button>
        </form>
      </div>
    </div>
  )
}
