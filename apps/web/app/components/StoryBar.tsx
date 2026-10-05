'use client'

import { useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Story = {
  id: string
  user_id: string
  username: string
  display_name: string
  mediaUrl: string
  mediaType: 'image' | 'video'
}

export default function StoryBar({ initialStories }: { initialStories: Story[] }) {
  const supabase = createClient()
  const inputRef = useRef<HTMLInputElement>(null)
  const [stories, setStories] = useState(initialStories)
  const [busy, setBusy] = useState(false)
  const [viewer, setViewer] = useState<Story | null>(null)
  const [error, setError] = useState('')

  async function addStory(file?: File) {
    if (!file) return
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      setError('Choose a photo or video for your story.')
      return
    }
    if (file.size > 50 * 1024 * 1024) {
      setError('Story files must be 50 MB or smaller.')
      return
    }

    setBusy(true)
    setError('')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('Please log in again before posting a story.')
        return
      }

      const storyId = crypto.randomUUID()
      const ext = file.name.split('.').pop()?.toLowerCase() || 'bin'
      const path = `${user.id}/${storyId}/story.${ext}`

      const upload = await supabase.storage.from('stories').upload(path, file, {
        contentType: file.type,
        upsert: false,
      })
      if (upload.error) throw upload.error

      const db = supabase as any
      const inserted = await db.from('stories').insert({
        id: storyId,
        user_id: user.id,
        storage_path: path,
        media_type: file.type.startsWith('video/') ? 'video' : 'image',
        caption: '',
      }).select('id, user_id, storage_path, media_type, expires_at').single()

      if (inserted.error) {
        await supabase.storage.from('stories').remove([path])
        throw inserted.error
      }

      const signed = await supabase.storage.from('stories').createSignedUrl(path, 86400)
      if (signed.error || !signed.data?.signedUrl) throw signed.error ?? new Error('Could not create story preview.')

      const story: Story = {
        id: storyId,
        user_id: user.id,
        username: 'you',
        display_name: 'Your Story',
        mediaUrl: signed.data.signedUrl,
        mediaType: file.type.startsWith('video/') ? 'video' : 'image',
      }

      setStories(current => [story, ...current.filter(item => item.user_id !== user.id)])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Story could not be published.')
    } finally {
      setBusy(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <>
      <div className="card stories" aria-label="Stories">
        <button type="button" className="story story-button" onClick={() => inputRef.current?.click()} disabled={busy}>
          <div className="story-avatar"><div>+</div></div>
          <b>{busy ? 'Posting…' : 'Your Story'}</b>
        </button>
        {stories.map(story => (
          <button type="button" className="story story-button" key={story.id} onClick={() => setViewer(story)}>
            <div className="story-avatar"><div>{story.username.slice(0, 2).toUpperCase()}</div></div>
            <span>@{story.username}</span>
          </button>
        ))}
        {!stories.length && <span className="muted story-empty">No active stories yet.</span>}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*,video/*"
        onChange={event => addStory(event.target.files?.[0])}
        style={{ display: 'none' }}
      />

      {error && (
        <div className="story-error">
          {error}
          <button type="button" onClick={() => setError('')}>Close</button>
        </div>
      )}

      {viewer && (
        <div className="story-viewer" role="dialog" aria-modal="true" onClick={() => setViewer(null)}>
          <div className="story-viewer-card" onClick={event => event.stopPropagation()}>
            <button type="button" className="story-close" onClick={() => setViewer(null)}>×</button>
            {viewer.mediaType === 'video'
              ? <video src={viewer.mediaUrl} controls autoPlay playsInline />
              : <img src={viewer.mediaUrl} alt="Story" />}
            <strong>@{viewer.username}</strong>
          </div>
        </div>
      )}
    </>
  )
}
