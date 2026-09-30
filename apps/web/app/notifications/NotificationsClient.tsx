'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type N={id:string;type:string;message:string|null;created_at:string;read_at:string|null}
export default function NotificationsClient({userId, initial}:{userId:string;initial:N[]}){
 const s=createClient(); const [items,setItems]=useState(initial)
 useEffect(()=>{const ch=s.channel('notifications').on('postgres_changes',{event:'INSERT',schema:'public',table:'notifications',filter:`user_id=eq.${userId}`},p=>setItems(v=>[p.new as N,...v])).subscribe();return()=>{s.removeChannel(ch)}},[userId])
 async function mark(id:string){await s.from('notifications').update({read_at:new Date().toISOString()}).eq('id',id).eq('user_id',userId);setItems(v=>v.map(n=>n.id===id?{...n,read_at:new Date().toISOString()}:n))}
 return <div className="list">{items.map(n=><button className={n.read_at?'item':'item unread'} key={n.id} onClick={()=>mark(n.id)}><strong>{n.type}</strong><span>{n.message}</span><time>{new Date(n.created_at).toLocaleString()}</time></button>)}</div>
}
