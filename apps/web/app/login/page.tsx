import { login, signup } from './actions'

type LoginPageProps = { searchParams: Promise<{ error?: string; message?: string }> }

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams
  return <main className="auth-page">
    <div className="auth-card">
      <h1>Mirror Gram</h1>
      <p className="auth-intro">Sign in to your account or create a new one.</p>
      {params.error && <div role="alert" className="auth-alert error">{params.error}</div>}
      {params.message && <div role="status" className="auth-alert success">{params.message}</div>}
      <section>
        <h2>Login</h2>
        <form action={login} className="auth-form">
          <input name="email" type="email" placeholder="Email" required autoComplete="email" />
          <input name="password" type="password" placeholder="Password" required minLength={8} autoComplete="current-password" />
          <button type="submit" className="primary auth-submit">Login</button>
        </form>
      </section>
      <section>
        <h2>Create account</h2>
        <form action={signup} className="auth-form">
          <input name="email" type="email" placeholder="Email" required autoComplete="email" />
          <input name="username" placeholder="Username" required minLength={3} maxLength={30} pattern="[A-Za-z0-9_]{3,30}" autoComplete="username" />
          <input name="password" type="password" placeholder="Password (8+ characters)" required minLength={8} autoComplete="new-password" />
          <button type="submit" className="secondary auth-submit">Create account</button>
        </form>
        <p className="auth-note">Use a valid email address and choose a username people can find you by.</p>
      </section>
    </div>
  </main>
}