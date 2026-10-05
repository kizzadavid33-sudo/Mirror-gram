import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import Nav from '../components/Nav'
import FollowButton from '../components/FollowButton'

export const dynamic = 'force-dynamic'

export default async function DiscoverPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return <main className="shell"><Link href="/login">Log in</Link></main>
  const q = ((await searchParams).q ?? '').trim().toLowerCase()
  let query = supabase.from('profiles').select('id,username,display_name,bio,creator_status,is_private').neq('id', user.id).order('created_at', { ascending: false }).limit(30)
  if (q) query = query.or(`username.ilike.%${q}%,display_name.ilike.%${q}%`)
  const { data: profiles } = await query
  const ids = (profiles ?? []).map(p => p.id)
  const { data: follows } = ids.length ? await supabase.from('follows').select('following_id').eq('follower_id', user.id).in('following_id', ids) : { data: [] as { following_id: string }[] }
  const following = new Set((follows ?? []).map(f => f.following_id))
  return <main className="shell"><header className="topbar"><div><h1>Discover</h1><p>Find creators and communities.</p></div><Nav /></header>
    <form className="card searchbar" action="/discover" method="get">
      <input name="q" defaultValue={q} placeholder="Search usernames or names…" aria-label="Search usernames or names" />
      <button type="submit" className="primary">Search</button>
    </form>
    <section className="grid creators">{(profiles ?? []).map(p => <article className="card creator" key={p.id}><span className="badge">{p.creator_status}</span><h3>@{p.username}</h3><strong>{p.display_name}</strong><p>{p.bio || 'Creator on Mirror Gram.'}</p><div className="actions"><Link href={`/profile/${p.id}`}>View profile</Link><FollowButton targetId={p.id} initialFollowing={following.has(p.id)}/></div></article>)}</section>
    {q && !(profiles ?? []).length && <div className="card empty"><h3>No results found</h3><p>Try another username or display name.</p></div>}
  </main>
}