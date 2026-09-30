# Mirror Gram — connected Supabase backend verification

Verified against the connected Supabase project on 2026-09-29.

## Backend status
- Project ref: `fkbbpovlhrpbclnmmtbu`
- Status: `ACTIVE_HEALTHY`
- PostgreSQL: 17.6
- Public tables: 15
- RLS policies: 49
- Storage buckets: `avatars`, `post-media` (private)
- Realtime publication includes `messages` and `notifications`

## Fixes applied remotely
The connected project already contained the original V3/V3.1 migration history. The following hardening was then applied:

- Added indexes for the previously unindexed foreign keys on blocks, conversation members, live streams, messages, notifications, public events, reports, and saved posts.
- Moved the RLS helper functions `is_blocked` and `is_conversation_member` from the exposed `public` schema into a private schema so they are not callable as public REST RPC endpoints.
- Kept the functions `SECURITY DEFINER` because the RLS policies need them to inspect protected rows without recursive policy evaluation.
- Added an authorization guard so the helper functions only evaluate a viewer/user matching `auth.uid()`.
- Updated all affected public and storage RLS policies to use the private helpers.
- Re-ran the Supabase security advisor after the changes: no security lints remain.

## Verification
The live project was queried after the changes and returned the expected 15 public tables. The security advisor returned no lints.

## Important limitation
This package does not claim that npm installation or the Next.js production build was executed successfully in this environment. The environment could not reach the npm registry, so the install must still be run in GitHub Codespaces or another Node-enabled environment.
