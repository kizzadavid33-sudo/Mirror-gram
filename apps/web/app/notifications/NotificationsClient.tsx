'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type N={id:string;type:string;message:string|null;created_at:string;read_at:string|null}
export default function NotificationsClient({userId, initial}:{userId:string;initial:N[]}){
 const s=createClient(); const [items,setItems]=useState(initial)
 useEffect(()=>{const ch=s.channel('notifications-'+userId).on('postgres_changes',{event:'INSERT',schema:'public',table:'notifications',filter:`user_id=eq.${userId}`},p=>setItems(v=>[p.new as N,...v])).subscribe();return()=>{s.removeChannel(ch)}},[userId,s])
 async function mark(id:string){const now=new Date().toISOString();const {error}=await s.from('notifications').update({read_at:now}).eq('id',id).eq('user_id',userId);if(!error)setItems(v=>v.map(n=>n.id===id?{...n,read_at:now}:n))}
 async function markAll(){const now=new Date().toISOString();const {error}=await s.from('notifications').update({read_at:now}).eq('user_id',userId).is('read_at',null);if(!error)setItems(v=>v.map(n=>({...n,read_at:n.read_at??now})))}
 const unread=items.filter(n=>!n.read_at).length
 return <div><div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}><strong>{unread?unread+' unread':'All caught up'}</strong>{unread>0&&<button className="secondary" onClick={markAll}>Mark all read</button>}</div><div className="list">{items.map(n=><button className={n.read_at?'item':'item unread'} key={n.id} onClick={()=>mark(n.id)}><strong>{n.type}</strong><span>{n.message}</span><time>{new Date(n.created_at).toLocaleString()}</time></button>)}{!items.length&&<div className="muted" style={{padding:20,textAlign:'center'}}>No notifications yet.</div>}</div></div>
}
