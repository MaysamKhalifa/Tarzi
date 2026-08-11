import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { EmailOtpType } from '@supabase/supabase-js'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next') ?? '/home'
  const urlError = searchParams.get('error')
  const urlErrorDescription = searchParams.get('error_description')

  // Supabase redirected back with an error (e.g. link expired, already used,
  // or scanned/consumed by an email client's link-prefetcher before the user
  // clicked it) — surface the real reason instead of a generic failure.
  if (urlError) {
    console.error('[auth/callback] Supabase returned an error:', urlError, urlErrorDescription)
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(urlErrorDescription || urlError)}`
    )
  }

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )

  // Preferred flow: token_hash + type (Supabase's recommended email-link
  // format). Verified via a stateless server-side call — works even if the
  // link is opened in a different browser/device/tab than the one used to
  // sign up, unlike the PKCE code flow below which requires a matching
  // code-verifier cookie from the original browser session.
  if (token_hash && type) {
    const { data, error } = await supabase.auth.verifyOtp({ type, token_hash })
    if (!error && data.user) {
      console.info(
        '[auth/callback] Verified via token_hash for', data.user.email,
        '— email_confirmed_at:', data.user.email_confirmed_at
      )
      return NextResponse.redirect(`${origin}${next}`)
    }
    console.error('[auth/callback] verifyOtp failed:', error?.status, error?.code, error?.message)
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(error?.message || 'verification-failed')}`
    )
  }

  // Fallback: PKCE code-exchange flow (used for OAuth, or if the Supabase
  // email template hasn't been updated to the token_hash format yet).
  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error && data.user) {
      console.info(
        '[auth/callback] Session established via code exchange for', data.user.email,
        '— email_confirmed_at:', data.user.email_confirmed_at
      )
      return NextResponse.redirect(`${origin}${next}`)
    }
    console.error('[auth/callback] exchangeCodeForSession failed:', error?.status, error?.code, error?.message)
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(error?.message || 'verification-failed')}`
    )
  }

  console.error('[auth/callback] No code or token_hash present in callback URL:', request.url)
  return NextResponse.redirect(`${origin}/login?error=verification-failed`)
}
