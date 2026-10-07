'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Brand from './Brand'

const links = [
  ['/', '⌂', 'Home'], ['/discover', '⌕', 'Discover'], ['/create', '＋', 'Create'], ['/messages', '◌', 'Messages'],
  ['/notifications', '♧', 'Notifications'], ['/settings', '⚙', 'Settings'], ['/profile', '♙', 'Profile'], ['/studio', '✦', 'Creator Studio'],
  ['/map', '⌖', 'Map & Events'], ['/live', '◉', 'Live'], ['/safety', '◇', 'Safety'],
]
export default function Nav({ username }: { username?: string | null }) {
  const path = usePathname(); const [unread,setUnread]=useState(0); const supabase=createClient()
  useEffect(()=>{let channel:any;let mounted=true;(async()=>{const {data:{user}}=await supabase.auth.getUser();if(!user)return;const refresh=async()=>{const {count}=await supabase.from('notifications').select('id',{count:'exact',head:true}).eq('user_id',user.id).is('read_at',null);if(mounted)setUnread(count??0)};await refresh();channel=supabase.channel('nav-notifications-'+user.id).on('postgres_changes',{event:'INSERT',schema:'public',table:'notifications',filter:`user_id=eq.${user.id}`},()=>refresh()).on('postgres_changes',{event:'UPDATE',schema:'public',table:'notifications',filter:`user_id=eq.${user.id}`},()=>refresh()).subscribe();})();return()=>{mounted=false;if(channel)supabase.removeChannel(channel)}},[supabase])
  return <aside className="app-nav">
    <Brand />
    <nav className="nav-list">
      {links.map(([href, icon, label]) => <Link key={href} className={path === href ? 'active' : ''} href={href}><span className="nav-icon">{icon}</span><span>{label === 'Profile' && username ? `@${username}` : label}{label==='Notifications'&&unread>0&&<b className="notification-badge">{unread>99?'99+':unread}</b>}</span></Link>)}
    </nav>
  </aside>
}
