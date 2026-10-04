# Mirror Gram

Blue-and-white creator-first social app foundation using Next.js, Expo/React Native, and Supabase.

## Architecture
- GitHub is the source of truth for the code and runs the web build checks through GitHub Actions.
- Supabase provides authentication, database, storage, realtime, and the backend security layer.
- Vercel is not required by this repository. There is no Vercel-specific build configuration.
- A separate web hosting provider is still required to publish the Next.js web application publicly; removing Vercel does not turn Supabase into a Next.js host.

## Included now
- Branded Mirror Gram logo (the supplied logo is included in the web and mobile assets)
- Home feed with photo/video posts
- Likes, saves, comments and reporting
- Discover, profiles and follow controls
- Creator Studio
- Text messaging with Supabase realtime
- Notifications
- Photo/video uploads to Supabase Storage
- Public creator events/map foundation using approximate locations
- Livestream foundation and realtime authorization
- Safety Center, blocking and reporting foundations
- Supabase RLS/security/realtime database setup

## Monday: install and verify
Requirements: Node.js 20+.

1. Copy `apps/web/.env.example` to `apps/web/.env.local`.
2. Put the Mirror Gram Supabase project URL and publishable key in that file.
3. From the project root:

```bash
npm install
npm run check:web-env
npm run typecheck:web
npm run build:web
npm run dev:web
```

Then open `http://localhost:3000`.

Do not put a database password, service-role key, or other secret key in `.env.local` variables exposed to the browser.

## Important status
This package is **not being labeled production-ready yet**. The remaining gate is installing dependencies and completing a real typecheck/build/runtime test on a computer. Native camera/microphone, production livestream transport, moderation infrastructure, rate limits, backups, and store release configuration also still need work before public launch.

## Supabase migration record
See `supabase/APPLIED_MIGRATIONS.md` for the migrations currently recorded by the connected Supabase project.


## Simplified installation

The root workspace installs the web application only. The Expo mobile workspace remains in `apps/mobile` but is intentionally excluded from the first web install so the initial setup is smaller and more reliable.

1. Install Node.js 20+
2. Run `npm install` from the project root
3. Copy `apps/web/.env.example` to `apps/web/.env.local`
4. Set the Supabase URL and publishable key
5. Run `npm run dev:web` for development or `npm run build:web` for a production build

The mobile Expo project is preserved for the later Android/iOS build stage.
