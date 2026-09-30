import { login, signup } from './actions'

export default function LoginPage() {
  return (
    <main style={{ maxWidth: 520, margin: '60px auto', padding: 24 }}>
      <h1 style={{ color: '#168a4a' }}>Mirror Gram</h1>
      <p>Sign in or create your account.</p>
      <form action={login} style={{ display: 'grid', gap: 12 }}>
        <input name="email" type="email" placeholder="Email" required style={{ padding: 12, border: '1px solid #dfe9e3', borderRadius: 10 }} />
        <input name="password" type="password" placeholder="Password" required minLength={8} style={{ padding: 12, border: '1px solid #dfe9e3', borderRadius: 10 }} />
        <input name="username" placeholder="Username (for sign-up)" minLength={3} maxLength={30} style={{ padding: 12, border: '1px solid #dfe9e3', borderRadius: 10 }} />
        <div style={{ display: 'flex', gap: 10 }}>
          <button type="submit" style={{ padding: 12, border: 0, borderRadius: 10, background: '#168a4a', color: '#fff' }}>Sign in</button>
          <button formAction={signup} type="submit" style={{ padding: 12, border: '1px solid #168a4a', borderRadius: 10, background: '#fff', color: '#168a4a' }}>Create account</button>
        </div>
      </form>
      <p style={{ color: '#607067', fontSize: 14 }}>Email confirmation may be required by your Supabase Auth settings.</p>
    </main>
  )
}
