## Learnings

### 2025-01-XX - LinkedIn Chat Styling
Added LinkedIn-specific styling to the chat overlay following the existing platform badge pattern:

**chat.js changes:**
- Added `linkedin: onChatMessageEvent.source === 'linkedin'` to the message div's `:class` binding (line 128)
- This conditionally applies the `.linkedin` class when messages come from LinkedIn

**CSS changes:**
- Added `--brand-linkedin-light: #4DA3E8` variable to `_global.css` for lighter LinkedIn blue shade
- Added `.linkedin` styles to `chat.css` following the existing `.mod`, `.vip`, `.highlighted` pattern:
  - `.linkedin .panel` — rotating conic gradient border using LinkedIn blue shades
  - `.linkedin .bubble` — subtle radial gradient background with blue glow from bottom-left
  - `.linkedin .name > div` — LinkedIn blue text color with background-clip
  - `.linkedin span` — lighter LinkedIn blue for mentions
  - `.linkedin .user` — rotating LinkedIn blue border matching panel

**Pattern followed:** Platform-specific styling uses CSS classes with conic gradient borders and themed colors while maintaining the existing bubble structure and 60-second TTL animations.
