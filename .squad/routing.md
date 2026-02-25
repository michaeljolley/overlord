# Routing Rules

## File-Based Routing

| Pattern | Agent | Reason |
|---------|-------|--------|
| `src/integrations/linkedin/**` | Lady Jaye | LinkedIn integration |
| `src/integrations/twitch/**` | Lady Jaye | Twitch integration |
| `src/integrations/supabase/**` | Lady Jaye | Database layer |
| `src/stores/**` | Lady Jaye | Data stores |
| `src/commands/**` | Lady Jaye | Shared command system |
| `src/types/**` | Lady Jaye | Type definitions |
| `src/index.ts` | Lady Jaye | Server entry |
| `src/eventBus.ts` | Lady Jaye | Event system |
| `src/botEvents.ts` | Lady Jaye | Event definitions |
| `src/logger/**` | Lady Jaye | Logging |
| `src/websocket/**` | Lady Jaye | WebSocket server |
| `src/web/js/**` | Roadblock | Overlay JavaScript |
| `src/web/css/**` | Roadblock | Overlay CSS |
| `src/web/**/*.html` | Roadblock | Overlay pages |
| `.env-sample` | Lady Jaye | Environment config |

## Domain Routing

| Domain | Agent |
|--------|-------|
| API clients, OAuth, polling | Lady Jaye |
| Data stores, caching, Supabase | Lady Jaye |
| Event system, command system | Lady Jaye |
| Server startup, wiring | Lady Jaye |
| Chat overlay UI, styling, badges | Roadblock |
| WebSocket client-side | Roadblock |
| Architecture, cross-cutting | Flint |
| Code review, PR review | Flint |
| Test creation, coverage | Breaker |

## Escalation

- Cross-domain changes (Backend + Frontend) → Flint coordinates
- New platform integrations → Lady Jaye primary, Flint reviews
- Event system changes → Lady Jaye + Flint jointly
