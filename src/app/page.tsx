import { redirect } from 'next/navigation'

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

  // redirect() must be called OUTSIDE try/catch
  // because Next.js redirects work by throwing internally
  redirect(isLoggedIn ? '/home' : '/login')
}
