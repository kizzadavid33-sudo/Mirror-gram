import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import Nav from '../components/Nav'
import NotificationsClient from './NotificationsClient'
export const dynamic='force-dynamic'
export default async function NotificationsPage(){const s=await createClient();const {data:{user}}=await s.auth.getUser();if(!user)return <main className="shell"><Link href="/login">Log in</Link></main>;const {data}=await s.from('notifications').select('id,type,message,created_at,read_at').eq('user_id',user.id).order('created_at',{ascending:false}).limit(100);return <main className="shell narrow"><header className="topbar"><div><h1>Notifications</h1><p>Likes, comments, follows and messages.</p></div><Nav/></header><section className="card"><NotificationsClient userId={user.id} initial={data??[]}/></section></main>}
