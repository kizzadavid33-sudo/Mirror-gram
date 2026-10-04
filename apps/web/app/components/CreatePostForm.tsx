'use client'
import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function CreatePostForm() {
  const supabase = createClient(); const router = useRouter()
  const [file, setFile] = useState<File | null>(null); const [live, setLive] = useState(false); const [liveError, setLiveError] = useState(''); const uploadRef = useRef<HTMLInputElement>(null); const cameraRef = useRef<HTMLInputElement>(null); const [caption, setCaption] = useState(''); const [visibility, setVisibility] = useState('public'); const [busy, setBusy] = useState(false); const [preview, setPreview] = useState<string | null>(null)
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
  return <section className="card form-card"><h2>Create</h2><p className="muted">Share a photo or video with Mirror Gram.</p><div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10}}><button type="button" className="primary" onClick={()=>cameraRef.current?.click()}>📷 Camera</button><button type="button" className="secondary" onClick={()=>uploadRef.current?.click()}>⬆️ Upload</button><button type="button" className="secondary" onClick={()=>{setLive(true);setLiveError('Live broadcasting needs a streaming service connection before viewers can join.')}}>🔴 Live</button></div><input ref={cameraRef} type="file" accept="image/*,video/*" capture="environment" onChange={e=>choose(e.target.files?.[0])} style={{position:'absolute',width:1,height:1,opacity:0.01,pointerEvents:'none'}}/><input ref={uploadRef} type="file" accept="image/*,video/*" onChange={e=>choose(e.target.files?.[0])} style={{position:'absolute',width:1,height:1,opacity:0.01,pointerEvents:'none'}}/>{live&&<div style={{padding:12,borderRadius:10,background:'#fff4f4',border:'1px solid #fecaca',color:'#991b1b'}}><strong>🔴 Live</strong><div style={{marginTop:5}}>{liveError}</div><button type="button" className="secondary" style={{marginTop:10}} onClick={()=>setLive(false)}>Close</button></div>}<label className="dropzone">{preview ? (file?.type.startsWith('video/') ? <video src={preview} controls /> : <img src={preview} alt="Preview" />) : <span>Choose photo or video</span>}</label><textarea value={caption} onChange={e=>setCaption(e.target.value)} maxLength={2200} placeholder="Write a caption…"/><select value={visibility} onChange={e=>setVisibility(e.target.value)}><option value="public">Public</option><option value="followers">Followers</option><option value="private">Only me</option></select><button className="primary" onClick={publish} disabled={busy}>{busy ? 'Publishing…' : 'Publish'}</button></section>
}
