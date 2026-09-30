import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { updateProfile } from './actions'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()

  return (
    <main style={{ maxWidth: 700, margin: '40px auto', padding: 24 }}>
      <h1 style={{ color: '#168a4a' }}>Your profile</h1>
      <form action={updateProfile} style={{ display: 'grid', gap: 12 }}>
        <input name="username" defaultValue={profile?.username ?? ''} minLength={3} maxLength={30} required />
        <input name="display_name" defaultValue={profile?.display_name ?? ''} maxLength={80} />
        <textarea name="bio" defaultValue={profile?.bio ?? ''} maxLength={500} rows={5} />
        <label><input type="checkbox" name="is_private" defaultChecked={profile?.is_private ?? false} /> Private profile</label>
        <button type="submit" style={{ background: '#168a4a', color: '#fff', border: 0, borderRadius: 10, padding: 12 }}>Save profile</button>
      </form>
    </main>
  )
}
