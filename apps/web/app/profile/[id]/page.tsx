import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import PostCard from '../../components/PostCard'
import FollowButton from '../../components/FollowButton'

export const dynamic='force-dynamic'

export default async function PublicProfile({params}:{params:Promise<{id:string}>}){
 const {id}=await params
 const s=await createClient()
 const {data:{user}}=await s.auth.getUser()
 if(!user)notFound()
 const {data:p}=await s.from('profiles').select('*').eq('id',id).single()
 if(!p)notFound()
 let avatarUrl:string|null=null
 if(p.avatar_path) avatarUrl=(await s.storage.from('avatars').createSignedUrl(p.avatar_path,3600)).data?.signedUrl??null
 const {data:posts}=await s.from('posts').select('id,user_id,caption,created_at').eq('user_id',id).order('created_at',{ascending:false}).limit(30)
 const ids=(posts??[]).map(x=>x.id)
 const [{data:media},{data:likes},{data:comments}]=await Promise.all([
   ids.length?s.from('media').select('id,post_id,storage_path,media_type').in('post_id',ids):Promise.resolve({data:[] as any[]}),
   ids.length?s.from('likes').select('post_id,user_id').in('post_id',ids):Promise.resolve({data:[] as any[]}),
   ids.length?s.from('comments').select('post_id').in('post_id',ids):Promise.resolve({data:[] as any[]})
 ])
 const initial=(p.display_name||p.username||'U').slice(0,1).toUpperCase()
 const mediaByPost=new Map((media??[]).map(m=>[m.post_id,m]))
 const view=await Promise.all((posts??[]).map(async x=>{
   const m=mediaByPost.get(x.id)
   const url=m?(await s.storage.from('post-media').createSignedUrl(m.storage_path,3600)).data?.signedUrl??null:null
   return {id:x.id,user_id:x.user_id,caption:x.caption,created_at:x.created_at,username:p.username,display_name:p.display_name,mediaUrl:url,mediaType:m?.media_type??null,likeCount:(likes??[]).filter(l=>l.post_id===x.id).length,commentCount:(comments??[]).filter(l=>l.post_id===x.id).length,liked:(likes??[]).some(l=>l.post_id===x.id&&l.user_id===user.id),saved:false}
 }))
 return (
  <main className="shell narrow">
   <Link href="/discover">← Discover</Link>
   <section className="card profile public-profile-card">
    <div className="public-profile-head">
     <div className="public-avatar">{avatarUrl?<img src={avatarUrl} alt={p.display_name+' profile'} />:<span>{initial}</span>}</div>
     <div className="public-profile-identity">
      <h1>@{p.username}</h1>
      <h2>{p.display_name}</h2>
      <span className="badge">{p.creator_status}</span>
      <p>{p.bio||'Creator on Mirror Gram.'}</p>
     </div>
    </div>
    {user.id!==id&&<div className="actions public-profile-actions">
      <FollowButton targetId={id}/>
      <Link className="secondary" href={'/messages?to='+encodeURIComponent(p.username??'')}>Message</Link>
    </div>}
   </section>
   {view.length ? view.map(x=><PostCard key={x.id} post={x}/>) : <section className="card empty"><h3>No posts yet</h3><p>This creator has not published a post yet.</p></section>}
  </main>
 )
}
