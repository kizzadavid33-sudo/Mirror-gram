
import { login, signup } from './actions'

type LoginPageProps = {
  searchParams: Promise<{
    error?: string
    message?: string
  }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams
  const error = params.error
  const message = params.message

  return (
    <main style={{ maxWidth: 520, margin: '60px auto', padding: 24 }}>
      <h1 style={{ color: '#168a4a' }}>Mirror Gram</h1>
      <p>Sign in to your account or create a new one.</p>

      {error && (
        <div
          role="alert"
          style={{
            marginBottom: 16,
            padding: 12,
            borderRadius: 10,
            background: '#fff1f1',
            border: '1px solid #f0b8b8',
            color: '#9b1c1c'
          }}
        >
          {error}
        </div>
      )}

      {message && (
        <div
          role="status"
          style={{
            marginBottom: 16,
            padding: 12,
            borderRadius: 10,
            background: '#eef9f1',
            border: '1px solid #b9dfc4',
            color: '#166534'
          }}
        >
          {message}
        </div>
      )}

      <section style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 20 }}>Login</h2>

        <form action={login} style={{ display: 'grid', gap: 12 }}>
          <input
            name="email"
            type="email"
            placeholder="Email"
            required
            autoComplete="email"
            style={{
              padding: 12,
              border: '1px solid #dfe9e3',
              borderRadius: 10
            }}
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            required
            minLength={8}
            autoComplete="current-password"
            style={{
              padding: 12,
              border: '1px solid #dfe9e3',
              borderRadius: 10
            }}
          />

          <button
            type="submit"
            style={{
              padding: 12,
              border: 0,
              borderRadius: 10,
              background: '#168a4a',
              color: '#fff',
              fontWeight: 600
            }}
          >
            Login
          </button>
        </form>
      </section>

      <section>
        <h2 style={{ fontSize: 20 }}>Create account</h2>

        <form action={signup} style={{ display: 'grid', gap: 12 }}>
          <input
            name="email"
            type="email"
            placeholder="Email"
            required
            autoComplete="email"
            style={{
              padding: 12,
              border: '1px solid #dfe9e3',
              borderRadius: 10
            }}
          />

          <input
            name="username"
            placeholder="Username"
            required
            minLength={3}
            maxLength={30}
            pattern="[A-Za-z0-9_]{3,30}"
            autoComplete="username"
            style={{
              padding: 12,
              border: '1px solid #dfe9e3',
              borderRadius: 10
            }}
          />

          <input
            name="password"
            type="password"
            placeholder="Password (8+ characters)"
            required
            minLength={8}
            autoComplete="new-password"
            style={{
              padding: 12,
              border: '1px solid #dfe9e3',
              borderRadius: 10
            }}
          />

          <button
            type="submit"
            style={{
              padding: 12,
              border: '1px solid #168a4a',
              borderRadius: 10,
              background: '#fff',
              color: '#168a4a',
              fontWeight: 600
            }}
          >
            Create account
          </button>
        </form>

        <p style={{ color: '#607067', fontSize: 14 }}>
          After creating your account, you may need to confirm your email before logging in.
        </p>
      </section>
    </main>
  )
}
