import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import Nav from './components/Nav'
import PostCard from './components/PostCard'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return <main className="shell"><header className="hero"><div><h1>MIRROR GRAM</h1><p>Create. Connect. Be discovered.</p></div><Link className="primary link-button" href="/login">Get started</Link></header><section className="card hero-card"><h2>A safer creator-first social space.</h2><p>Post photos and videos, discover creators, message people you follow, and build your creator journey.</p><div className="chips"><span>Blue + white</span><span>Creator tools</span><span>Privacy controls</span><span>Reporting</span></div></section></main>
  const { data: profile } = await supabase.from('profiles').select('username').eq('id', user.id).single()
  const { data: posts } = await supabase.from('posts').select('id,user_id,caption,created_at,profiles(username,display_name),media(id,storage_path,media_type)').order('created_at', { ascending: false }).limit(20)
  const postIds = (posts ?? []).map(p => p.id)
  const [{ data: likes }, { data: comments }, { data: saved }] = await Promise.all([
    postIds.length ? supabase.from('likes').select('post_id,user_id').in('post_id', postIds) : Promise.resolve({ data: [] as any[] }),
    postIds.length ? supabase.from('comments').select('post_id').in('post_id', postIds) : Promise.resolve({ data: [] as any[] }),
    postIds.length ? supabase.from('saved_posts').select('post_id').eq('user_id', user.id).in('post_id', postIds) : Promise.resolve({ data: [] as any[] }),
  ])
  const viewPosts = await Promise.all((posts ?? []).map(async p => { const m = p.media?.[0]; let url = null; if (m) url = (await supabase.storage.from('post-media').createSignedUrl(m.storage_path, 3600)).data?.signedUrl ?? null; return { id:p.id,user_id:p.user_id,caption:p.caption,created_at:p.created_at,username:(p.profiles as any)?.username ?? 'user',display_name:(p.profiles as any)?.display_name ?? '',mediaUrl:url,mediaType:m?.media_type ?? null,likeCount:(likes ?? []).filter(x=>x.post_id===p.id).length,commentCount:(comments ?? []).filter(x=>x.post_id===p.id).length,liked:(likes ?? []).some(x=>x.post_id===p.id&&x.user_id===user.id),saved:(saved ?? []).some(x=>x.post_id===p.id)} }))
  return <main className="shell"><Nav username={profile?.username}/><header className="topbar"><div><h1>Your feed</h1><p>Share what you see. Reflect who you are.</p></div></header><div className="feed-layout"><section><div className="card stories"><div className="story"><div className="story-avatar"><div>+</div></div><b>Your Story</b></div><div className="story"><div className="story-avatar"><div>AT</div></div><span>@alex_travel</span></div><div className="story"><div className="story-avatar"><div>NV</div></div><span>@nature_vibes</span></div><div className="story"><div className="story-avatar"><div>FG</div></div><span>@foodie_gram</span></div><div className="story"><div className="story-avatar"><div>LF</div></div><span>@lifestyle</span></div></div><section><div className="section-title"><h2>Your feed</h2><Link href="/create">+ Create</Link></div>{viewPosts.length ? viewPosts.map(p => <PostCard key={p.id} post={p}/>) : <div className="card empty"><h3>No posts yet</h3><p>Follow creators or publish your first post.</p><Link className="primary link-button" href="/create">Create your first post</Link></div>}</section></section><aside className="card side"><strong>V3.1</strong><h3>Creator safety first</h3><p>Keep exact addresses and private locations out of posts. Use the report and block controls when something feels unsafe.</p><Link href="/safety">Safety Center →</Link></aside></div></main>
}
