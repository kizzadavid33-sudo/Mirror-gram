'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Props = {
  post: {
    id: string
    user_id: string
    caption: string
    username: string
    display_name: string
    mediaUrl: string | null
    likeCount: number
    commentCount: number
    liked: boolean
    saved: boolean
  }
}

export default function HusieCard({ post }: Props) {
  const supabase = useMemo(() => createClient(), [])
  const [liked, setLiked] = useState(post.liked)
  const [likes, setLikes] = useState(post.likeCount)
  const [saved, setSaved] = useState(post.saved)
  const [busy, setBusy] = useState(false)

  async function toggleLike() {
    if (busy) return
    setBusy(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setBusy(false); return }
    if (liked) {
      const { error } = await supabase.from('likes').delete().eq('post_id', post.id).eq('user_id', user.id)
      if (!error) { setLiked(false); setLikes(v => Math.max(0, v - 1)) }
    } else {
      const { error } = await supabase.from('likes').insert({ post_id: post.id, user_id: user.id })
      if (!error) { setLiked(true); setLikes(v => v + 1) }
    }
    setBusy(false)
  }

  async function toggleSave() {
    if (busy) return
    setBusy(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setBusy(false); return }
    if (saved) {
      const { error } = await supabase.from('saved_posts').delete().eq('post_id', post.id).eq('user_id', user.id)
      if (!error) setSaved(false)
    } else {
      const { error } = await supabase.from('saved_posts').insert({ post_id: post.id, user_id: user.id })
      if (!error) setSaved(true)
    }
    setBusy(false)
  }

  return (
    <article className="husie-reel">
      {post.mediaUrl ? (
        <video className="husie-video" src={post.mediaUrl} controls playsInline loop preload="metadata" />
      ) : (
        <div className="husie-video husie-video-empty">Video unavailable</div>
      )}

      <div className="husie-shade" aria-hidden="true" />
      <div className="husie-caption">
        <Link href={'/profile/' + post.user_id} className="husie-author">
          <strong>@{post.username}</strong>
          {post.display_name && <span>{post.display_name}</span>}
        </Link>
        {post.caption && <p>{post.caption}</p>}
      </div>

      <div className="husie-actions">
        <button onClick={toggleLike} disabled={busy} aria-label="Like video">
          <span>{liked ? '♥' : '♡'}</span><small>{likes}</small>
        </button>
        <Link href={'/post/' + post.id} aria-label="View comments">
          <span>💬</span><small>{post.commentCount}</small>
        </Link>
        <button onClick={toggleSave} disabled={busy} aria-label="Save video">
          <span>{saved ? '🔖' : '☆'}</span><small>{saved ? 'Saved' : 'Save'}</small>
        </button>
      </div>
    </article>
  )
}
