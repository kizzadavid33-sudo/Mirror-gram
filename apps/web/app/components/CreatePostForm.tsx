'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function CreatePostForm() {
  const supabase = createClient(); const router = useRouter()
  const [file, setFile] = useState<File | null>(null); const [caption, setCaption] = useState(''); const [visibility, setVisibility] = useState('public'); const [busy, setBusy] = useState(false); const [preview, setPreview] = useState<string | null>(null)
  function choose(f: File | undefined) { if (!f) return; if (!['image/','video/'].some(p => f.type.startsWith(p))) return alert('Choose an image or video.'); if (f.size > 50 * 1024 * 1024) return alert('Maximum file size is 50 MB.'); setFile(f); setPreview(URL.createObjectURL(f)) }
  async function publish() {
    if (!file) return alert('Choose a photo or video first.'); setBusy(true)
    const { data: { user } } = await supabase.auth.getUser(); if (!user) return router.push('/login')
    const ext = file.name.split('.').pop()?.toLowerCase() || 'bin'; const postId = crypto.randomUUID(); const path = `${user.id}/${postId}/media.${ext}`
    const upload = await supabase.storage.from('post-media').upload(path, file, { contentType: file.type, upsert: false })
    if (upload.error) { setBusy(false); return alert(upload.error.message) }
    const post = await supabase.from('posts').insert({ id: postId, user_id: user.id, caption: caption.trim(), visibility }).select('id').single()
    if (post.error) { await supabase.storage.from('post-media').remove([path]); setBusy(false); return alert(post.error.message) }
    const media = await supabase.from('media').insert({ post_id: postId, storage_path: path, media_type: file.type.startsWith('video/') ? 'video' : 'image', mime_type: file.type })
    if (media.error) { setBusy(false); return alert(media.error.message) }
    router.push('/'); router.refresh()
  }
  return <section className="card form-card"><h2>Create a post</h2><p className="muted">Share your work without revealing private or exact location information.</p><label className="dropzone">{preview ? (file?.type.startsWith('video/') ? <video src={preview} controls /> : <img src={preview} alt="Preview" />) : <span>Choose photo or video</span>}<input type="file" accept="image/*,video/*" onChange={e => choose(e.target.files?.[0])}/></label><textarea value={caption} onChange={e => setCaption(e.target.value)} maxLength={2200} placeholder="Write a caption…"/><select value={visibility} onChange={e => setVisibility(e.target.value)}><option value="public">Public</option><option value="followers">Followers</option><option value="private">Only me</option></select><button className="primary" onClick={publish} disabled={busy}>{busy ? 'Publishing…' : 'Publish'}</button></section>
}
