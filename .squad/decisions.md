# Decisions

## Multi-Platform Foundation Architecture

**Date:** 2025-02-24  
**Status:** Implemented  
**Author:** Lady Jaye (Backend Dev)

**Decision:** Implement platform-agnostic type system and user fetcher registry

**Context:** LinkedIn Live Chat integration requires supporting multiple chat platforms (Twitch, LinkedIn, YouTube) while maintaining backward compatibility with existing Twitch-only code.

**Approach:**
1. **Platform Type System** — Created `Platform` union type ('twitch' | 'linkedin' | 'youtube'); extended `StreamUser` and `OnChatMessageEvent` with platform fields; used default parameters for backward compatibility
2. **UserFetcher Interface Pattern** — Defined `UserFetcher` interface for platform-agnostic user data retrieval; refactored `UserStore` to maintain platform-specific fetcher registry; TwitchAPI conforms to UserFetcher interface
3. **Platform-Aware Data Layer** — Updated Supabase queries to filter by both `login` and `platform`; changed upsert conflict resolution to composite key `(login, platform)`; cache keys changed to `${platform}:${login}`

**Benefits:**
- Zero breaking changes to existing Twitch integrations
- Clean extension point for new platforms via UserFetcher registry
- Database properly handles same username across different platforms
- Consistent 3-tier caching pattern maintained across all platforms

**Impact:**
- Future platform integrations only need to implement UserFetcher interface
- All existing call sites work unchanged due to default parameters
- Ready for LinkedIn integration

**Files:** `src/types/platform.ts`, `src/types/userFetcher.ts`, `src/types/streamUser.ts`, `src/types/onChatMessageEvent.ts`, `src/stores/userStore.ts`, `src/integrations/supabase/index.ts`, `src/index.ts`, `.env-sample`

---

## LinkedIn Integration Architecture Decisions

**Date:** 2025-02-24  
**Status:** Implemented  
**Author:** Lady Jaye (Backend Dev)

**Context:** Implementing LinkedIn Live stream chat integration for the Overlord project. Need to support multi-platform chat (Twitch + LinkedIn), share command system across platforms, handle LinkedIn OAuth and API, detect live streams and poll comments, maintain backward compatibility.

### Decisions

**1. Shared Command Registry Pattern**  
Registry imports commands from existing Twitch location rather than moving files. Avoids breaking imports, minimizes changes, maintains single source of truth.

**2. Platform-Aware Event Routing**  
Extended `OnSay` event payload with optional `platform` and `context` fields. Each platform registers its own OnSay listener that filters by platform. Maintains backward compatibility while enabling platform-specific output routing.

**3. EventBus Emit Interception for LinkedIn Commands**  
Temporarily patch `EventBus.eventEmitter.emit` before calling `handleCommand()` to inject LinkedIn platform context into OnSay emissions. Commands remain unaware of platform; context comes from CommentPoller.

**4. Graceful Degradation for LinkedIn**  
LinkedIn integration only initializes if all required env vars are present. Missing credentials result in console log, not error. Supports development flexibility and production safety.

**5. Live Stream Detection → Comment Polling Pipeline**  
LiveDetector and CommentPoller are separate classes with callback-based coordination. Separation of concerns: detection (2min frequency) vs. processing (5sec frequency during live streams).

**6. LinkedIn API Request Wrapper Pattern**  
All LinkedIn API calls go through single `apiRequest<T>()` method that handles auth, retries (401 with token refresh), and errors. Centralized error handling, automatic retry logic, rate limit detection.

**Benefits:**
- Multi-platform support without disrupting existing Twitch integration
- Shared command system reduces duplication
- Resilient polling with error handling
- Clean separation of concerns (detection vs. polling vs. command handling)

**Risks:**
- EventBus emit interception is unconventional (but contained and well-documented)
- LinkedIn API rate limits could cause comment delays (mitigated with configurable intervals)

**Future Considerations:**
- YouTube integration can follow same pattern
- Command throttling currently disabled for LinkedIn (all commands have `sinceLastCommand: { any: 0, user: 0 }`)
- Consider persistent comment ID tracking across server restarts
- LinkedIn comment replies are fire-and-forget (no retry on failure)
