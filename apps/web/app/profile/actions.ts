'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

const MAX_FILE_SIZE = 5 * 1024 * 1024

function getExtension(file: File) {
  const type = file.type.toLowerCase()
  if (type === 'image/jpeg') return 'jpg'
  if (type === 'image/png') return 'png'
  if (type === 'image/webp') return 'webp'
  if (type === 'image/gif') return 'gif'
  return null
}

async function uploadProfileImage(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  file: File,
  type: 'avatar' | 'cover'
) {
  if (!file || file.size === 0) return null
  if (file.size > MAX_FILE_SIZE) throw new Error('Images must be 5MB or smaller.')

  const extension = getExtension(file)
  if (!extension) throw new Error('Please upload a JPG, PNG, WEBP, or GIF image.')

  const path = `${userId}/${type}-${Date.now()}.${extension}`
  const { error } = await supabase.storage.from('avatars').upload(path, file, {
    contentType: file.type,
    upsert: false,
  })

  if (error) throw new Error(error.message)
  return path
}

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const username = String(formData.get('username') || '').trim().toLowerCase()
  const display_name = String(formData.get('display_name') || '').trim()
  const bio = String(formData.get('bio') || '').trim()
  const creator_status = String(formData.get('creator_status') || 'user')

  if (!['user', 'creator', 'verified'].includes(creator_status)) {
    redirect('/profile?error=Invalid creator status')
  }

  const is_private = formData.get('is_private') === 'on'

  if (!/^[a-z0-9_]{3,30}$/.test(username)) {
    redirect('/profile?error=Invalid username')
  }

  const avatarFile = formData.get('avatar_photo')
  const coverFile = formData.get('cover_photo')
  let avatar_path: string | null = null
  let cover_path: string | null = null

  try {
    if (avatarFile instanceof File && avatarFile.size > 0) {
      avatar_path = await uploadProfileImage(supabase, user.id, avatarFile, 'avatar')
    }
    if (coverFile instanceof File && coverFile.size > 0) {
      cover_path = await uploadProfileImage(supabase, user.id, coverFile, 'cover')
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Image upload failed.'
    redirect(`/profile?error=${encodeURIComponent(message)}`)
  }

  const updates: {
    username: string
    display_name: string
    bio: string
    creator_status: 'user' | 'creator' | 'verified'
    is_private: boolean
    avatar_path?: string
    cover_path?: string
  } = {
    username,
    display_name,
    bio,
    creator_status: creator_status as 'user' | 'creator' | 'verified',
    is_private,
  }

  if (avatar_path) updates.avatar_path = avatar_path
  if (cover_path) updates.cover_path = cover_path

  const { error } = await supabase.from('profiles').update(updates).eq('id', user.id)

  if (error) redirect(`/profile?error=${encodeURIComponent(error.message)}`)

  revalidatePath('/profile')
  redirect('/profile?saved=1')
}
