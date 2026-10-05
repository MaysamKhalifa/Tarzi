'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Scissors, Mail, CheckCircle, RefreshCw } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useLanguage } from '@/lib/context/LanguageContext'

export default function ForgotPasswordPage() {
  const { t, isRTL } = useLanguage()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)
  const [resending, setResending] = useState(false)
  const [resent, setResent] = useState(false)

  const sendReset = async (targetEmail: string) => {
    const supabase = createClient()
    return supabase.auth.resetPasswordForEmail(targetEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) { setError(t('forgot_password', 'err_required')); return }
    setLoading(true)
    setError('')
    try {
      const { error: err } = await sendReset(email)
      if (err) {
        console.error('[forgot-password] resetPasswordForEmail failed:', err.status, err.message)
        setError(err.message || t('forgot_password', 'err_generic'))
        setLoading(false)
        return
      }
      setSent(true)
    } catch (err) {
      console.error('[forgot-password] Unexpected error:', err)
      setError(t('forgot_password', 'err_generic'))
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setResending(true)
    try {
      const { error: err } = await sendReset(email)
      if (!err) setResent(true)
    } finally {
      setResending(false)
    }
  }

  if (sent) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center bg-white px-6 text-center" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6"
          style={{ background: 'linear-gradient(135deg, #fce4ec 0%, #f8bbd0 100%)' }}>
          <Mail size={40} color="#e91e8c" />
        </div>
        <h2 style={{ fontSize: 26, fontWeight: 800, color: '#1a1a1a', marginBottom: 10 }}>
          {t('forgot_password', 'sent_title')}
        </h2>
        <p style={{ color: '#555', fontSize: 15, lineHeight: 1.7, marginBottom: 6 }}>
          {t('forgot_password', 'sent_sub')}
        </p>
        <p style={{ color: '#e91e8c', fontWeight: 700, fontSize: 15, marginBottom: 24 }}>{email}</p>
        <p style={{ color: '#9e9e9e', fontSize: 13, lineHeight: 1.7, marginBottom: 24 }}>
          {t('forgot_password', 'sent_check')}
        </p>

        {resent && (
          <div className="w-full flex items-center gap-2 mb-4 px-4 py-3 rounded-xl" style={{ background: '#e8f5e9' }}>
            <CheckCircle size={18} color="#2e7d32" />
            <span style={{ fontSize: 14, color: '#2e7d32', fontWeight: 600 }}>{t('forgot_password', 'resent')}</span>
          </div>
        )}

        <button onClick={handleResend} disabled={resending || resent}
          className="w-full py-3.5 rounded-full font-bold text-sm mb-3 flex items-center justify-center gap-2"
          style={{
            background: resent ? '#e8f5e9' : '#fce4ec',
            color: resent ? '#2e7d32' : '#e91e8c',
            cursor: resending ? 'not-allowed' : 'pointer',
          }}>
          {resending ? (
            <><RefreshCw size={16} className="animate-spin" /> {t('forgot_password', 'resending')}</>
          ) : resent ? (
            <><CheckCircle size={16} /> {t('forgot_password', 'resent')}</>
          ) : (
            t('forgot_password', 'resend_btn')
          )}
        </button>

        <Link href="/login" className="w-full py-4 rounded-full text-white font-bold text-base block"
          style={{ background: 'linear-gradient(135deg, #e91e8c 0%, #f06292 100%)' }}>
          {t('forgot_password', 'back_login')}
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
          <h1 style={{ fontSize: 26, fontWeight: 800, color: 'white' }}>{t('forgot_password', 'title')}</h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, marginTop: 2 }}>{t('forgot_password', 'subtitle')}</p>
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
              {t('forgot_password', 'email')}
            </label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder={t('forgot_password', 'email_placeholder')} className="w-full px-4 py-3.5 rounded-xl outline-none transition-all"
              style={{ border: '1.5px solid #e8e8e8', background: '#fafafa', fontSize: 15 }}
              onFocus={e => e.target.style.borderColor = '#e91e8c'} onBlur={e => e.target.style.borderColor = '#e8e8e8'} />
          </div>

          <button type="submit" disabled={loading}
            className="w-full py-4 rounded-full text-white font-bold text-base mt-2 transition-all"
            style={{ background: loading ? '#f9a0c8' : 'linear-gradient(135deg, #e91e8c 0%, #f06292 100%)', boxShadow: '0 4px 15px rgba(233,30,140,0.3)' }}>
            {loading ? t('forgot_password', 'sending') : t('forgot_password', 'send_btn')}
          </button>
        </form>

        <div className="mt-5 text-center">
          <Link href="/login" style={{ color: '#e91e8c', fontWeight: 700, fontSize: 14 }}>
            {t('forgot_password', 'back_login')}
          </Link>
        </div>
      </div>
    </div>
  )
}
