import './globals.css'
import type { Metadata } from 'next'
import MobileNav from './components/MobileNav'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Mirror Gram',
  description: 'Share what you see. Reflect who you are.',
  icons: { icon: '/mirror-gram-logo.jpg' },
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return <html lang="en"><body>{children}<MobileNav authenticated={!!user} /></body></html>
}