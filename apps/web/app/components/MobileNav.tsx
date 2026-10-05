'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [['/', '⌂', 'Home'], ['/discover', '⌕', 'Discover'], ['/create', '＋', 'Create'], ['/messages', '◌', 'Messages'], ['/profile', '♙', 'Profile']]

export default function MobileNav({ authenticated }: { authenticated: boolean }) {
  const path = usePathname()
  if (!authenticated && path === '/') return null
  if (path === '/login') return null
  return <nav className="mobile-bottom" aria-label="Mobile navigation">
    {links.map(([href, icon, label]) => <Link key={href} href={href} className={path === href ? 'active' : ''}><span>{icon}</span><span>{label}</span></Link>)}
  </nav>
}