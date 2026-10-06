import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ProfileEditor from './ProfileEditor'
import PostCard from '../components/PostCard'
import { signOut } from './actions'

type ProfilePageProps = { searchParams: Promise<{ edit?: string; saved?: string; error?: string }> }
export const dynamic = 'force-dynamic'

export default async function ProfilePage({ searchParams }: ProfilePageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  const params = await searchParams
  const username = profile?.username ?? 'username'
  const displayName = profile?.display_name ?? username
  const bio = profile?.bio ?? ''
  const bioLink = profile?.bio_link ?? ''
  const contactEmail = profile?.contact_email ?? ''
  const contactPhone = profile?.contact_phone ?? ''
  const contactOther = profile?.contact_other ?? ''
  const creatorStatus = (profile?.creator_status ?? 'user') as 'user'|'creator'|'verified'

  let avatarUrl:string|null=null, coverUrl:string|null=null
  if(profile?.avatar_path) avatarUrl=(await supabase.storage.from('avatars').createSignedUrl(profile.avatar_path,3600)).data?.signedUrl??null
  if(profile?.cover_path) coverUrl=(await supabase.storage.from('avatars').createSignedUrl(profile.cover_path,3600)).data?.signedUrl??null

  if(params.edit==='1') return <main style={{minHeight:'100vh',background:'#f5f9ff',paddingBottom:100}}><div style={{maxWidth:900,margin:'0 auto',background:'#fff',minHeight:'100vh',padding:24,boxSizing:'border-box'}}>
    <div style={{marginBottom:20}}><Link href="/profile" style={{color:'#0878ed',textDecoration:'none',fontWeight:700,fontSize:17}}>← Back to profile</Link></div>
    <h1 style={{margin:'0 0 20px',color:'#071b41',fontSize:30}}>Edit profile</h1>
    {params.saved==='1'&&<div style={{padding:12,borderRadius:10,background:'#e8f4ff',color:'#0751bd',marginBottom:16}}>Profile saved successfully.</div>}
    {params.error&&<div style={{padding:12,borderRadius:10,background:'#fff4f4',color:'#991b1b',marginBottom:16}}>{params.error}</div>}
    <ProfileEditor username={username} displayName={displayName} bio={bio} bioLink={bioLink} contactEmail={contactEmail} contactPhone={contactPhone} contactOther={contactOther} isPrivate={profile?.is_private??false} creatorStatus={creatorStatus} avatarUrl={avatarUrl} coverUrl={coverUrl}/>
  </div></main>

  const {data:posts,error:postsError}=await supabase.from('posts').select('id,user_id,caption,created_at').eq('user_id',user.id).order('created_at',{ascending:false}).limit(30)
  const ids=(posts??[]).map(p=>p.id)
  const [{data:media},{count:followers},{count:following}]=await Promise.all([
    ids.length?supabase.from('media').select('id,post_id,storage_path,media_type').in('post_id',ids):Promise.resolve({data:[] as any[]}),
    supabase.from('follows').select('*',{count:'exact',head:true}).eq('following_id',user.id),
    supabase.from('follows').select('*',{count:'exact',head:true}).eq('follower_id',user.id)
  ])
  const [{data:likes},{data:comments},{data:saved}]=await Promise.all([
    ids.length?supabase.from('likes').select('post_id,user_id').in('post_id',ids):Promise.resolve({data:[] as any[]}),
    ids.length?supabase.from('comments').select('post_id').in('post_id',ids):Promise.resolve({data:[] as any[]}),
    ids.length?supabase.from('saved_posts').select('post_id').eq('user_id',user.id).in('post_id',ids):Promise.resolve({data:[] as any[]})
  ])
  const mediaByPost=new Map((media??[]).map(m=>[m.post_id,m]))
  const viewPosts=await Promise.all((posts??[]).map(async p=>{
    const m=mediaByPost.get(p.id)
    const mediaUrl=m?(await supabase.storage.from('post-media').createSignedUrl(m.storage_path,3600)).data?.signedUrl??null:null
    return {id:p.id,user_id:p.user_id,caption:p.caption,created_at:p.created_at,username,display_name:displayName,mediaUrl,mediaType:m?.media_type??null,likeCount:(likes??[]).filter(x=>x.post_id===p.id).length,commentCount:(comments??[]).filter(x=>x.post_id===p.id).length,liked:(likes??[]).some(x=>x.post_id===p.id&&x.user_id===user.id),saved:(saved??[]).some(x=>x.post_id===p.id)}
  }))
  const initial=displayName.charAt(0).toUpperCase()
  const coverStyle=coverUrl?'url("' + coverUrl + '") center / cover no-repeat':'linear-gradient(135deg,#071b41 0%,#0067d9 55%,#16b9e9 100%)'

  return <main style={{minHeight:'100vh',background:'#f5f9ff',paddingBottom:100}}><div style={{maxWidth:900,margin:'0 auto',background:'#fff',minHeight:'100vh'}}>
    <div style={{height:250,position:'relative',background:coverStyle,overflow:'hidden'}}>{!coverUrl&&<div style={{position:'absolute',inset:0,background:'radial-gradient(circle at 75% 25%,rgba(255,255,255,.28),transparent 35%)'}}/>}</div>
    <section style={{padding:'0 24px 30px',position:'relative'}}>
      <div style={{width:130,height:130,borderRadius:'50%',background:avatarUrl?'#fff':'#0878ed',border:'6px solid #fff',marginTop:-65,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:48,fontWeight:800,overflow:'hidden',boxShadow:'0 2px 8px rgba(0,0,0,.15)'}}>{avatarUrl?<img src={avatarUrl} alt={displayName+' profile'} style={{width:'100%',height:'100%',objectFit:'cover'}}/>:initial}</div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:20,marginTop:10,flexWrap:'wrap'}}><div><h1 style={{margin:0,fontSize:30,color:'#071b41'}}>{displayName}</h1><p style={{margin:'4px 0',color:'#64748b',fontSize:17}}>@{username}</p><span className="badge">{creatorStatus}</span><p style={{margin:'10px 0 0',color:'#334155',lineHeight:1.5}}>{bio||'Share what you see. Reflect who you are.'}</p>{bioLink&&<a href={bioLink} target="_blank" rel="noreferrer" style={{display:'inline-block',marginTop:8,color:'#0878ed',fontWeight:700}}>{bioLink.replace(/^https?:\/\//,'')}</a>} {(contactEmail||contactPhone||contactOther)&&<div style={{marginTop:12,padding:12,border:'1px solid #e2e8f0',borderRadius:12,background:'#f8fbff',color:'#334155'}}><strong>Contact</strong><div style={{marginTop:6,display:'grid',gap:3}}>{contactEmail&&<span>✉️ {contactEmail}</span>}{contactPhone&&<span>📞 {contactPhone}</span>}{contactOther&&<span>💬 {contactOther}</span>}</div></div>}</div><div style={{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}><Link href="/settings" style={{display:"inline-block",border:"1px solid #d5e4f5",color:"#0751bd",background:"#eef7ff",borderRadius:12,padding:"13px 18px",fontWeight:800,fontSize:16,textDecoration:"none"}}>Settings</Link><Link href="/profile?edit=1" style={{display:'inline-block',border:'1px solid #0878ed',color:'#0878ed',background:'#fff',borderRadius:12,padding:'13px 24px',fontWeight:800,fontSize:17,textDecoration:'none'}}>Edit profile</Link><form action={signOut}><button type="submit" className="signout profile-signout">Sign out</button></form></div></div>
      <div style={{display:'flex',gap:35,marginTop:24,paddingTop:18,borderTop:'1px solid #e5e7eb',flexWrap:'wrap',fontSize:17}}><div><strong>{viewPosts.length}</strong><span style={{color:'#64748b',marginLeft:5}}>Posts</span></div><div><strong>{followers??0}</strong><span style={{color:'#64748b',marginLeft:5}}>Followers</span></div><div><strong>{following??0}</strong><span style={{color:'#64748b',marginLeft:5}}>Following</span></div></div>
    </section>
    <section style={{padding:'0 24px 40px'}}><h2 style={{color:'#071b41'}}>Your posts</h2>{postsError&&<div className="story-error">We couldn't load your posts. Please refresh and try again.</div>}{viewPosts.length?viewPosts.map(p=><PostCard key={p.id} post={p}/>):!postsError&&<div style={{textAlign:'center',padding:'50px 20px',border:'1px dashed #cbd5e1',borderRadius:16,color:'#64748b'}}><div style={{fontSize:42}}>📸</div><strong>No posts yet</strong><p>Create your first Mirror Gram post.</p></div>}</section>
  </div></main>
}