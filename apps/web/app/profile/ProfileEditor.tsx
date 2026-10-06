'use client'

import { useRef, useState, type ChangeEvent } from 'react'

import { updateProfile } from './actions'

type ProfileEditorProps = {
  username: string
  displayName: string
  bio: string
  bioLink: string
  contactEmail: string
  contactPhone: string
  contactOther: string
  isPrivate: boolean
  creatorStatus: 'user' | 'creator' | 'verified'
  avatarUrl: string | null
  coverUrl: string | null
}

export default function ProfileEditor({
  username,
  displayName,
  bio,
  bioLink,
  contactEmail,
  contactPhone,
  contactOther,
  isPrivate,
  creatorStatus,
  avatarUrl,
  coverUrl,
}: ProfileEditorProps) {
  const [avatarPreview, setAvatarPreview] = useState(avatarUrl)
  const [coverPreview, setCoverPreview] = useState(coverUrl)

  const avatarInputRef = useRef<HTMLInputElement>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)

  function handleAvatarChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0]

    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Please choose an image file.')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Please choose an image smaller than 5MB.')
      event.target.value = ''
      return
    }

    setAvatarPreview(URL.createObjectURL(file))
  }

  function handleCoverChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0]

    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Please choose an image file.')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Please choose an image smaller than 5MB.')
      event.target.value = ''
      return
    }

    setCoverPreview(URL.createObjectURL(file))
  }

  return (
    <>
      <form
          action={updateProfile}
          encType="multipart/form-data"
          style={{
            margin: '28px 0 30px',
            padding: 24,
            border: '1px solid #e2e8f0',
            borderRadius: 16,
            background: '#fbfdff',
          }}
        >
          <h2 style={{ marginTop: 0, color: '#071b41' }}>
            Edit profile
          </h2>

          <div style={{ display: 'grid', gap: 18 }}>
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
                  fontSize: 16,
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
                  fontSize: 16,
                }}
              />
            </label>

            <label>
              <strong>Creator status</strong>
              <select
                name="creator_status"
                defaultValue={creatorStatus}
                style={{ width: '100%', marginTop: 6, padding: 12, border: '1px solid #cbd5e1', borderRadius: 10, boxSizing: 'border-box', fontSize: 16, background: '#fff', color: '#10213f' }}
              >
                <option value="user">User</option>
                <option value="creator">Creator</option>
                <option value="verified">Verified</option>
              </select>
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
                  fontSize: 16,
                }}
              />
            </label>

            <div style={{border:'1px solid #dbe4ee',borderRadius:14,padding:16,background:'#fff'}}>
              <strong>Links & contact</strong>
              <div style={{display:'grid',gap:12,marginTop:12}}>
                <label><strong>Link in bio</strong><input name="bio_link" type="url" defaultValue={bioLink} placeholder="https://yourwebsite.com" maxLength={500} style={{width:'100%',marginTop:6,padding:12,border:'1px solid #cbd5e1',borderRadius:10,boxSizing:'border-box',fontSize:16}}/></label>
                <label><strong>Email</strong><input name="contact_email" type="email" defaultValue={contactEmail} placeholder="you@example.com" maxLength={200} style={{width:'100%',marginTop:6,padding:12,border:'1px solid #cbd5e1',borderRadius:10,boxSizing:'border-box',fontSize:16}}/></label>
                <label><strong>Phone</strong><input name="contact_phone" type="tel" defaultValue={contactPhone} placeholder="+256..." maxLength={50} style={{width:'100%',marginTop:6,padding:12,border:'1px solid #cbd5e1',borderRadius:10,boxSizing:'border-box',fontSize:16}}/></label>
                <label><strong>Other contact</strong><input name="contact_other" defaultValue={contactOther} placeholder="WhatsApp, Telegram, etc." maxLength={200} style={{width:'100%',marginTop:6,padding:12,border:'1px solid #cbd5e1',borderRadius:10,boxSizing:'border-box',fontSize:16}}/></label>
              </div>
            </div>

            <div
              style={{
                border: '1px solid #dbe4ee',
                borderRadius: 14,
                padding: 16,
                background: '#fff',
              }}
            >
              <strong>Profile photo</strong>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  marginTop: 12,
                  flexWrap: 'wrap',
                }}
              >
                <div
                  style={{
                    width: 84,
                    height: 84,
                    borderRadius: '50%',
                    overflow: 'hidden',
                    background: '#168a4a',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 30,
                    fontWeight: 800,
                  }}
                >
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Profile preview"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  ) : (
                    displayName.charAt(0).toUpperCase()
                  )}
                </div>

                <button
                  type="button"
                  onClick={() =>
                    avatarInputRef.current?.click()
                  }
                  style={{
                    background: '#0878ed',
                    color: '#fff',
                    border: 0,
                    borderRadius: 10,
                    padding: '11px 16px',
                    fontWeight: 700,
                    fontSize: 15,
                  }}
                >
                  📷 Choose profile photo
                </button>

                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  name="avatar_photo"
                  onChange={handleAvatarChange}
                  style={{ position: 'absolute', width: 1, height: 1, opacity: 0.01, pointerEvents: 'none' }}
                />
              </div>
            </div>

            <div
              style={{
                border: '1px solid #dbe4ee',
                borderRadius: 14,
                padding: 16,
                background: '#fff',
              }}
            >
              <strong>Cover photo</strong>

              <div
                style={{
                  height: 130,
                  marginTop: 12,
                  borderRadius: 12,
                  overflow: 'hidden',
                  background: coverPreview
                    ? 'url("' +
                      coverPreview +
                      '") center / cover no-repeat'
                    : 'linear-gradient(135deg, #071b41 0%, #0067d9 55%, #16b9e9 100%)',
                }}
              />

              <button
                type="button"
                onClick={() =>
                  coverInputRef.current?.click()
                }
                style={{
                  marginTop: 12,
                  background: '#0878ed',
                  color: '#fff',
                  border: 0,
                  borderRadius: 10,
                  padding: '11px 16px',
                  fontWeight: 700,
                  fontSize: 15,
                }}
              >
                📷 Choose cover photo
              </button>

              <input
                ref={coverInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                name="cover_photo"
                onChange={handleCoverChange}
                style={{ position: 'absolute', width: 1, height: 1, opacity: 0.01, pointerEvents: 'none' }}
              />
            </div>

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
                defaultChecked={isPrivate}
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
                padding: 14,
                fontWeight: 800,
                fontSize: 16,
              }}
            >
              Save profile
            </button>
          </div>
        </form>
    </>
  )
}
