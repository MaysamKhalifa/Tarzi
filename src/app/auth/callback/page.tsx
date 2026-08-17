'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useLanguage } from '@/lib/context/LanguageContext'

type Status = 'loading' | 'success' | 'error'

export default function AuthCallbackPage() {
  const router = useRouter()
  const { t, isRTL } = useLanguage()
  const [status, setStatus] = useState<Status>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const supabase = createClient()

    const handle = async () => {
      try {
        const url = new URL(window.location.href)

        // ── Supabase reported an error directly (expired/used link, etc.) ──
        const urlError = url.searchParams.get('error')
        const urlErrorDesc = url.searchParams.get('error_description')
        if (urlError) {
          console.error('[auth/callback] Supabase returned an error:', urlError, urlErrorDesc)
          setStatus('error')
          setMessage(urlErrorDesc || urlError)
          return
        }

        // ── token_hash + type: Supabase's stateless confirmation format ──
        // (only present if the email template was customized to use it)
        const tokenHash = url.searchParams.get('token_hash')
        const otpType = url.searchParams.get('type') as
          | 'signup' | 'email' | 'recovery' | 'invite' | 'magiclink' | 'email_change' | null
        if (tokenHash && otpType) {
          const { error: verifyError } = await supabase.auth.verifyOtp({ type: otpType, token_hash: tokenHash })
          if (verifyError) {
            console.error('[auth/callback] verifyOtp failed:', verifyError.status, verifyError.code, verifyError.message)
            setStatus('error')
            setMessage(verifyError.message)
            return
          }
        }

        // ── PKCE code flow: kept for backwards compatibility with any
        // already-sent emails/other flows. Requires the code-verifier from
        // the original signup browser, so it can still fail cross-device —
        // that's why the client is now configured for implicit flow instead,
        // which is handled below via the hash-token branch.
        const code = url.searchParams.get('code')
        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
          if (exchangeError) {
            console.error('[auth/callback] Code exchange failed:', exchangeError.status, exchangeError.code, exchangeError.message)
          }
        }

        // ── Implicit flow: hash tokens (#access_token=...) are detected
        // and applied automatically by the SDK (detectSessionInUrl: true)
        // as soon as the client is created above — poll getSession() to
        // pick that up, and to confirm the branches above worked too.
        let session = null
        for (let i = 0; i < 10; i++) {
          const { data } = await supabase.auth.getSession()
          if (data.session) { session = data.session; break }
          await new Promise(r => setTimeout(r, 500))
        }

        if (!session) {
          console.error('[auth/callback] No session established after verification attempt for url:', window.location.href)
          setStatus('error')
          setMessage(t('auth', 'failed_sub'))
          return
        }

        console.info(
          '[auth/callback] Session established for', session.user.email,
          '— email_confirmed_at:', session.user.email_confirmed_at
        )

        setStatus('success')
        await new Promise(r => setTimeout(r, 1200))
        router.replace('/home')

      } catch (err) {
        console.error('[auth/callback] Unexpected error:', err)
        setStatus('error')
        setMessage(t('auth', 'failed_sub'))
      }
    }

    handle()
  }, [router, t])

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      className="min-h-dvh flex flex-col items-center justify-center bg-white px-8 text-center"
    >
      {status === 'loading' && (
        <>
          <div className="w-22 h-22 rounded-2xl flex items-center justify-center mb-6"
            style={{ width: 88, height: 88, background: 'linear-gradient(135deg, #fce4ec, #f8bbd0)' }}>
            <Loader2 size={40} color="#e91e8c" className="animate-spin" />
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#1a1a1a', marginBottom: 10 }}>
            {t('auth', 'verifying')}
          </h2>
          <p style={{ fontSize: 14, color: '#9e9e9e', lineHeight: 1.6 }}>
            {t('auth', 'please_wait')}
          </p>
        </>
      )}

      {status === 'success' && (
        <>
          <div className="rounded-2xl flex items-center justify-center mb-6"
            style={{ width: 88, height: 88, background: '#e8f5e9' }}>
            <CheckCircle size={44} color="#2e7d32" />
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#1a1a1a', marginBottom: 10 }}>
            {t('auth', 'verified_title')}
          </h2>
          <p style={{ fontSize: 14, color: '#616161', lineHeight: 1.6 }}>
            {t('auth', 'verified_sub')}
          </p>
        </>
      )}

      {status === 'error' && (
        <>
          <div className="rounded-2xl flex items-center justify-center mb-6"
            style={{ width: 88, height: 88, background: '#fff0f0' }}>
            <XCircle size={44} color="#d32f2f" />
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#1a1a1a', marginBottom: 10 }}>
            {t('auth', 'failed_title')}
          </h2>
          <p style={{ fontSize: 14, color: '#757575', lineHeight: 1.6, marginBottom: 28 }}>
            {message || t('auth', 'failed_sub')}
          </p>
          <button
            onClick={() => router.replace('/login')}
            className="w-full py-4 rounded-full text-white font-bold text-base"
            style={{ background: 'linear-gradient(135deg, #e91e8c, #f06292)', boxShadow: '0 4px 14px rgba(233,30,140,0.25)' }}>
            {t('auth', 'back_signin')}
          </button>
        </>
      )}
    </div>
  )
}
