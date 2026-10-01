
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { updateProfile } from './actions'

export default async function ProfilePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const username = profile?.username ?? 'username'
  const displayName = profile?.display_name ?? username
  const bio = profile?.bio ?? ''
  const initial = displayName.charAt(0).toUpperCase()

  let avatarUrl: string | null = null
  let coverUrl: string | null = null

  if (profile?.avatar_path) {
    const { data } = await supabase.storage
      .from('avatars')
      .createSignedUrl(profile.avatar_path, 3600)

    avatarUrl = data?.signedUrl ?? null
  }

  if (profile?.cover_path) {
    const { data } = await supabase.storage
      .from('avatars')
      .createSignedUrl(profile.cover_path, 3600)

    coverUrl = data?.signedUrl ?? null
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#f5f9ff',
        paddingBottom: 100,
      }}
    >
      <div
        style={{
          maxWidth: 900,
          margin: '0 auto',
          background: '#fff',
          minHeight: '
