'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Scissors, User, Phone, Mail, CheckCircle, RefreshCw } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useLanguage } from '@/lib/context/LanguageContext'
import LanguageSelector from '@/components/LanguageSelector'

export default function SignupPage() {
  const router = useRouter()
  const { t } = useLanguage()
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '', confirmPassword: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [emailSent, setEmailSent] = useState(false)
  const [sentTo, setSentTo] = useState('')
  const [resending, setResending] = useState(false)
  const [resent, setResent] = useState(false)
  const [resendError, setResendError] = useState('')

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.fullName || !form.email || !form.password) { setError(t('signup', 'err_required')); return }
    if (form.password.length < 8) { setError(t('signup', 'err_length')); return }
    if (form.password !== form.confirmPassword) { setError(t('signup', 'err_match')); return }

    setLoading(true)
    setError('')
    try {
      const supabase = createClient()
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: { full_name: form.fullName },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (signUpError) {
        console.error('[signup] auth.signUp failed:', signUpError.status, signUpError.message)
        setError(signUpError.message)
        setLoading(false)
        return
      }

      if (data.user && form.phone) {
        await supabase.from('profiles').update({ phone: form.phone }).eq('id', data.user.id)
      }

      if (data.session) {
        // Supabase Auth has "Confirm email" disabled for this project, so no
        // verification email is sent by design — the user is signed in immediately.
        console.warn('[signup] Session returned on signUp — email confirmation is disabled in Supabase Auth settings, no verification email was sent.')
        router.replace('/home')
      } else {
        // Email confirmation required — Supabase should have queued the email.
        console.info('[signup] No session on signUp — Supabase should be sending a confirmation email to', form.email)
        setSentTo(form.email)
        setEmailSent(true)
      }
    } catch (err) {
      console.error('[signup] Unexpected error during signup:', err)
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setResending(true)
    setResendError('')
    try {
      const supabase = createClient()
      const { error: resendErr } = await supabase.auth.resend({
        type: 'signup',
        email: sentTo,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      })
      if (resendErr) {
        console.error('[signup] resend failed:', resendErr.status, resendErr.message)
        setResendError(resendErr.message)
      } else {
        setResent(true)
      }
    } catch (err) {
      console.error('[signup] Unexpected error resending email:', err)
      setResendError('Could not resend email. Please try again.')
    } finally {
      setResending(false)
    }
  }

  const update = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const InputStyle = { border: '1.5px solid #e8e8e8', background: '#fafafa', fontSize: 15 }

  // ── Email sent confirmation screen ──
  if (emailSent) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center bg-white px-6 text-center">
        <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6"
          style={{ background: 'linear-gradient(135deg, #fce4ec 0%, #f8bbd0 100%)' }}>
          <Mail size={40} color="#e91e8c" />
        </div>
        <h2 style={{ fontSize: 26, fontWeight: 800, color: '#1a1a1a', marginBottom: 10 }}>
          {t('signup', 'verify_title')}
        </h2>
        <p style={{ color: '#555', fontSize: 15, lineHeight: 1.7, marginBottom: 6 }}>
          {t('signup', 'verify_sub')}
        </p>
        <p style={{ color: '#e91e8c', fontWeight: 700, fontSize: 15, marginBottom: 24 }}>{sentTo}</p>
        <p style={{ color: '#9e9e9e', fontSize: 13, lineHeight: 1.7, marginBottom: 24 }}>
          {t('signup', 'verify_check')}
        </p>

        {resent && (
          <div className="w-full flex items-center gap-2 mb-4 px-4 py-3 rounded-xl"
            style={{ background: '#e8f5e9' }}>
            <CheckCircle size={18} color="#2e7d32" />
            <span style={{ fontSize: 14, color: '#2e7d32', fontWeight: 600 }}>{t('signup', 'resent_confirm')}</span>
          </div>
        )}

        {resendError && (
          <div className="w-full mb-4 px-4 py-3 rounded-xl text-sm text-left"
            style={{ background: '#fff5f5', border: '1px solid #fecaca', color: '#dc2626' }}>
            {resendError}
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
            <><RefreshCw size={16} className="animate-spin" /> {t('signup', 'resending')}</>
          ) : resent ? (
            <><CheckCircle size={16} /> {t('signup', 'resent')}</>
          ) : (
            t('signup', 'resend_btn')
          )}
        </button>

        <Link href="/login"
          className="w-full py-4 rounded-full text-white font-bold text-base block"
          style={{ background: 'linear-gradient(135deg, #e91e8c 0%, #f06292 100%)' }}>
          {t('signup', 'verify_go')}
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-dvh flex flex-col bg-white">
      <div className="flex items-center justify-center px-6 pt-12 pb-8"
        style={{ background: 'linear-gradient(160deg, #e91e8c 0%, #f06292 60%, #fce4ec 100%)' }}>
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center mx-auto mb-3"
            style={{ boxShadow: '0 6px 20px rgba(233,30,140,0.25)' }}>
            <Scissors size={30} color="#e91e8c" strokeWidth={1.8} />
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: 'white' }}>{t('signup', 'title')}</h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, marginTop: 2 }}>{t('signup', 'subtitle')}</p>
        </div>
      </div>

      <div className="px-6 py-6 -mt-6 rounded-t-3xl bg-white flex-1">
        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl text-sm"
            style={{ background: '#fff0f0', color: '#d32f2f', border: '1px solid #ffcdd2' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="flex flex-col gap-4">
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#555', display: 'block', marginBottom: 6 }}>{t('signup', 'full_name')} *</label>
            <div className="relative">
              <input type="text" value={form.fullName} onChange={e => update('fullName', e.target.value)}
                placeholder={t('signup', 'placeholder_name')} className="w-full px-4 py-3.5 rounded-xl pl-11 outline-none transition-all"
                style={InputStyle} onFocus={e => e.target.style.borderColor = '#e91e8c'} onBlur={e => e.target.style.borderColor = '#e8e8e8'} />
              <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2" color="#9e9e9e" />
            </div>
          </div>

          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#555', display: 'block', marginBottom: 6 }}>{t('signup', 'email')} *</label>
            <input type="email" value={form.email} onChange={e => update('email', e.target.value)}
              placeholder="you@email.com" className="w-full px-4 py-3.5 rounded-xl outline-none transition-all"
              style={InputStyle} onFocus={e => e.target.style.borderColor = '#e91e8c'} onBlur={e => e.target.style.borderColor = '#e8e8e8'} />
          </div>

          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#555', display: 'block', marginBottom: 6 }}>{t('signup', 'phone')}</label>
            <div className="relative">
              <input type="tel" value={form.phone} onChange={e => update('phone', e.target.value)}
                placeholder={t('signup', 'placeholder_phone')} className="w-full px-4 py-3.5 rounded-xl pl-11 outline-none transition-all"
                style={InputStyle} onFocus={e => e.target.style.borderColor = '#e91e8c'} onBlur={e => e.target.style.borderColor = '#e8e8e8'} />
              <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2" color="#9e9e9e" />
            </div>
          </div>

          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#555', display: 'block', marginBottom: 6 }}>{t('signup', 'password')} *</label>
            <div className="relative">
              <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={e => update('password', e.target.value)}
                placeholder={t('signup', 'placeholder_password')} className="w-full px-4 py-3.5 rounded-xl pr-12 outline-none transition-all"
                style={InputStyle} onFocus={e => e.target.style.borderColor = '#e91e8c'} onBlur={e => e.target.style.borderColor = '#e8e8e8'} />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2" style={{ color: '#9e9e9e' }}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#555', display: 'block', marginBottom: 6 }}>{t('signup', 'confirm_password')} *</label>
            <input type="password" value={form.confirmPassword} onChange={e => update('confirmPassword', e.target.value)}
              placeholder={t('signup', 'placeholder_confirm')} className="w-full px-4 py-3.5 rounded-xl outline-none transition-all"
              style={InputStyle} onFocus={e => e.target.style.borderColor = '#e91e8c'} onBlur={e => e.target.style.borderColor = '#e8e8e8'} />
          </div>

          <button type="submit" disabled={loading}
            className="w-full py-4 rounded-full text-white font-bold text-base mt-2 transition-all"
            style={{ background: loading ? '#f9a0c8' : 'linear-gradient(135deg, #e91e8c 0%, #f06292 100%)', boxShadow: '0 4px 15px rgba(233,30,140,0.3)' }}>
            {loading ? t('signup', 'creating') : t('signup', 'btn')}
          </button>
        </form>

        {/* Language selector */}
        <div className="mt-4">
          <p style={{ fontSize: 12, fontWeight: 600, color: '#9e9e9e', marginBottom: 8, textAlign: 'center' }}>
            {t('signup', 'language_label')}
          </p>
          <div className="flex justify-center"><LanguageSelector compact /></div>
        </div>

        <div className="mt-5 text-center">
          <span style={{ color: '#9e9e9e', fontSize: 14 }}>{t('signup', 'have_account')} </span>
          <Link href="/login" style={{ color: '#e91e8c', fontWeight: 700, fontSize: 14 }}>{t('signup', 'log_in')}</Link>
        </div>
      </div>
    </div>
  )
}
