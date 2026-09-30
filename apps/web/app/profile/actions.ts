 'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const username = String(formData.get('username') || '').trim().toLowerCase()
  const display_name = String(formData.get('display_name') || '').trim()
  const bio = String(formData.get('bio') || '').trim()
  const is_private = formData.get('is_private') === 'on'

  if (!/^[a-z0-9_]{3,30}$/.test(username)) {
    redirect('/profile?error=Invalid username')
  }

  const { error } = await supabase.from('profiles').update({
    username, display_name, bio, is_private
  }).eq('id', user.id)

  if (error) redirect(`/profile?error=${encodeURIComponent(error.message)}`)
  revalidatePath('/profile')
  redirect('/profile?saved=1')
}
