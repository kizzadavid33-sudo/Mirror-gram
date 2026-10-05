import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ProfileEditor from './ProfileEditor'
import PostCard from '../components/PostCard'

type ProfilePageProps={searchParams:Promise<{edit?:string;saved?:string;error?:string}>}

export default async function ProfilePage({searchParams}:ProfilePageProps){
 const supabase=await createClient()
 const {data:{user}}=await supabase.auth.getUser()
 if(!user)redirect('/login')
 const {data:profile}=await supabase.from('profiles').select('*').eq('id',user.id).single()
 const params=await searchParams
 const editing=params.edit==='1'
 const username=profile?.username??'username'
 const displayName=profile?.display_name??username
 const bio=profile?.bio??''
 const creatorStatus=(profile?.creator_status??'user') as 'user'|'creator'|'verified'
 let avatarUrl:string|null=null
 let coverUrl:string|null=null
 if(profile?.avatar_path){const {data}=await supabase.storage.from('avatars').createSignedUrl(profile.avatar_path,3600);avatarUrl=data?.signedUrl??null}
 if(profile?.cover_path){const {data}=await supabase.storage.from('avatars').createSignedUrl(profile.cover_path,3600);coverUrl=data?.signedUrl??null}
 if(editing)return <main style={{minHeight:'100vh',background:'#f5f9ff',paddingBottom:100}}><div style={{maxWidth:900,margin:'0 auto',background:'#fff',minHeight:'100vh',padding:24,boxSizing:'border-box'}}><div style={{marginBottom:20}}><Link href="/profile" style={{color:'#0878ed',textDecoration:'none',fontWeight:700,fontSize:17}}>← Back to profile</Link></div><h1 style={{margin:'0 0 20px',color:'#071b41',fontSize:30}}>Edit profile</h1>{params.saved==='1'&&<div style={{padding:12,borderRadius:10,background:'#ecfdf5',color:'#166534',marginBottom:16}}>Profile saved successfully.</div>}{params.error&&<div style={{padding:12,borderRadius:10,background:'#fff4f4',color:'#991b1b',marginBottom:16}}>{params.error}</div>}<ProfileEditor username={username} displayName={displayName} bio={bio} isPrivate={profile?.is_private??false} creatorStatus={creatorStatus} avatarUrl={avatarUrl} coverUrl={coverUrl}/></div></main>

 const [{data:posts},{count:followers},{count:following}]=await Promise.all([
  supabase.from('posts').select('id,user_id,caption,created_at,profiles!posts_user_id_fkey(username,display_name),media!media_post_id_fkey(id,storage_path,media_type)').eq('user_id',user.id).order('created_at',{ascending:false}).limit(30),
  supabase.from('follows').select('*',{count:'exact',head:true}).eq('following_id',user.id),
  supabase.from('follows').select('*',{count:'exact',head:true}).eq('follower_id',user.id)
 ])
 const ids=(posts??[]).map(p=>p.id)
 const [{data:likes},{data:comments},{data:saved}]=await Promise.all([
  ids.length?supabase.from('likes').select('post_id,user_id').in('post_id',ids):Promise.resolve({data:[] as any[]}),
  ids.length?supabase.from('comments').select('post_id').in('post_id',ids):Promise.resolve({data:[] as any[]}),
  ids.length?supabase.from('saved_posts').select('post_id').eq('user_id',user.id).in('post_id',ids):Promise.resolve({data:[] as any[]})
 ])
 const viewPosts=await Promise.all((posts??[]).map(async post=>{
  const media=post.media?.[0]
  const mediaUrl=media?(await supabase.storage.from('post-media').createSignedUrl(media.storage_path,3600)).data?.signedUrl??null:null
  return {id:post.id,user_id:post.user_id,caption:post.caption,created_at:post.created_at,username,display_name:displayName,mediaUrl,mediaType:media?.media_type??null,likeCount:(likes??[]).filter(x=>x.post_id===post.id).length,commentCount:(comments??[]).filter(x=>x.post_id===post.id).length,liked:(likes??[]).some(x=>x.post_id===post.id&&x.user_id===user.id),saved:(saved??[]).some(x=>x.post_id===post.id)}
 }))
 const initial=displayName.charAt(0).toUpperCase()
 const coverStyle=coverUrl?'url("' + coverUrl + '") center / cover no-repeat':'linear-gradient(135deg,#071b41 0%,#0067d9 55%,#16b9e9 100%)'
 return <main style={{minHeight:'100vh',background:'#f5f9ff',paddingBottom:100}}><div style={{maxWidth:900,margin:'0 auto',background:'#fff',minHeight:'100vh'}}><div style={{height:250,position:'relative',background:coverStyle,overflow:'hidden'}}>{!coverUrl&&<div style={{position:'absolute',inset:0,background:'radial-gradient(circle at 75% 25%,rgba(255,255,255,.28),transparent 35%)'}}/>}</div><section style={{padding:'0 24px 30px',position:'relative'}}><div style={{width:130,height:130,borderRadius:'50%',background:avatarUrl?'#fff':'#168a4a',border:'6px solid #fff',marginTop:-65,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:48,fontWeight:800,overflow:'hidden',boxShadow:'0 2px 8px rgba(0,0,0,.15)'}}>{avatarUrl?<img src={avatarUrl} alt={displayName+' profile'} style={{width:'100%',height:'100%',objectFit:'cover'}}/>:initial}</div><div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:20,marginTop:10,flexWrap:'wrap'}}><div><h1 style={{margin:0,fontSize:30,color:'#071b41'}}>{displayName}</h1><p style={{margin:'4px 0',color:'#64748b',fontSize:17}}>@{username}</p><span className="badge">{creatorStatus}</span><p style={{margin:'10px 0 0',color:'#334155',lineHeight:1.5}}>{bio||'Share what you see. Reflect who you are.'}</p></div><Link href="/profile?edit=1" style={{display:'inline-block',border:'1px solid #0878ed',color:'#0878ed',background:'#fff',borderRadius:12,padding:'13px 24px',fontWeight:800,fontSize:17,textDecoration:'none'}}>Edit profile</Link></div><div style={{display:'flex',gap:35,marginTop:24,paddingTop:18,borderTop:'1px solid #e5e7eb',flexWrap:'wrap',fontSize:17}}><div><strong>{viewPosts.length}</strong><span style={{color:'#64748b',marginLeft:5}}>Posts</span></div><div><strong>{followers??0}</strong><span style={{color:'#64748b',marginLeft:5}}>Followers</span></div><div><strong>{following??0}</strong><span style={{color:'#64748b',marginLeft:5}}>Following</span></div></div></section><section style={{padding:'0 24px 40px'}}><h2 style={{color:'#071b41'}}>Your posts</h2>{viewPosts.length?viewPosts.map(post=><PostCard key={post.id} post={post}/>):<div style={{textAlign:'center',padding:'50px 20px',border:'1px dashed #cbd5e1',borderRadius:16,color:'#64748b'}}><div style={{fontSize:42}}>📸</div><strong>No posts yet</strong><p>Create your first Mirror Gram post.</p></div>}</section></div></main>
}