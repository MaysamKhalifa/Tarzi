import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Scissors } from 'lucide-react'

export default async function RootPage() {
  let isLoggedIn = false

  try {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    isLoggedIn = !!user
  } catch {
    // Supabase unavailable — treat as logged out
    isLoggedIn = false
  }

  if (isLoggedIn) {
    redirect('/home')
  }

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', background: 'white' }}>
      {/* Pink hero */}
      <div
        style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: '56px 24px 48px',
          background: 'linear-gradient(160deg, #e91e8c 0%, #f06292 50%, #fce4ec 100%)',
        }}
      >
        <div
          style={{
            width: 96, height: 96, borderRadius: 28, background: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 20, boxShadow: '0 8px 30px rgba(233,30,140,0.3)',
          }}
        >
          <Scissors size={48} color="#e91e8c" strokeWidth={1.8} />
        </div>
        <h1 style={{ fontSize: 40, fontWeight: 800, color: 'white', letterSpacing: -0.5 }}>tarzi</h1>
        <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: 16, marginTop: 8, textAlign: 'center', maxWidth: 320 }}>
          Custom tailoring, delivered to your door
        </p>
      </div>

      {/* CTAs */}
      <div style={{ padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 420, width: '100%', margin: '0 auto' }}>
        <Link
          href="/signup"
          style={{
            width: '100%', padding: '16px', borderRadius: 999, textAlign: 'center',
            fontWeight: 700, fontSize: 15, color: 'white', textDecoration: 'none',
            background: 'linear-gradient(135deg, #e91e8c 0%, #f06292 100%)',
            boxShadow: '0 4px 14px rgba(233,30,140,0.25)',
          }}
        >
          Get Started
        </Link>
        <Link
          href="/login"
          style={{
            width: '100%', padding: '16px', borderRadius: 999, textAlign: 'center',
            fontWeight: 700, fontSize: 15, color: '#e91e8c', textDecoration: 'none',
            background: '#fce4ec',
          }}
        >
          Log In
        </Link>
      </div>

      {/* Footer: tailor entry point */}
      <div style={{ padding: '24px', textAlign: 'center', borderTop: '1px solid #f0f0f0' }}>
        <p style={{ fontSize: 13, color: '#9e9e9e', marginBottom: 10 }}>Are you a tailor?</p>
        <a
          href="https://tailors.tarzi.ae"
          style={{
            display: 'inline-block', padding: '12px 28px', borderRadius: 999,
            border: '1.5px solid #e91e8c', color: '#e91e8c', fontWeight: 700,
            fontSize: 14, textDecoration: 'none',
          }}
        >
          Join as a Tailor
        </a>
      </div>
    </div>
  )
}
