import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import PostCard from '../../components/PostCard'

export const dynamic = 'force-dynamic'

export default async function PublicProfile({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const s = await createClient()
  const { data: { user } } = await s.auth.getUser()
  if (!user) notFound()

  const { data: p } = await s.from('profiles').select('*').eq('id', id).single()
  if (!p) notFound()

  const { data: posts } = await s
    .from('posts')
    .select('id,user_id,caption,created_at,profiles!posts_user_id_fkey(username,display_name),media!media_post_id_fkey(id,storage_path,media_type)')
    .eq('user_id', id)
    .order('created_at', { ascending: false })
    .limit(20)

  const ids = (posts ?? []).map(x => x.id)
  const { data: likes } = ids.length
    ? await s.from('likes').select('post_id,user_id').in('post_id', ids)
    : { data: [] as any[] }

  const view = await Promise.all((posts ?? []).map(async x => {
    const m = x.media?.[0]
    const url = m ? (await s.storage.from('post-media').createSignedUrl(m.storage_path, 3600)).data?.signedUrl ?? null : null

    return {
      id: x.id,
      user_id: x.user_id,
      caption: x.caption,
      created_at: x.created_at,
      username: p.username,
      display_name: p.display_name,
      mediaUrl: url,
      mediaType: m?.media_type ?? null,
      likeCount: (likes ?? []).filter(l => l.post_id === x.id).length,
      commentCount: 0,
      liked: (likes ?? []).some(l => l.post_id === x.id && l.user_id === user.id),
      saved: false,
    }
  }))

  return <main className="shell narrow">
    <Link href="/discover">← Discover</Link>
    <section className="card profile">
      <h1>@{p.username}</h1>
      <h2>{p.display_name}</h2>
      <span className="badge">{p.creator_status}</span>
      <p>{p.bio}</p>
    </section>
    {view.map(x => <PostCard key={x.id} post={x}/>)}
  </main>
}
