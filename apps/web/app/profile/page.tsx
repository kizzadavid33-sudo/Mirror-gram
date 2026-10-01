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
        {/* Cover */}
        <div
          style={{
            height: 250,
            position: 'relative',
            background:
              'linear-gradient(135deg, #071b41 0%, #0067d9 55%, #16b9e9 100%)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'radial-gradient(circle at 75% 25%, rgba(255,255,255,.28), transparent 35%)',
            }}
          />

          <label
            style={{
              position: 'absolute',
              right: 18,
              bottom: 18,
              background: 'rgba(0,0,0,.55)',
              color: '#fff',
              padding: '10px 15px',
              borderRadius: 10,
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            📷 Change cover
            <input
              type="file"
              accept="image/*"
              name="cover_photo"
              style={{ display: 'none' }}
            />
          </label>
        </div>

        {/* Profile header */}
        <section
          style={{
            padding: '0 24px 24px',
            position: 'relative',
          }}
        >
          <div
            style={{
              width: 130,
              height: 130,
              borderRadius: '50%',
              background: '#168a4a',
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
            }}
          >
            {initial}

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
                accept="image/*"
                name="avatar_photo"
                style={{ display: 'none' }}
              />
            </label>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: 20,
              marginTop: 10,
              flexWrap: 'wrap',
            }}
          >
            <div>
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

            <div
              style={{
                display: 'flex',
                gap: 10,
              }}
            >
              <button
                type="button"
                style={{
                  border: '1px solid #0878ed',
                  color: '#0878ed',
                  background: '#fff',
                  borderRadius: 10,
                  padding: '10px 18px',
                  fontWeight: 700,
                }}
              >
                Edit profile
              </button>
            </div>
          </div>

          {/* Stats */}
          <div
            style={{
              display: 'flex',
              gap: 35,
              marginTop: 24,
              paddingTop: 18,
              borderTop: '1px solid #e5e7eb',
            }}
          >
            <div>
              <strong>0</strong>
              <span style={{ color: '#64748b', marginLeft: 5 }}>Posts</span>
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

        {/* Edit profile */}
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

          <form
            action={updateProfile}
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
          </form>
        </section>

        {/* Posts area */}
        <section
          style={{
            padding: '0 24px 40px',
          }}
        >
          <h2 style={{ color: '#071b41' }}>Your posts</h2>

          <div
            style={{
              textAlign: 'center',
              padding: '50px 20px',
              border: '1px dashed #cbd5e1',
              borderRadius: 16,
              color: '#64748b',
            }}
          >
            <div style={{ fontSize: 42 }}>📸</div>
            <strong>No posts yet</strong>
            <p>Create your first Mirror Gram post.</p>
          </div>
        </section>
      </div>
    </main>
  )
            }
