import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Nav from '../components/Nav'
import MessagesClient from '../components/MessagesClient'
export default async function MessagesPage(){const s=await createClient();const {data:{user}}=await s.auth.getUser();if(!user)redirect('/login');const {data:p}=await s.from('profiles').select('username').eq('id',user.id).single();return <main className="shell"><header className="topbar"><div><h1>Messages</h1><p>Private conversations with people you choose to contact.</p></div><Nav username={p?.username}/></header><MessagesClient userId={user.id}/></main>}