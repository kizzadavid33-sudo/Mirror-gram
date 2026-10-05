import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import PostCard from '../components/PostCard'

export const dynamic='force-dynamic'

export default async function HusiePage(){
 const s=await createClient()
 const {data:{user}}=await s.auth.getUser()
 if(!user)return <main className="shell"><Link href="/login">Log in</Link></main>
 const {data:posts}=await s.from('posts').select('id,user_id,caption,created_at,profiles!posts_user_id_fkey(username,display_name),media!media_post_id_fkey(id,storage_path,media_type)').eq('media.media_type','video').order('created_at',{ascending:false}).limit(30)
 const ids=(posts??[]).map(p=>p.id)
 const [{data:likes},{data:comments},{data:saved}]=await Promise.all([
  ids.length?s.from('likes').select('post_id,user_id').in('post_id',ids):Promise.resolve({data:[] as any[]}),
  ids.length?s.from('comments').select('post_id').in('post_id',ids):Promise.resolve({data:[] as any[]}),
  ids.length?s.from('saved_posts').select('post_id').eq('user_id',user.id).in('post_id',ids):Promise.resolve({data:[] as any[]})
 ])
 const view=await Promise.all((posts??[]).map(async p=>{
  const m=p.media?.[0]; const url=m?(await s.storage.from('post-media').createSignedUrl(m.storage_path,3600)).data?.signedUrl??null:null
  return {id:p.id,user_id:p.user_id,caption:p.caption,created_at:p.created_at,username:(p.profiles as any)?.username??'user',display_name:(p.profiles as any)?.display_name??'',mediaUrl:url,mediaType:m?.media_type??null,likeCount:(likes??[]).filter(x=>x.post_id===p.id).length,commentCount:(comments??[]).filter(x=>x.post_id===p.id).length,liked:(likes??[]).some(x=>x.post_id===p.id&&x.user_id===user.id),saved:(saved??[]).some(x=>x.post_id===p.id)}
 }))
 return <main className="shell narrow"><header className="topbar" style={{paddingLeft:0}}><div><h1>Husie</h1><p>The Mirror Gram video room.</p></div><div style={{display:'flex',gap:8,flexWrap:'wrap'}}><Link className="secondary" href="/">Home</Link><Link className="secondary" href="/map">Map & Events</Link><Link className="primary link-button" href="/create">Create video</Link></div></header>{view.length?view.map(p=><PostCard key={p.id} post={p}/>):<section className="card empty"><h2>No Husie videos yet</h2><p>Publish a video and it will appear here.</p><Link className="primary link-button" href="/create">Create a video</Link></section>}</main>

}
