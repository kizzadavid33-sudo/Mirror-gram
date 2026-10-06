'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

const LANGUAGES = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'lg', name: 'Luganda', native: 'Luganda' },
  { code: 'sw', name: 'Swahili', native: 'Kiswahili' },
  { code: 'fr', name: 'French', native: 'Français' },
  { code: 'es', name: 'Spanish', native: 'Español' },
  { code: 'pt', name: 'Portuguese', native: 'Português' },
  { code: 'ar', name: 'Arabic', native: 'العربية' },
]

export default function LanguagePage() {
  const [language, setLanguage] = useState('en')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const stored = window.localStorage.getItem('mirror-gram-language')
    if (stored && LANGUAGES.some((item) => item.code === stored)) setLanguage(stored)
  }, [])

  function saveLanguage(code: string) {
    setLanguage(code)
    window.localStorage.setItem('mirror-gram-language', code)
    document.cookie = `mirror-gram-language=${encodeURIComponent(code)}; path=/; max-age=31536000; samesite=lax`
    setSaved(true)
    window.setTimeout(() => setSaved(false), 1800)
  }

  return (
    <main className="shell narrow">
      <div className="settings-page">
        <Link href="/settings" className="back-link">← Settings</Link>
        <h1>Language</h1>
        <p className="muted">Choose the language you want Mirror Gram to use.</p>

        <section className="card settings-list language-list">
          {LANGUAGES.map((item) => (
            <button
              key={item.code}
              type="button"
              className={`language-option ${language === item.code ? 'selected' : ''}`}
              onClick={() => saveLanguage(item.code)}
              aria-pressed={language === item.code}
            >
              <span>
                <strong>{item.native}</strong>
                <small>{item.name}</small>
              </span>
              <span className="language-check" aria-hidden="true">
                {language === item.code ? '✓' : ''}
              </span>
            </button>
          ))}
        </section>

        {saved && <p className="language-saved" role="status">Language preference saved.</p>}
        <p className="muted language-note">Your language preference is saved on this device and can be changed at any time.</p>
      </div>
    </main>
  )
}
