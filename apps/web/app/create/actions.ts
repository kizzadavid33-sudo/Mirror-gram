 'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function createPost(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const caption = String(formData.get('caption') || '').trim()
  const visibility = String(formData.get('visibility') || 'public')

  const { error } = await supabase.from('posts').insert({
    user_id: user.id,
    caption,
    visibility
  })

  if (error) redirect(`/create?error=${encodeURIComponent(error.message)}`)

  revalidatePath('/')
  redirect('/')
}
