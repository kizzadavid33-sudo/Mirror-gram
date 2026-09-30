# Supabase migration record

These migrations are already applied to the connected Mirror Gram Supabase project.
The current database migration history reports:

- `mirror_gram_v3_foundation`
- `mirror_gram_v3_security_hardening`
- `v3_1_security_realtime_notifications`
- `v3_1_private_media_storage_access`
- `003_live_webrtc_realtime_authorization`
- `004_private_profiles_and_block_controls`
- `005_profile_avatar_events`
- `006_moderation_reporting_indexes`

The first two reproducible SQL files are included in this package. Some later changes were applied directly through the connected Supabase project during development and are recorded here so we do not mistake the current database for a clean-from-zero migration bundle.

Before a public launch, we should export/reconstruct the complete migration history and run it against a fresh development project to verify reproducibility.
