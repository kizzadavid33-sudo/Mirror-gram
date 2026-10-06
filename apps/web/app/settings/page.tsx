import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { signOut } from '../profile/actions'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data:{user} } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  return <main className="shell narrow">
    <div className="settings-page">
      <Link href="/profile" className="back-link">← Profile</Link>
      <h1>Settings</h1><p className="muted">Manage your Mirror Gram account and safety choices.</p>
      <section className="card settings-list"><p className="settings-intro">Your settings help you control your identity, privacy, safety, notifications and how you use Mirror Gram.</p>
        <Link href="/profile?edit=1"><strong>Edit profile</strong><span>Change your name, bio, photos and privacy.</span></Link>
        <Link href="/privacy"><strong>Privacy & Security</strong><span>Understand your profile, posts, messages and account protection.</span></Link>
        <Link href="/community-guidelines"><strong>Community Guidelines</strong><span>Learn what is welcome and what is not allowed.</span></Link>
        <Link href="/safety"><strong>Safety Center</strong><span>Report, block and protect your experience.</span></Link><Link href="/reports"><strong>Reports</strong><span>Learn what to report and how moderation works.</span></Link><Link href="/ads"><strong>Ads & Promotions</strong><span>Learn about promotions, advertising standards and future ad tools.</span></Link>
      </section>
      <section className="card danger-zone"><h2>Account</h2><p className="muted">Sign out of Mirror Gram on this device.</p><form action={signOut}><button type="submit" className="signout">Sign out</button></form></section>
    </div>
  </main>
}