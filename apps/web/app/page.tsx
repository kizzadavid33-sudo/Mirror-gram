import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import Nav from './components/Nav'
import PostCard from './components/PostCard'
import StoryBar from './components/StoryBar'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return <main className="shell"><header className="hero"><div><h1>MIRROR GRAM</h1><p>Create. Connect. Be discovered.</p></div><Link className="primary link-button" href="/login">Get started</Link></header><section className="card hero-card"><h2>A safer creator-first social space.</h2><p>Post photos and videos, discover creators, message people you follow, and build your creator journey.</p><div className="chips"><span>Blue + white</span><span>Creator tools</span><span>Privacy controls</span><span>Reporting</span></div></section></main>
  }

  const { data: profile } = await supabase.from('profiles').select('username').eq('id', user.id).single()

  const { data: posts, error: postsError } = await supabase
    .from('posts')
    .select('id,user_id,caption,created_at,profiles!posts_user_id_fkey(username,display_name,avatar_path),media!media_post_id_fkey(id,storage_path,media_type)')
    .order('created_at', { ascending: false })
    .limit(60)

  // Mix accounts so one creator's posting burst does not fill the whole feed.
  // Each creator keeps newest-first ordering, then posts are interleaved round-robin.
  const grouped = new Map<string, any[]>()
  for (const post of (posts ?? [])) {
    const list = grouped.get(post.user_id) ?? []
    list.push(post)
    grouped.set(post.user_id, list)
  }
  const queues = Array.from(grouped.values())
  const mixedPosts: any[] = []
  let round = 0
  while (mixedPosts.length < 30 && queues.some(q => q.length)) {
    for (const queue of queues) {
      if (queue.length && mixedPosts.length < 30) mixedPosts.push(queue.shift())
    }
    round++
  }

  const postIds = mixedPosts.map(p => p.id)

  const [{ data: likes }, { data: comments }, { data: saved }] = await Promise.all([
    postIds.length ? supabase.from('likes').select('post_id,user_id').in('post_id', postIds) : Promise.resolve({ data: [] as any[] }),
    postIds.length ? supabase.from('comments').select('post_id').in('post_id', postIds) : Promise.resolve({ data: [] as any[] }),
    postIds.length ? supabase.from('saved_posts').select('post_id').eq('user_id', user.id).in('post_id', postIds) : Promise.resolve({ data: [] as any[] }),
  ])

  const db = supabase as any
  const { data: rawStories } = await db
    .from('stories')
    .select('id,user_id,storage_path,media_type,profiles!stories_user_id_fkey(username,display_name,avatar_path)')
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(30)

  const initialStories = await Promise.all((rawStories ?? []).map(async (story: any) => {
    const signed = await supabase.storage.from('stories').createSignedUrl(story.storage_path, 86400)
    const [{ data: storyLikes }, { count: storyComments }] = await Promise.all([
      supabase.from('story_likes').select('user_id').eq('story_id', story.id),
      supabase.from('story_comments').select('*', { count: 'exact', head: true }).eq('story_id', story.id),
    ])
    return {
      id: story.id,
      user_id: story.user_id,
      username: story.user_id === user.id ? 'you' : (story.profiles?.username ?? 'user'),
      display_name: story.user_id === user.id ? 'Your Story' : (story.profiles?.display_name ?? ''),
      avatarUrl: story.profiles?.avatar_path ? ((await supabase.storage.from('avatars').createSignedUrl(story.profiles.avatar_path, 3600)).data?.signedUrl ?? null) : null,
      mediaUrl: signed.data?.signedUrl ?? '',
      mediaType: story.media_type,
      likeCount: storyLikes?.length ?? 0,
      liked: (storyLikes ?? []).some((x: any) => x.user_id === user.id),
      commentCount: storyComments ?? 0,
    }
  }))

  const viewPosts = await Promise.all(mixedPosts.map(async p => {
    const m = p.media?.[0]
    let url = null
    if (m) {
      const signed = await supabase.storage.from('post-media').createSignedUrl(m.storage_path, 3600)
      url = signed.data?.signedUrl ?? null
    }

    return {
      id: p.id,
      user_id: p.user_id,
      caption: p.caption,
      created_at: p.created_at,
      username: (p.profiles as any)?.username ?? 'user',
      display_name: (p.profiles as any)?.display_name ?? '',
      mediaUrl: url,
      mediaType: m?.media_type ?? null,
      avatarUrl: (p.profiles as any)?.avatar_path ? ((await supabase.storage.from('avatars').createSignedUrl((p.profiles as any).avatar_path, 3600)).data?.signedUrl ?? null) : null,
      likeCount: (likes ?? []).filter(x => x.post_id === p.id).length,
      commentCount: (comments ?? []).filter(x => x.post_id === p.id).length,
      liked: (likes ?? []).some(x => x.post_id === p.id && x.user_id === user.id),
      saved: (saved ?? []).some(x => x.post_id === p.id),
    }
  }))

  return <main className="shell">
    <Nav username={profile?.username}/>
    <header className="home-blue-band"><div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:16,flexWrap:"wrap"}}><div><h1>Your feed</h1><p>Share what you see. Reflect who you are.</p></div><div style={{display:"flex",gap:8,flexWrap:"wrap"}}><Link className="secondary" href="/husie">Husie 🎬</Link><Link className="secondary" href="/map">Map & Events 🗺️</Link></div></div></header>
    <div className="feed-layout">
      <section>
        <StoryBar initialStories={initialStories.filter((story: any) => story.mediaUrl)} />
        {postsError && <div className="story-error">We couldn't load the feed right now. Please refresh and try again.</div>}
        <section>
          <div className="section-title"><h2>Your feed</h2><Link href="/create">+ Create</Link></div>
          {viewPosts.length ? viewPosts.map(p => <PostCard key={p.id} post={p}/>) : <div className="card empty"><h3>No posts yet</h3><p>Follow creators or publish your first post.</p><Link className="primary link-button" href="/create">Create your first post</Link></div>}
        </section>
      </section>
      <aside className="card side"><strong>V3.1</strong><h3>Creator safety first</h3><p>Keep exact addresses and private locations out of posts. Use the report and block controls when something feels unsafe.</p><Link href="/safety">Safety Center →</Link></aside>
    </div>
  </main>
}
