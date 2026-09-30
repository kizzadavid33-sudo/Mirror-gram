import './globals.css'
import type { Metadata } from 'next'
import MobileNav from './components/MobileNav'

export const metadata: Metadata = {
  title: 'Mirror Gram',
  description: 'Share what you see. Reflect who you are.',
  icons: { icon: '/mirror-gram-logo.jpg' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}<MobileNav /></body></html>
}
