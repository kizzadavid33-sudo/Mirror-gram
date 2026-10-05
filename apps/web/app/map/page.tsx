import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import Nav from '../components/Nav'

export const dynamic = 'force-dynamic'

export default async function MapPage() {
  const s = await createClient()
  const { data: { user } } = await s.auth.getUser()
  if (!user) return <main className="shell"><Link href="/login">Log in</Link></main>

  const { data: events, error } = await s.from('public_events')
    .select('id,title,description,area_name,approximate_lat,approximate_lng,starts_at,ends_at,creator_id,profiles(username,display_name)')
    .order('starts_at', { ascending: true }).limit(50)

  const first = (events ?? []).find(e => e.approximate_lat != null && e.approximate_lng != null)
  const lat = Number(first?.approximate_lat ?? 0.3476)
  const lng = Number(first?.approximate_lng ?? 32.5825)
  const delta = 0.18
  const bbox = [lng - delta, lat - delta, lng + delta, lat + delta].join(',')
  const marker = first ? '&marker=' + lat + ',' + lng : ''

  return <main className="shell">
    <header className="topbar"><div><h1>Creator Map</h1><p>Public events only — no exact home addresses.</p></div><Nav /></header>
    <section className="card map-card">
      <div className="map-frame"><iframe title="Mirror Gram public creator map" src={'https://www.openstreetmap.org/export/embed.html?bbox=' + encodeURIComponent(bbox) + '&layer=mapnik' + marker} loading="lazy" /></div>
      <div className="map-attribution"><span>🗺️ OpenStreetMap public map</span><span>Approximate event locations only</span></div>
    </section>
    {error && <div className="story-error">We couldn't load the public event list. Please refresh and try again.</div>}
    <section className="list">
      {(events ?? []).map(e => <article className="card" key={e.id}>
        <span className="badge">{e.area_name || 'Public area'}</span><h3>{e.title}</h3><p>{e.description}</p>
        <p className="muted">{e.starts_at ? new Date(e.starts_at).toLocaleString() : 'Time to be announced'}</p>
        {e.approximate_lat != null && e.approximate_lng != null && <small className="muted">📍 Approximate public location: {Number(e.approximate_lat).toFixed(4)}, {Number(e.approximate_lng).toFixed(4)}</small>}
      </article>)}
      {!events?.length && <div className="card empty"><h3>No public events yet</h3><p>The map is connected and ready. Public events will appear here when creators publish them.</p></div>}
    </section>
  </main>
}