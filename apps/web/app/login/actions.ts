 'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()
  const email = String(formData.get('email') || '')
  const password = String(formData.get('password') || '')

  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) redirect(`/login?error=${encodeURIComponent(error.message)}`)

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()
  const email = String(formData.get('email') || '')
  const password = String(formData.get('password') || '')
  const username = String(formData.get('username') || '').trim().toLowerCase()

  if (!/^[a-z0-9_]{3,30}$/.test(username)) {
    redirect('/login?error=Choose a username using 3-30 letters, numbers, or underscores.')
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { username, display_name: username } }
  })

  if (error) redirect(`/login?error=${encodeURIComponent(error.message)}`)
  redirect('/login?message=Check your email to confirm your account.')
}
