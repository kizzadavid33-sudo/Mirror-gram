'use client'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import FollowButton from './FollowButton'

type Post = { id:string; user_id:string; caption:string; created_at:string; username:string; display_name:string; mediaUrl?:string|null; mediaType?:string|null; likeCount:number; commentCount:number; liked:boolean; saved:boolean }

export default function PostCard({ post, canInteract = true }: { post:Post; canInteract?:boolean }) {
  const supabase=useMemo(()=>createClient(),[])
  const [liked,setLiked]=useState(post.liked),[reaction,setReaction]=useState<string|null>(post.liked?'like':null),[showReactions,setShowReactions]=useState(false),[saved,setSaved]=useState(post.saved),[likes,setLikes]=useState(post.likeCount),[comment,setComment]=useState(''),[comments,setComments]=useState(post.commentCount),[busy,setBusy]=useState(false),[currentUserId,setCurrentUserId]=useState<string|null>(null)

  useEffect(()=>{supabase.auth.getUser().then(({data:{user}})=>setCurrentUserId(user?.id??null))},[supabase])

  async function toggleLike(){if(!canInteract||busy)return;setBusy(true);const {data:{user}}=await supabase.auth.getUser();if(!user){setBusy(false);return};if(liked){const {error}=await supabase.from('likes').delete().eq('post_id',post.id).eq('user_id',user.id);if(!error){setLiked(false);setLikes(v=>Math.max(0,v-1))}}else{const {error}=await supabase.from('likes').insert({post_id:post.id,user_id:user.id});if(!error){setLiked(true);setLikes(v=>v+1)}}setBusy(false)}

  const reactions=[['like','👍'],['love','❤️'],['haha','😂'],['wow','😮'],['sad','😢'],['angry','😡'],['celebrate','🎉'],['support','💙']] as const
  async function chooseReaction(kind:string){if(!canInteract)return;const {data:{user}}=await supabase.auth.getUser();if(!user)return;const previous=reaction;if(previous===kind){const {error}=await supabase.from('post_reactions').delete().eq('post_id',post.id).eq('user_id',user.id);if(!error){setReaction(null);setLiked(false);setLikes(v=>Math.max(0,v-1))}}else{const {error}=await supabase.from('post_reactions').upsert({post_id:post.id,user_id:user.id,reaction:kind},{onConflict:'post_id,user_id'});if(!error){setReaction(kind);setLiked(kind==='like');if(!previous)setLikes(v=>v+1)}}setShowReactions(false)}
  async function toggleSave(){if(!canInteract||busy)return;setBusy(true);const {data:{user}}=await supabase.auth.getUser();if(!user){setBusy(false);return};if(saved){const {error}=await supabase.from('saved_posts').delete().eq('post_id',post.id).eq('user_id',user.id);if(!error)setSaved(false)}else{const {error}=await supabase.from('saved_posts').insert({post_id:post.id,user_id:user.id});if(!error)setSaved(true)}setBusy(false)}
  async function addComment(){const body=comment.trim();if(!canInteract||!body||busy)return;setBusy(true);const {data:{user}}=await supabase.auth.getUser();if(user){const {error}=await supabase.from('comments').insert({post_id:post.id,user_id:user.id,body});if(!error){setComment('');setComments(v=>v+1)}}setBusy(false)}
  async function reportPost(){const {data:{user}}=await supabase.auth.getUser();if(!user)return;const reason=window.prompt('Reason: spam, harassment, unsafe, privacy, impersonation, copyright, or other');if(!reason)return;await supabase.from('reports').insert({reporter_id:user.id,post_id:post.id,reported_user_id:post.user_id,reason});window.alert('Thanks. Your report was submitted.')}

  return <article className="card post">
    <div className="post-head"><div className="post-author">
      <Link href={currentUserId===post.user_id?'/profile':'/profile/'+post.user_id} className="post-author-link"><strong>@{post.username}</strong><span>{post.display_name}</span></Link>
      {currentUserId&&currentUserId!==post.user_id&&canInteract&&<FollowButton targetId={post.user_id}/>}
    </div><button className="ghost" onClick={reportPost}>Report</button></div>
    {post.mediaUrl&&(post.mediaType==='video'?<video className="post-media" controls playsInline src={post.mediaUrl}/>:<img className="post-media" src={post.mediaUrl} alt="Post media"/>)}
    <div className="post-body"><p>{post.caption}</p><div className="actions"><div className="reaction-wrap"><button onClick={()=>setShowReactions(v=>!v)} disabled={!canInteract}>{reaction?reactions.find(x=>x[0]===reaction)?.[1]:'👍'} {likes}</button>{showReactions&&<div className="reaction-picker">{reactions.map(r=><button key={r[0]} title={r[0]} onClick={()=>chooseReaction(r[0])}>{r[1]}</button>)}</div>}</div><button onClick={toggleLike} disabled={!canInteract}>{liked?'♥':'♡'} {likes}</button><button disabled>{comments} comments</button><button onClick={toggleSave} disabled={!canInteract}>{saved?'Saved':'Save'}</button></div><div className="comment-box"><input value={comment} onChange={e=>setComment(e.target.value)} placeholder="Add a kind comment…" maxLength={1000}/><button onClick={addComment} disabled={!canInteract||!comment.trim()}>Post</button></div></div>
  </article>
}