'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const links = [['/', '⌂', 'Home'], ['/discover', '⌕', 'Discover'], ['/create', '＋', 'Create'], ['/messages', '◌', 'Messages'], ['/notifications', '♧', 'Notifications'], ['/profile', '♙', 'Profile']]

export default function MobileNav({ authenticated }: { authenticated: boolean }) {
 const path=usePathname(); const [unread,setUnread]=useState(0); const s=createClient()
 useEffect(()=>{if(!authenticated)return;let ch:any;let mounted=true;(async()=>{const {data:{user}}=await s.auth.getUser();if(!user)return;const refresh=async()=>{const {count}=await s.from('notifications').select('id',{count:'exact',head:true}).eq('user_id',user.id).is('read_at',null);if(mounted)setUnread(count??0)};await refresh();ch=s.channel('mobile-notifications-'+user.id).on('postgres_changes',{event:'*',schema:'public',table:'notifications',filter:`user_id=eq.${user.id}`},refresh).subscribe()})();return()=>{mounted=false;if(ch)s.removeChannel(ch)}},[authenticated,s])
 if(!authenticated && path === '/') return null
 if (path === '/login' || path.startsWith('/husie')) return null
 return <nav className="mobile-bottom" aria-label="Mobile navigation">
   {links.map(([href,icon,label])=><Link key={href} href={href} className={path===href?'active':''}><span className="mobile-nav-icon">{icon}{label==='Notifications'&&unread>0&&<b className="notification-badge mobile-badge">{unread>99?'99+':unread}</b>}</span><span>{label}</span></Link>)}
 </nav>
}