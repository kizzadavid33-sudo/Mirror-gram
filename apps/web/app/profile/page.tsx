import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { updateProfile } from './actions'

export default async function ProfilePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const username = profile?.username ?? 'username'
  const displayName = profile?.display_name ?? username
  const bio = profile?.bio ?? ''
  const initial = displayName.charAt(0).toUpperCase()

  let avatarUrl: string | null = null
  let coverUrl: string | null = null

  if (profile?.avatar_path) {
    const { data } = await supabase.storage
      .from('avatars')
      .createSignedUrl(profile.avatar_path, 3600)

    avatarUrl = data?.signedUrl ?? null
  }

  if (profile?.cover_path) {
    const { data } = await supabase.storage
      .from('avatars')
      .createSignedUrl(profile.cover_path, 3600)

    coverUrl = data?.signedUrl ?? null
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#f5f9ff',
        paddingBottom: 100,
      }}
    >
      <div
        style={{
          maxWidth: 900,
          margin: '0 auto',
          background: '#fff',
          minHeight: '100vh',
        }}
      >
        <form
          action={updateProfile}
          encType="multipart/form-data"
          style={{ margin: 0 }}
        >
          {/* COVER */}
          <div
            style={{
              height: 250,
              position: 'relative',
              background: coverUrl
                ? `url("${coverUrl}") center / cover no-repeat`
                : 'linear-gradient(135deg, #071b41 0%, #0067d9 55%, #16b9e9 100%)',
              overflow: 'hidden',
            }}
          >
            {!coverUrl && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background:
                    'radial-gradient(circle at 75% 25%, rgba(255,255,255,.28), transparent 35%)',
                }}
              />
            )}

            <label
              style={{
                position: 'absolute',
                right: 18,
                bottom: 18,
                background: 'rgba(0,0,0,.60)',
                color: '#fff',
                padding: '11px 16px',
                borderRadius: 10,
                cursor: 'pointer',
                fontWeight: 700,
              }}
            >
              📷 Change cover

              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                name="cover_photo"
                style={{ display: 'none' }}
              />
            </label>
          </div>

          {/* PROFILE HEADER */}
          <section
            style={{
              padding: '0 24px 24px',
              position: 'relative',
            }}
          >
            {/* PROFILE PHOTO */}
            <div
              style={{
                width: 130,
                height: 130,
                borderRadius: '50%',
                background: avatarUrl ? '#fff' : '#168a4a',
                border: '6px solid #fff',
                marginTop: -65,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: 48,
                fontWeight: 800,
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(0,0,0,.15)',
              }}
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={`${displayName} profile`}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              ) : (
                initial
              )}

              <label
                style={{
                  position: 'absolute',
                  right: 2,
                  bottom: 2,
                  width: 38,
                  height: 38,
                  borderRadius: '50%',
                  background: '#0878ed',
                  border: '3px solid #fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: 16,
                }}
              >
                📷

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  name="avatar_photo"
                  style={{ display: 'none' }}
                />
              </label>
            </div>

            <div style={{ marginTop: 10 }}>
              <h1
                style={{
                  margin: 0,
                  fontSize: 28,
                  color: '#071b41',
                }}
              >
                {displayName}
              </h1>

              <p
                style={{
                  margin: '4px 0',
                  color: '#64748b',
                  fontSize: 16,
                }}
              >
                @{username}
              </p>

              <p
                style={{
                  margin: '10px 0 0',
                  color: '#334155',
                  maxWidth: 600,
                  lineHeight: 1.5,
                }}
              >
                {bio || 'Share what you see. Reflect who you are.'}
              </p>
            </div>

            {/* STATS */}
            <div
              style={{
                display: 'flex',
                gap: 35,
                marginTop: 24,
                paddingTop: 18,
                borderTop: '1px solid #e5e7eb',
                flexWrap: 'wrap',
              }}
            >
              <div>
                <strong>0</strong>
                <span style={{ color: '#64748b', marginLeft: 5 }}>
                  Posts
                </span>
              </div>

              <div>
                <strong>0</strong>
                <span style={{ color: '#64748b', marginLeft: 5 }}>
                  Followers
                </span>
              </div>

              <div>
                <strong>0</strong>
                <span style={{ color: '#64748b', marginLeft: 5 }}>
                  Following
                </span>
              </div>
            </div>
          </section>

          {/* EDIT PROFILE */}
          <section
            style={{
              margin: '0 24px 30px',
              padding: 24,
              border: '1px solid #e2e8f0',
              borderRadius: 16,
              background: '#fbfdff',
            }}
          >
            <h2
              style={{
                marginTop: 0,
                color: '#071b41',
              }}
            >
              Edit profile
            </h2>

            <div
              style={{
                display: 'grid',
                gap: 15,
              }}
            >
              <label>
                <strong>Username</strong>

                <input
                  name="username"
                  defaultValue={username}
                  minLength={3}
                  maxLength={30}
                  required
                  style={{
                    width: '100%',
                    marginTop: 6,
                    padding: 12,
                    border: '1px solid #cbd5e1',
                    borderRadius: 10,
                    boxSizing: 'border-box',
                  }}
                />
              </label>

              <label>
                <strong>Display name</strong>

                <input
                  name="display_name"
                  defaultValue={displayName}
                  maxLength={80}
                  style={{
                    width: '100%',
                    marginTop: 6,
                    padding: 12,
                    border: '1px solid #cbd5e1',
                    borderRadius: 10,
                    boxSizing: 'border-box',
                  }}
                />
              </label>

              <label>
                <strong>Bio</strong>

                <textarea
                  name="bio"
                  defaultValue={bio}
                  maxLength={500}
                  rows={4}
                  style={{
                    width: '100%',
                    marginTop: 6,
                    padding: 12,
                    border: '1px solid #cbd5e1',
                    borderRadius: 10,
                    resize: 'vertical',
                    boxSizing: 'border-box',
                  }}
                />
              </label>

              <label
                style={{
                  display: 'flex',
                  gap: 10,
                  alignItems: 'center',
                }}
              >
                <input
                  type="checkbox"
                  name="is_private"
                  defaultChecked={profile?.is_private ?? false}
                />

                Private profile
              </label>

              <button
                type="submit"
                style={{
                  background: '#0878ed',
                  color: '#fff',
                  border: 0,
                  borderRadius: 10,
                  padding: 13,
                  fontWeight: 700,
                  fontSize: 16,
                  cursor: 'pointer',
                }}
              >
                Save profile
              </button>
            </div>
          </section>
        </form>

        {/* POSTS */}
        <section
          style={{
            padding: '0 24px 40px',
          }}
        >
          <h2 style={{ color: '#071b41' }}>
            Your posts
          </h2>

          <div
            style={{
              textAlign: 'center',
              padding: '50px 20px',
              border: '1px dashed #cbd5e1',
              borderRadius: 16,
              color: '#64748b',
            }}
          >
            <div style={{ fontSize: 42 }}>
              📸
            </div>

            <strong>
              No posts yet
            </strong>

            <p>
              Create your first Mirror Gram post.
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}
