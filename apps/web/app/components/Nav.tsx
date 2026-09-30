'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Brand from './Brand'

const links = [
  ['/', '⌂', 'Home'], ['/discover', '⌕', 'Discover'], ['/create', '＋', 'Create'], ['/messages', '◌', 'Messages'],
  ['/notifications', '♧', 'Notifications'], ['/profile', '♙', 'Profile'], ['/studio', '✦', 'Creator Studio'],
  ['/map', '⌖', 'Map & Events'], ['/live', '◉', 'Live'], ['/safety', '◇', 'Safety'],
]
export default function Nav({ username }: { username?: string | null }) {
  const path = usePathname()
  return <aside className="app-nav">
    <Brand />
    <nav className="nav-list">
      {links.map(([href, icon, label]) => <Link key={href} className={path === href ? 'active' : ''} href={href}><span className="nav-icon">{icon}</span><span>{label === 'Profile' && username ? `@${username}` : label}</span></Link>)}
    </nav>
  </aside>
}
