# Squad — Overlord Stream Team

## Project Context

- **Project:** Overlord — Twitch Bot & Stream Overlay Platform
- **User:** Michael Jolley
- **Tech Stack:** TypeScript, Fastify, Node.js, Vue 3, WebSocket, Supabase, ComfyJS
- **Description:** Overlord is a Twitch bot and browser-based overlay system for live streaming. It handles chat messages, commands, events (follows, subs, raids), sound effects, and announcements. The chat overlay renders messages with profile images, badges, and platform-specific styling. Currently integrating LinkedIn Live comment ingestion for simulcast support, with YouTube planned next.

## Members

| Name | Role | Scope | Emoji |
|------|------|-------|-------|
| Flint | Lead | Architecture, code review, integration design, cross-cutting coordination | 🏗️ |
| Lady Jaye | Backend Dev | API integrations, LinkedIn client, pollers, event system, stores | 🔧 |
| Roadblock | Frontend Dev | Chat overlay, Vue 3 components, CSS styling, WebSocket client | ⚛️ |
| Breaker | Tester | Tests, edge cases, backward compatibility validation | 🧪 |
| Stalker | Scribe | Memory, decisions, session logs | 📋 |
| Mainframe | Work Monitor | Work queue, backlog, issue tracking | 🔄 |

## Key Paths

| Area | Path |
|------|------|
| Types | `src/types/` |
| Stores | `src/stores/` |
| Twitch Integration | `src/integrations/twitch/` |
| LinkedIn Integration | `src/integrations/linkedin/` |
| Supabase Integration | `src/integrations/supabase/` |
| Shared Commands | `src/commands/` |
| Chat Overlay JS | `src/web/js/` |
| Chat Overlay CSS | `src/web/css/` |
| Event System | `src/eventBus.ts`, `src/botEvents.ts` |
| Server Entry | `src/index.ts` |
| Logger | `src/logger/` |
| WebSocket | `src/websocket/` |
