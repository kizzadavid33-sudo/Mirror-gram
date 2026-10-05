'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function FollowButton({ targetId, initialFollowing = false }: { targetId: string; initialFollowing?: boolean }) {
  const supabase = createClient()
  const [following, setFollowing] = useState(initialFollowing)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let active = true
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || user.id === targetId) return
      const { data } = await supabase.from('follows').select('following_id').eq('follower_id', user.id).eq('following_id', targetId).maybeSingle()
      if (active) setFollowing(!!data)
    }
    load()
    return () => { active = false }
  }, [targetId, supabase])

  async function toggle() {
    if (busy) return
    setBusy(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.id === targetId) { setBusy(false); return }
    if (following) {
      const { error } = await supabase.from('follows').delete().eq('follower_id', user.id).eq('following_id', targetId)
      if (!error) setFollowing(false)
    } else {
      const { error } = await supabase.from('follows').insert({ follower_id: user.id, following_id: targetId })
      if (!error) setFollowing(true)
    }
    setBusy(false)
  }

  return <button className={following ? 'secondary' : 'primary'} onClick={toggle} disabled={busy}>{busy ? 'Please wait…' : following ? 'Following' : 'Follow'}</button>
}