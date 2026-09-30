# Mirror Gram build check

## Web-first install

From the repository root:

```bash
npm install
npm run check:web-env
npm run typecheck:web
npm run build:web
```

The first install intentionally includes only `apps/web`. The Expo project remains under `apps/mobile` for the native build stage.

## Environment

Copy `apps/web/.env.example` to `apps/web/.env.local` and set:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

Use only the Supabase publishable key in browser-exposed variables. Never use a service-role/database secret there.

## Backend

The connected Mirror Gram Supabase project has already been verified with the migrations recorded in `supabase/APPLIED_MIGRATIONS.md`. The current backend contains the production foundation tables, RLS policies, private media storage, and realtime configuration.

## TypeScript/auth fixes applied
- Fixed the `likes` insert so it never passes an undefined `user_id`.
- Matched the pinned `@supabase/ssr` 0.7 cookie callback shape.
- Renamed the Next.js auth entrypoint from `proxy.ts` to `middleware.ts` because this package uses Next.js 15.5.4.
