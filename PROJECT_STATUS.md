# Mirror Gram — build status (2026-09-29)

## Completed in this package
- Blue/white web UI foundation
- Supplied Mirror Gram logo integrated into web favicon/brand and Expo assets
- Home/feed with photo/video posts, likes, saves, comments and reports
- Discover, profiles, follow controls and Creator Studio
- Messages with conversation creation, text sending and Supabase realtime inserts
- Notifications page and notification triggers in Supabase
- Create-post upload to Supabase Storage with image/video preview
- Public-events map page with approximate-location model
- Live page foundation and realtime authorization in Supabase
- Safety Center, blocking/reporting foundations
- Simplified root workspace: the first npm install installs the web app only; Expo remains preserved for the later mobile build stage
- Supabase backend verified healthy with 15 public tables, RLS, private storage buckets, realtime messaging/notifications, and no security-advisor lints after hardening

## Still required before public store launch
- Run npm install, typecheck and production build in GitHub Codespaces or another Node-enabled environment
- Browser runtime test with real Supabase authentication and media upload
- Native Android/iPhone camera, microphone and push-notification integration
- Production livestream transport/CDN/moderation
- Full moderation/admin tooling, abuse/rate-limit infrastructure and backups
- Google Play / Apple App Store release configuration and signing

## Install path
From the project root:

```bash
npm install
npm run check:web-env
npm run typecheck:web
npm run build:web
npm run dev:web
```

Copy `apps/web/.env.example` to `apps/web/.env.local` and use the Mirror Gram Supabase URL and publishable key. Never put a service-role or database secret in browser-exposed environment variables.

See `supabase/APPLIED_MIGRATIONS.md` and `supabase/REMOTE_BACKEND_VERIFICATION.md` for the connected backend record.
