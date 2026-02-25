
## Learnings

### Multi-Platform Foundation (LinkedIn Live Chat Integration - Tasks 1, 4, 8)
**Date:** 2025-01-XX

**Architecture Decisions:**
- Established `Platform` type as union type ('twitch' | 'linkedin' | 'youtube') in `src/types/platform.ts`
- Introduced `UserFetcher` interface pattern for platform-agnostic user data retrieval (`src/types/userFetcher.ts`)
- Refactored `UserStore` to use composite cache keys (`${platform}:${login}`) and platform-specific fetcher registry
- Updated `StreamUser` and `OnChatMessageEvent` types with platform fields using default parameters for backward compatibility
- Made Supabase queries platform-aware with composite unique constraint on `(login, platform)`

**Key Patterns:**
- Default parameters pattern (`platform = 'twitch'`) ensures all existing Twitch call sites work unchanged
- UserFetcher registry allows runtime registration of platform-specific user fetchers
- 3-tier cache flow: in-memory → Supabase (platform-aware) → platform-specific UserFetcher
- TwitchAPI registered as 'twitch' fetcher in `src/index.ts` startup sequence

**User Preferences:**
- All imports use `.js` extensions (ESM project convention)
- Static-only classes use `export abstract class` pattern
- Graceful degradation when credentials missing (per charter)
- Backward compatibility required for all existing Twitch integrations

**Key File Paths:**
- `src/types/platform.ts` - Platform type definition
- `src/types/userFetcher.ts` - UserFetcher interface
- `src/types/streamUser.ts` - StreamUser with platform field
- `src/types/onChatMessageEvent.ts` - OnChatMessageEvent with source field
- `src/stores/userStore.ts` - Platform-aware user caching and fetcher registry
- `src/integrations/supabase/index.ts` - Platform-aware database queries
- `src/index.ts` - TwitchAPI fetcher registration
- `.env-sample` - LinkedIn environment configuration template

### LinkedIn Integration Backend (Tasks 2, 3, 5, 6, 9)
**Date:** 2025-02-24

**Architecture Decisions:**
- LinkedIn API client implements `UserFetcher` interface for user resolution via `UserStore` registry
- Live detection uses polling pattern to detect LIVE video posts via LinkedIn API
- Comment polling only active during live streams (triggered by `LiveDetector` callbacks)
- Shared command registry (`src/commands/registry.ts`) imports commands from existing Twitch location to avoid file duplication
- Platform-aware `OnSay` event routing with optional `platform` and `context` fields
- Command emit interception pattern: temporarily patch EventBus emit to inject LinkedIn context before calling shared command handler

**Key Patterns:**
- OAuth token refresh with retry-once pattern on 401 responses
- All LinkedIn API calls go through `apiRequest<T>()` wrapper with error handling, rate limiting detection
- Resilient polling: errors logged but never crash the process
- Graceful degradation: `LinkedInAPI.isConfigured()` checks prevent initialization if env vars missing
- Event-driven live stream lifecycle: LiveDetector callbacks trigger CommentPoller start/stop
- Commands from LinkedIn emit OnSay with `{ message, platform: 'linkedin', context: { postUrn, commentUrn } }`
- LinkedIn OnSay listener replies via `LinkedInAPI.replyToComment()` using context

**LinkedIn API Specifics:**
- Base URL: `https://api.linkedin.com/rest`
- API Version: `202401` (LinkedIn-Version header)
- Required headers: `Authorization`, `LinkedIn-Version`, `X-Restli-Protocol-Version: 2.0.0`
- Video LIVE detection: `uploadMechanism === 'LIVE' && liveStreamState === 'STREAMING'`
- Person URN format: `urn:li:person:XXX` (extract ID for API calls)
- Default avatar fallback: `https://static.licdn.com/aero-v1/sc/h/1c5u578iilxfi4m4dvc4q810q`
- Name extraction from localized objects: prefer `en_US` key or first available

**Environment Variables:**
- `LINKEDIN_CLIENT_ID`, `LINKEDIN_CLIENT_SECRET` - OAuth credentials
- `LINKEDIN_ACCESS_TOKEN`, `LINKEDIN_REFRESH_TOKEN` - OAuth tokens (refreshable)
- `LINKEDIN_PERSON_URN` - Authenticated user's LinkedIn URN
- `LINKEDIN_LIVE_DETECT_INTERVAL_MS` - Live detection polling interval (default: 120000ms)
- `LINKEDIN_POLL_INTERVAL_MS` - Comment polling interval (default: 5000ms)

**Key File Paths:**
- `src/integrations/linkedin/index.ts` - LinkedIn API client (OAuth, REST API wrapper, UserFetcher)
- `src/integrations/linkedin/liveDetector.ts` - Polls for LIVE video posts
- `src/integrations/linkedin/commentPoller.ts` - Polls comments during live streams, processes commands
- `src/commands/registry.ts` - Shared command loading, lookup, handling (imports from twitch/commands)
- `src/integrations/twitch/index.ts` - Updated to use shared registry, platform-aware OnSay handler
- `src/index.ts` - LinkedIn initialization with graceful degradation, fetcher registration, OnSay routing

**Integration Flow:**
1. Server starts → `loadCommands()` initializes shared registry
2. `LinkedInAPI.init()` loads env vars, registers as 'linkedin' fetcher
3. `LiveDetector.start()` polls for LIVE posts every 2 minutes
4. When LIVE detected → `CommentPoller.start(postUrn)` polls comments every 5 seconds
5. New comments → resolve user via UserStore → emit OnChatMessage or execute command
6. Command responses → OnSay event with LinkedIn platform → reply via LinkedIn API
7. When LIVE ends → `CommentPoller.stop()` cleans up

**Backward Compatibility:**
- Existing Twitch commands unchanged (still in `src/integrations/twitch/commands/`)
- Shared registry imports from existing location to avoid breaking imports
- Platform-aware OnSay handler only processes events without platform or with `platform === 'twitch'`
- All LinkedIn features are opt-in via environment configuration