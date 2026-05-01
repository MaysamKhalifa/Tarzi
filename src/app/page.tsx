import { redirect } from 'next/navigation'

export default async function RootPage() {
  // Dynamic import to avoid build-time Supabase crash
  const { createClient } = await import('@/lib/supabase/server')
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) redirect('/home')
  } catch {
    // env vars not available at build time — redirect to login
  }
  redirect('/login')
}
