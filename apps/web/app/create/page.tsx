import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Nav from '../components/Nav'
import CreatePostForm from '../components/CreatePostForm'
export default async function CreatePage() { const supabase=await createClient(); const {data:{user}}=await supabase.auth.getUser(); if(!user) redirect('/login'); const {data:p}=await supabase.from('profiles').select('username').eq('id',user.id).single(); return <main className="shell"><header className="topbar"><div><h1>Mirror Gram</h1><p>Create</p></div><Nav username={p?.username}/></header><CreatePostForm/></main> }
