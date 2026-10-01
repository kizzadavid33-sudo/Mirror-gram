'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()
  const email = String(formData.get('email') || '').trim()
  const password = String(formData.get('password') || '')

  if (!email || !password) {
    redirect('/login?error=Enter your email and password.')
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`)
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()
  const email = String(formData.get('email') || '').trim()
  const password = String(formData.get('password') || '')
  const username = String(formData.get('username') || '').trim().toLowerCase()

  if (!email || !password || !username) {
    redirect('/login?error=Enter an email, username, and password to create your account.')
  }

  if (password.length < 8) {
    redirect('/login?error=Your password must be at least 8 characters.')
  }

  if (!/^[a-z0-9_]{3,30}$/.test(username)) {
    redirect('/login?error=Choose a username using 3-30 letters, numbers, or underscores.')
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username,
        display_name: username
      }
    }
  })

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`)
  }

  if (data.session) {
    revalidatePath('/', 'layout')
    redirect('/')
  }

  redirect('/login?message=Account created. Check your email and click the confirmation link before logging in.')
}
