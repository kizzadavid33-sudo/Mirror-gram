import { login, signup } from './actions'

type LoginPageProps = { searchParams: Promise<{ error?: string; message?: string }> }

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams
  return <main className="auth-page">
    <div className="auth-card">
      <div className="auth-brand">MIRROR GRAM</div>
      <h1>Welcome back</h1>
      <p className="auth-intro">Sign in or create your Mirror Gram account.</p>
      {params.error && <div role="alert" className="auth-alert error">{params.error}</div>}
      {params.message && <div role="status" className="auth-alert success">{params.message}</div>}
      <div className="auth-sections">
        <section className="auth-section">
          <h2>Login</h2>
          <form action={login} className="auth-form">
            <label>Email<input name="email" type="email" placeholder="you@example.com" required autoComplete="email" /></label>
            <label>Password<input name="password" type="password" placeholder="Your password" required minLength={8} autoComplete="current-password" /></label>
            <button type="submit" className="primary auth-submit">Login</button>
          </form>
        </section>
        <section className="auth-section auth-signup">
          <h2>Create account</h2>
          <form action={signup} className="auth-form">
            <label>Email<input name="email" type="email" placeholder="you@example.com" required autoComplete="email" /></label>
            <label>Username<input name="username" placeholder="your_username" required minLength={3} maxLength={30} pattern="[A-Za-z0-9_]{3,30}" autoComplete="username" /></label>
            <label>Password<input name="password" type="password" placeholder="At least 8 characters" required minLength={8} autoComplete="new-password" /></label>
            <button type="submit" className="primary auth-submit">Create account</button>
          </form>
          <p className="auth-note">Choose a username people can find you by.</p>
        </section>
      </div>
    </div>
  </main>
}