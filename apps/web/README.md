# Mirror Gram V3.1 — production foundation

Mirror Gram is a green-and-white creator social app built around Supabase Auth, Postgres/RLS, Storage and Realtime.

## Included
- Next.js web app
- Supabase SSR auth with `@supabase/ssr`
- Feed, profiles, discovery/search, posts, photo/video uploads
- Likes, comments, saves, follows
- Realtime messages and notifications
- Reports and blocks foundation
- Creator Studio metrics
- Public event map foundation using approximate event locations only
- Live-stream session foundation; connect a compliant video provider before camera ingest
- Expo mobile starter

## Run
1. Install a current Node.js release.
2. `npm install`
3. Copy `apps/web/.env.example` to `apps/web/.env.local`.
4. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
5. `npm run dev:web`
6. Open `http://localhost:3000`

Never put a Supabase secret/service-role key in the browser. Frontend access should use the publishable key with RLS policies. See the official Supabase security guidance.

## Production work remaining
- Configure email/OAuth redirect URLs and production domains.
- Connect a video streaming provider and moderation pipeline.
- Connect a map tile/provider key and event geocoding service that deliberately rounds coordinates.
- Add App Store/Google Play signing and push notification credentials.
- Add automated tests, abuse-rate limits, content moderation, privacy/legal pages, and incident response procedures.
