'use client'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function CreatePostForm(){
 const supabase=createClient(); const router=useRouter(); const uploadRef=useRef<HTMLInputElement>(null); const cameraRef=useRef<HTMLInputElement>(null); const liveVideoRef=useRef<HTMLVideoElement>(null); const liveStreamRef=useRef<MediaStream|null>(null); const cancelRef=useRef(false)
 const [files,setFiles]=useState<File[]>([]); const [musicFile,setMusicFile]=useState<File|null>(null); const [liveFilter,setLiveFilter]=useState('none'); const [musicName,setMusicName]=useState(''); const [live,setLive]=useState(false); const [liveError,setLiveError]=useState(''); const [liveBusy,setLiveBusy]=useState(false); const [caption,setCaption]=useState(''); const [visibility,setVisibility]=useState('public'); const [busy,setBusy]=useState(false); const [cancelled,setCancelled]=useState(false); const [preview,setPreview]=useState<string|null>(null)
 useEffect(()=>()=>{liveStreamRef.current?.getTracks().forEach(t=>t.stop())},[])
 function chooseMany(list:FileList|null){const chosen=Array.from(list??[]);if(!chosen.length)return;for(const f of chosen){if(!['image/','video/'].some(p=>f.type.startsWith(p)))return alert('Choose images or videos only.');if(f.size>50*1024*1024)return alert('Each file must be 50 MB or smaller.')}cancelRef.current=false;setCancelled(false);setFiles(chosen);setPreview(URL.createObjectURL(chosen[0]))}
 async function openLive(){setLive(true);setLiveError('');setLiveBusy(true);try{if(!navigator.mediaDevices?.getUserMedia)throw new Error('This browser does not provide camera access.');const stream=await navigator.mediaDevices.getUserMedia({video:true,audio:true});liveStreamRef.current=stream;if(liveVideoRef.current){liveVideoRef.current.srcObject=stream;await liveVideoRef.current.play().catch(()=>{})}const {data:{user}}=await supabase.auth.getUser();if(user)await supabase.from('live_streams').insert({host_user_id:user.id,title:'Mirror Gram Live',category:'creator',status:'live',started_at:new Date().toISOString()})}catch(e){setLiveError(e instanceof Error?e.message:'Camera access was denied. Check your browser camera/microphone permission.')}finally{setLiveBusy(false)}}
 function closeLive(){liveStreamRef.current?.getTracks().forEach(t=>t.stop());liveStreamRef.current=null;setLive(false)}
 function cancelUpload(){if(!busy)return;cancelRef.current=true;setCancelled(true);setBusy(false)}
 async function publish(){if(!files.length)return alert('Choose at least one photo or video first.');if(busy)return;cancelRef.current=false;setCancelled(false);setBusy(true);const {data:{user}}=await supabase.auth.getUser();if(!user){setBusy(false);return router.push('/login')}const postId=crypto.randomUUID();const uploaded:string[]=[];let uploadedMusic:string|null=null;try{for(let i=0;i<files.length;i++){if(cancelRef.current)throw new Error('UPLOAD_CANCELLED');const f=files[i];const ext=f.name.split('.').pop()?.toLowerCase()||'bin';const path=user.id+'/'+postId+'/media-'+i+'.'+ext;const upload=await supabase.storage.from('post-media').upload(path,f,{contentType:f.type,upsert:false});if(upload.error)throw upload.error;uploaded.push(path)}if(musicFile){if(musicFile.size>15*1024*1024)throw new Error('Music files must be 15 MB or smaller.');const ext=musicFile.name.split('.').pop()?.toLowerCase()||'mp3';const musicPath=user.id+'/'+postId+'/music-'+Date.now()+'.'+ext;const mu=await supabase.storage.from('post-music').upload(musicPath,musicFile,{contentType:musicFile.type||'audio/mpeg',upsert:false});if(mu.error)throw mu.error;uploadedMusic=musicPath}if(cancelRef.current)throw new Error('UPLOAD_CANCELLED');const post=await supabase.from('posts').insert({id:postId,user_id:user.id,caption:caption.trim(),visibility,music_path:uploadedMusic,music_name:musicName.trim()||musicFile?.name||null});if(post.error)throw post.error;const mediaRows=files.map((f,i)=>({post_id:postId,storage_path:uploaded[i],media_type:f.type.startsWith('video/')?'video':'image',mime_type:f.type}));const media=await supabase.from('media').insert(mediaRows);if(media.error)throw media.error;if(cancelRef.current)throw new Error('UPLOAD_CANCELLED');setBusy(false);router.push('/');router.refresh()}catch(e){if(e instanceof Error&&e.message==='UPLOAD_CANCELLED'){await supabase.from('media').delete().eq('post_id',postId);await supabase.from('posts').delete().eq('id',postId).eq('user_id',user.id);if(uploadedMusic)await supabase.storage.from('post-music').remove([uploadedMusic])}else{await supabase.from('media').delete().eq('post_id',postId);await supabase.from('posts').delete().eq('id',postId).eq('user_id',user.id);if(uploaded.length)await supabase.storage.from('post-media').remove(uploaded);alert(e instanceof Error?e.message:'Post could not be published.')}if(uploaded.length)await supabase.storage.from('post-media').remove(uploaded);if(uploadedMusic)await supabase.storage.from('post-music').remove([uploadedMusic]);setBusy(false)}}
 return (
  <section className="card" style={{marginTop:20}}>
   <div style={{display:'grid',gap:16}}>
    <label>
     <strong>Photos or videos</strong>
     <input ref={uploadRef} type="file" accept="image/*,video/*" multiple onChange={e=>chooseMany(e.target.files)} style={{display:'block',marginTop:8}} />
    </label>
    <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
     <button type="button" className="secondary" onClick={()=>uploadRef.current?.click()}>Choose photos/videos</button>
     <button type="button" className="secondary" onClick={()=>cameraRef.current?.click()}>📷 Camera</button>
     <input ref={cameraRef} type="file" accept="image/*" capture="environment" onChange={e=>chooseMany(e.target.files)} style={{display:'none'}} />
    </div>
    {files.length>0&&<div><strong>{files.length} file{files.length===1?'':'s'} selected</strong><div className="upload-preview-grid" style={{marginTop:10}}>{files.map((f,i)=><div key={i} style={{minWidth:100}}><div style={{fontSize:12,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{f.name}</div></div>)}</div></div>}
<section className="music-picker-box">
      <div><strong>🎵 Add music</strong><p className="muted" style={{margin:'4px 0'}}>Choose an audio file from your phone. MP3, M4A and other browser-supported audio formats work.</p></div>
      <input type="file" accept="audio/*" onChange={e=>{const f=e.target.files?.[0]??null;setMusicFile(f);setMusicName(f?.name??'')}} />
      {musicFile&&<div className="music-selected"><strong>{musicFile.name}</strong><span>{(musicFile.size/1024/1024).toFixed(1)} MB</span><button type="button" className="ghost" onClick={()=>{setMusicFile(null);setMusicName('')}}>Remove</button></div>}
      <input value={musicName} onChange={e=>setMusicName(e.target.value)} placeholder="Music title (optional)" maxLength={120}/>
      <a href="https://pixabay.com/music/search/free/" target="_blank" rel="noreferrer" className="secondary link-button">Browse free/royalty-free music on Pixabay</a>
      <small className="muted">Check each track's license before publishing; “royalty-free” does not always mean public domain.</small>
    </section>
    <textarea value={caption} onChange={e=>setCaption(e.target.value)} placeholder="What's on your mind?" rows={4} maxLength={2000} style={{width:'100%',boxSizing:'border-box',padding:12,border:'1px solid #cbd5e1',borderRadius:10}} />
    <label><strong>Visibility</strong><select value={visibility} onChange={e=>setVisibility(e.target.value)} style={{display:'block',marginTop:6,padding:10,border:'1px solid #cbd5e1',borderRadius:10}}><option value="public">Public</option><option value="followers">Followers</option><option value="private">Private</option></select></label>
    {cancelled&&<div className="story-error">Upload cancelled.</div>}
    {liveError&&<div className="story-error">{liveError}</div>}
    {preview&&<img src={preview} alt="Preview" style={{width:'100%',maxHeight:360,objectFit:'contain',borderRadius:12}} />}
    <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
     <button type="button" className="primary" onClick={publish} disabled={busy||!files.length}>{busy?'Publishing…':'Publish'}</button>
     {busy&&<button type="button" className="secondary" onClick={cancelUpload}>Cancel upload</button>}
     <button type="button" className="secondary" onClick={openLive} disabled={liveBusy}>{liveBusy?'Starting camera…':'🔴 Start Live'}</button>
    </div>
    {live&&<div style={{marginTop:10}}><label style={{display:'grid',gap:6,marginBottom:10}}><strong>Live camera filter</strong><select value={liveFilter} onChange={e=>setLiveFilter(e.target.value)}><option value="none">Normal</option><option value="contrast(1.15) saturate(1.35)">Vivid</option><option value="sepia(.35) saturate(1.2)">Warm</option><option value="hue-rotate(180deg) saturate(1.15)">Cool</option><option value="grayscale(1)">Mono</option><option value="sepia(.55) contrast(1.08) saturate(.9)">Vintage</option></select></label><video ref={liveVideoRef} autoPlay muted playsInline style={{width:'100%',maxHeight:420,borderRadius:14,background:'#000',filter:liveFilter}}/><button type="button" className="secondary" onClick={closeLive} style={{marginTop:10}}>Stop Live</button></div>}
   </div>
  </section>
 )
}