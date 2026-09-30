'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Post = { id: string; user_id: string; caption: string; created_at: string; username: string; display_name: string; mediaUrl?: string | null; mediaType?: string | null; likeCount: number; commentCount: number; liked: boolean; saved: boolean }

export default function PostCard({ post, canInteract = true }: { post: Post; canInteract?: boolean }) {
  const supabase = createClient()
  const [liked, setLiked] = useState(post.liked)
  const [saved, setSaved] = useState(post.saved)
  const [likes, setLikes] = useState(post.likeCount)
  const [comment, setComment] = useState('')
  const [comments, setComments] = useState(post.commentCount)
  const [busy, setBusy] = useState(false)

  async function toggleLike() {
    if (!canInteract || busy) return
    setBusy(true)
    if (liked) {
      await supabase.from('likes').delete().eq('post_id', post.id).eq('user_id', (await supabase.auth.getUser()).data.user?.id ?? '')
      setLiked(false); setLikes(v => Math.max(0, v - 1))
    } else {
      const uid = (await supabase.auth.getUser()).data.user?.id
      if (!uid) { setBusy(false); return }
      const { error } = await supabase.from('likes').insert({ post_id: post.id, user_id: uid })
      if (!error) { setLiked(true); setLikes(v => v + 1) }
    }
    setBusy(false)
  }

  async function toggleSave() {
    if (!canInteract || busy) return
    setBusy(true)
    const uid = (await supabase.auth.getUser()).data.user?.id
    if (!uid) return setBusy(false)
    if (saved) { await supabase.from('saved_posts').delete().eq('post_id', post.id).eq('user_id', uid); setSaved(false) }
    else { const { error } = await supabase.from('saved_posts').insert({ post_id: post.id, user_id: uid }); if (!error) setSaved(true) }
    setBusy(false)
  }

  async function addComment() {
    const body = comment.trim()
    if (!canInteract || !body || busy) return
    setBusy(true)
    const uid = (await supabase.auth.getUser()).data.user?.id
    if (uid) {
      const { error } = await supabase.from('comments').insert({ post_id: post.id, user_id: uid, body })
      if (!error) { setComment(''); setComments(v => v + 1) }
    }
    setBusy(false)
  }

  async function reportPost() {
    const uid = (await supabase.auth.getUser()).data.user?.id
    if (!uid) return
    const reason = window.prompt('Reason: spam, harassment, unsafe, privacy, impersonation, copyright, or other')
    if (!reason) return
    await supabase.from('reports').insert({ reporter_id: uid, post_id: post.id, reported_user_id: post.user_id, reason })
    window.alert('Thanks. Your report was submitted.')
  }

  return <article className="card post">
    <div className="post-head"><div><strong>@{post.username}</strong><span>{post.display_name}</span></div><button className="ghost" onClick={reportPost}>Report</button></div>
    {post.mediaUrl && (post.mediaType === 'video' ? <video className="post-media" controls playsInline src={post.mediaUrl} /> : <img className="post-media" src={post.mediaUrl} alt="Post media" />)}
    <div className="post-body"><p>{post.caption}</p><div className="actions"><button onClick={toggleLike} disabled={!canInteract}>{liked ? '♥' : '♡'} {likes}</button><button disabled>{comments} comments</button><button onClick={toggleSave} disabled={!canInteract}>{saved ? 'Saved' : 'Save'}</button></div><div className="comment-box"><input value={comment} onChange={e => setComment(e.target.value)} placeholder="Add a kind comment…" maxLength={1000}/><button onClick={addComment} disabled={!canInteract || !comment.trim()}>Post</button></div></div>
  </article>
}
