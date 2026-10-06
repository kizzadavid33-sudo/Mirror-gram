'use client'
import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import FollowButton from './FollowButton'

type Post = { id:string; user_id:string; caption:string; created_at:string; username:string; display_name:string; mediaUrl?:string|null; mediaType?:string|null; mediaPath?:string|null; mediaItems?:{id:string;storage_path:string;media_type:string;url:string|null}[]; avatarUrl?:string|null; likeCount:number; commentCount:number; liked:boolean; saved:boolean }
type Comment = { id:string; user_id:string; body:string; created_at:string; username?:string; display_name?:string }

export default function PostCard({ post, canInteract = true }: { post:Post; canInteract?:boolean }) {
  const supabase=useMemo(()=>createClient(),[])
  const replaceRef=useRef<HTMLInputElement>(null)
  const [liked,setLiked]=useState(post.liked),[reaction,setReaction]=useState<string|null>(post.liked?'like':null),[showReactions,setShowReactions]=useState(false),[saved,setSaved]=useState(post.saved),[likes,setLikes]=useState(post.likeCount),[comment,setComment]=useState(''),[comments,setComments]=useState(post.commentCount),[busy,setBusy]=useState(false),[currentUserId,setCurrentUserId]=useState<string|null>(null),[editing,setEditing]=useState(false),[caption,setCaption]=useState(post.caption),[deleteBusy,setDeleteBusy]=useState(false),[replaceBusy,setReplaceBusy]=useState(false),[showComments,setShowComments]=useState(false),[commentRows,setCommentRows]=useState<Comment[]>([]),[commentsLoading,setCommentsLoading]=useState(false),[commentsError,setCommentsError]=useState('')

  useEffect(()=>{supabase.auth.getUser().then(({data:{user}})=>setCurrentUserId(user?.id??null))},[supabase])
  const isOwner=currentUserId===post.user_id

  async function toggleLike(){if(!canInteract||busy)return;setBusy(true);const {data:{user}}=await supabase.auth.getUser();if(!user){setBusy(false);return};if(liked){const {error}=await supabase.from('likes').delete().eq('post_id',post.id).eq('user_id',user.id);if(!error){setLiked(false);setLikes(v=>Math.max(0,v-1))}}else{const {error}=await supabase.from('likes').insert({post_id:post.id,user_id:user.id});if(!error){setLiked(true);setLikes(v=>v+1)}}setBusy(false)}
  const reactions=[['like','👍'],['love','❤️'],['haha','😂'],['wow','😮'],['sad','😢'],['angry','😡'],['celebrate','🎉'],['support','💙']] as const
  async function chooseReaction(kind:string){if(!canInteract)return;const {data:{user}}=await supabase.auth.getUser();if(!user)return;const previous=reaction;if(previous===kind){const {error}=await (supabase as any).from('post_reactions').delete().eq('post_id',post.id).eq('user_id',user.id);if(!error){setReaction(null);setLiked(false);setLikes(v=>Math.max(0,v-1))}}else{const {error}=await (supabase as any).from('post_reactions').upsert({post_id:post.id,user_id:user.id,reaction:kind},{onConflict:'post_id,user_id'});if(!error){setReaction(kind);setLiked(kind==='like');if(!previous)setLikes(v=>v+1)}}setShowReactions(false)}
  async function toggleSave(){if(!canInteract||busy)return;setBusy(true);const {data:{user}}=await supabase.auth.getUser();if(!user){setBusy(false);return};if(saved){const {error}=await supabase.from('saved_posts').delete().eq('post_id',post.id).eq('user_id',user.id);if(!error)setSaved(false)}else{const {error}=await supabase.from('saved_posts').insert({post_id:post.id,user_id:user.id});if(!error)setSaved(true)}setBusy(false)}

  async function loadComments(){
    setCommentsLoading(true);setCommentsError('')
    const {data,error}=await supabase.from('comments').select('id,user_id,body,created_at').eq('post_id',post.id).order('created_at',{ascending:true}).limit(100)
    if(error){setCommentsError(error.message);setCommentsLoading(false);return}
    const rows=(data??[]) as Comment[]
    const ids=[...new Set(rows.map(c=>c.user_id).filter(Boolean))]
    let profiles:any[]=[]
    if(ids.length){
      const result=await supabase.from('profiles').select('id,username,display_name').in('id',ids)
      if(!result.error)profiles=result.data??[]
    }
    const byId=new Map(profiles.map(p=>[p.id,p]))
    setCommentRows(rows.map(c=>({...c,...(byId.get(c.user_id)||{})})))
    setComments(rows.length)
    setCommentsLoading(false)
  }
  async function toggleComments(){const next=!showComments;setShowComments(next);if(next)await loadComments()}

  async function addComment(){
    const body=comment.trim();if(!canInteract||!body||busy)return;setBusy(true)
    const {data:{user}}=await supabase.auth.getUser()
    if(user){
      const {data,error}=await supabase.from('comments').insert({post_id:post.id,user_id:user.id,body}).select('id,user_id,body,created_at').single()
      if(!error&&data){
        const profile=await supabase.from('profiles').select('id,username,display_name').eq('id',user.id).maybeSingle()
        setCommentRows(v=>[...v,{...(data as Comment),...(profile.data||{})}])
        setComment('');setComments(v=>v+1);setShowComments(true)
      }
    }
    setBusy(false)
  }
  async function reportPost(){const {data:{user}}=await supabase.auth.getUser();if(!user)return;const reason=window.prompt('Reason: spam, harassment, unsafe, privacy, impersonation, copyright, or other');if(!reason)return;await supabase.from('reports').insert({reporter_id:user.id,post_id:post.id,reported_user_id:post.user_id,reason})}

  async function saveCaption(){const next=caption.trim();if(!isOwner||next.length>2200)return;setBusy(true);const {error}=await supabase.from('posts').update({caption:next}).eq('id',post.id).eq('user_id',post.user_id);if(error)window.alert(error.message);else{setCaption(next);setEditing(false)}setBusy(false)}
  async function deletePost(){if(!isOwner||deleteBusy)return;if(!window.confirm('Delete this post permanently?'))return;setDeleteBusy(true);const {data:media}=await supabase.from('media').select('storage_path').eq('post_id',post.id);const {error:mediaError}=await supabase.from('media').delete().eq('post_id',post.id);if(mediaError){window.alert(mediaError.message);setDeleteBusy(false);return}const {error:postError}=await supabase.from('posts').delete().eq('id',post.id).eq('user_id',post.user_id);if(postError){window.alert(postError.message);setDeleteBusy(false);return}if(media?.length)await supabase.storage.from('post-media').remove(media.map(m=>m.storage_path));window.location.reload()}
  async function replaceMedia(file?:File){if(!isOwner||!file)return;if(!file.type.startsWith('image/')&&!file.type.startsWith('video/'))return window.alert('Choose an image or video.');if(file.size>50*1024*1024)return window.alert('Maximum file size is 50 MB.');setReplaceBusy(true);const {data:old}=await supabase.from('media').select('id,storage_path').eq('post_id',post.id).limit(1).maybeSingle();const ext=file.name.split('.').pop()?.toLowerCase()||'bin';const path=`${post.user_id}/${post.id}/media-${Date.now()}.${ext}`;const upload=await supabase.storage.from('post-media').upload(path,file,{contentType:file.type,upsert:false});if(upload.error){window.alert(upload.error.message);setReplaceBusy(false);return}const mediaType=file.type.startsWith('video/')?'video':'image';let result;if(old)result=await supabase.from('media').update({storage_path:path,media_type:mediaType,mime_type:file.type}).eq('id',old.id).eq('post_id',post.id);else result=await supabase.from('media').insert({post_id:post.id,storage_path:path,media_type:mediaType,mime_type:file.type});if(result.error){await supabase.storage.from('post-media').remove([path]);window.alert(result.error.message);setReplaceBusy(false);return}if(old?.storage_path)await supabase.storage.from('post-media').remove([old.storage_path]);window.location.reload()}

  return <article className="card post">
    <div className="post-head"><div className="post-author"><div className="post-author-avatar">{post.avatarUrl?<img src={post.avatarUrl} alt=""/>:<span>{(post.username||'U').charAt(0).toUpperCase()}</span>}</div><Link href={isOwner?'/profile':'/profile/'+post.user_id} className="post-author-link"><strong>@{post.username}</strong><span>{post.display_name}</span></Link>{currentUserId&&currentUserId!==post.user_id&&canInteract&&<FollowButton targetId={post.user_id}/>}</div>
      <div style={{display:'flex',gap:8,alignItems:'center'}}>{isOwner&&<details><summary className="ghost" style={{cursor:'pointer',listStyle:'none'}}>•••</summary><div style={{position:'absolute',zIndex:5,background:'#fff',border:'1px solid #dbe5f0',borderRadius:12,padding:8,boxShadow:'0 8px 24px rgba(0,0,0,.12)',display:'grid',gap:6}}><button className="ghost" onClick={()=>setEditing(true)}>✏️ Edit caption</button><button className="ghost" onClick={()=>replaceRef.current?.click()} disabled={replaceBusy}>{replaceBusy?'Replacing…':'🖼️ Replace media'}</button><button className="ghost" onClick={deletePost} disabled={deleteBusy}>{deleteBusy?'Deleting…':'🗑️ Delete post'}</button></div></details>}<button className="ghost" onClick={reportPost}>Report</button></div>
    </div>
    {editing?<div style={{display:'grid',gap:8,margin:'10px 0'}}><textarea value={caption} onChange={e=>setCaption(e.target.value)} maxLength={2200} autoFocus/><div style={{display:'flex',gap:8}}><button className="primary" onClick={saveCaption} disabled={busy}>{busy?'Saving…':'Save caption'}</button><button className="secondary" onClick={()=>{setCaption(post.caption);setEditing(false)}}>Cancel</button></div></div>:post.caption&&<p className="post-caption">{caption}</p>}
    <input ref={replaceRef} type="file" accept="image/*,video/*" onChange={e=>replaceMedia(e.target.files?.[0])} style={{display:'none'}}/>
    {post.mediaItems?.length ? <div className="post-media-gallery">{post.mediaItems.map((m,i)=>m.url&&(m.media_type==='video'?<video key={m.id||i} className="post-media" controls playsInline src={m.url}/>:<img key={m.id||i} className="post-media" src={m.url} alt={'Post media '+(i+1)}/>))}</div> : post.mediaUrl&&(post.mediaType==='video'?<video className="post-media" controls playsInline src={post.mediaUrl}/>:<img className="post-media" src={post.mediaUrl} alt="Post media"/>)}
    <div className="post-body">
      <div className="actions"><div className="reaction-wrap"><button onClick={()=>setShowReactions(v=>!v)} disabled={!canInteract}>{reaction?reactions.find(x=>x[0]===reaction)?.[1]:'👍'} {likes}</button>{showReactions&&<div className="reaction-picker">{reactions.map(r=><button key={r[0]} title={r[0]} onClick={()=>chooseReaction(r[0])}>{r[1]}</button>)}</div>}</div><button onClick={toggleLike} disabled={!canInteract}>{liked?'♥':'♡'} {likes}</button><button onClick={toggleComments}>{comments} comments</button><button onClick={toggleSave} disabled={!canInteract}>{saved?'Saved':'Save'}</button></div>
      {showComments&&<section style={{marginTop:12,display:'grid',gap:10}}>
        {commentsLoading&&<div className="muted">Loading comments…</div>}
        {commentsError&&<div style={{color:'#b42318'}}>Could not load comments: {commentsError}</div>}
        {!commentsLoading&&!commentsError&&commentRows.length===0&&<div className="muted">No comments yet. Be the first to comment.</div>}
        {!commentsLoading&&commentRows.map(c=><div key={c.id} style={{display:'flex',gap:10,alignItems:'flex-start',padding:'8px 0',borderBottom:'1px solid #edf1f5'}}>
          <div style={{width:36,height:36,borderRadius:'50%',background:'#e8eef5',display:'grid',placeItems:'center',fontWeight:700,flexShrink:0}}>{(c.username||c.display_name||'?').charAt(0).toUpperCase()}</div>
          <div style={{minWidth:0,flex:1}}><strong>@{c.username||'user'}</strong>{c.display_name&&<span className="muted"> · {c.display_name}</span>}<div style={{marginTop:3,whiteSpace:'pre-wrap',wordBreak:'break-word'}}>{c.body}</div><small className="muted">{new Date(c.created_at).toLocaleString()}</small></div>
        </div>)}
      </section>}
      <div className="comment-box"><input value={comment} onChange={e=>setComment(e.target.value)} placeholder="Add a kind comment…" maxLength={1000}/><button onClick={addComment} disabled={!canInteract||!comment.trim()}>Post</button></div>
    </div>
  </article>
}