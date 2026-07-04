---
name: notifications
description: 'In-app notifications + realtime SSE. Stack: `@facteurjs/adonisjs` framework for the notification classes and delivery channels + `@adonisjs/transmit` for the SSE transport. Notifications persist to Postgres and push to a per-user SSE channel. Bell + unread badge live in the logged-in shells. Emission goes through events. Use when adding a new notification type, wiring a listener, or debugging the bell. Trigger on: "add notification", "notify user", "SSE", "bell", "facteur", "transmit".'
license: MIT
allowed-tools: Read, Edit, Write, Bash, Grep, Glob
---

# Notifications + SSE

In-app notifications persist as rows in the `notifications` table and stream to the user's personal channel in realtime via SSE. Facteur (`@facteurjs/adonisjs`) is the framework — you define one `Notification<User, Params>` class per type with a `deliverBy: { database, transmit }` config and per-channel methods (`asDatabaseMessage`, `asTransmitMessage`). Transmit (`@adonisjs/transmit`) is the SSE transport; it's in-memory / mono-node by default (fine for a single Node process), swap `transport` for a Redis driver when scaling out. Emission always goes through events — actions emit a domain event, a listener calls `facteur.notification(...).params(...).to([user]).send()`.

## Conventions

- **Notification module** at `app/notifications/` holds the model, transformer, controller, and routes for the bell:
  - `GET /notifications` → list + unseen count.
  - `POST /notifications/:id/read` → mark one read.
  - `POST /notifications/seen` → mark all as seen (dot disappears; row stays "unread").
  - `POST /notifications/read` → mark all read.
- **Notification classes** live per domain at `app/<mod>/notifications/<name>_notification.ts`, extending `Notification<User, Params>`:
  ```ts
  static options = { name: 'user-welcome', deliverBy: { database: true, transmit: true } }
  asDatabaseMessage() { return DatabaseMessage.create().setType(...).setContent({...}).setTags([...]) }
  asTransmitMessage() { return TransmitMessage.create().setContent({ kind: '...' }) }
  ```
- **User routing** via `User.notificationTargets()`:
  ```ts
  { database: { notifiableId: String(this.id) }, transmit: { channel: `notifications/user-${this.id}` } }
  ```
  Facteur maps each channel's target automatically.
- **Emission goes through events** — see [[actions-events]]. The listener does:
  ```ts
  await facteur.notification(SomeNotification).params({...}).to([user]).send()
  ```
- **Shared prop `unseenNotifications`** (count) is computed synchronously in `inertia_middleware.ts` when a user is authenticated. It powers the bell badge on first render.
- **Bell UI** in the shells' header — `<NotificationBell />` from `#common/ui/components/notification_bell.tsx`. Subscribes to `notifications/user-<id>` via `useNotificationsChannel(userId, onIncoming)`; hits the endpoint to fetch the list on open; marks all-seen when opened; marks-read on click.
- **Frontend SSE client** is a singleton lazily loaded from `use_transmit.ts` (dynamic import so it's its own chunk). One `EventSource` on `/__transmit/events`, all channels multiplex through it.
- **SSE transport** is in-memory / mono-node. `apps/web/config/transmit.ts` sets `transport: null`. For horizontal scaling, swap for a distributed driver (Redis).
- **Beta caveat**: `@facteurjs/adonisjs` is pinned at `2.0.0-beta.8`. Read release notes before bumping.

## Repo refs

- Facteur config: `apps/web/config/notifications.ts` (`databaseAdapter: lucid`, `channels: { database, transmit }`).
- Transmit config: `apps/web/config/transmit.ts`.
- Notification model: `apps/web/app/notifications/models/notification.ts` (`notifiable_id`, `type`, `content` JSON, `status`, `tags`, `read_at`, `seen_at`).
- Migrations: `apps/web/app/notifications/database/migrations/*` (`notifications` + `notification_preferences`).
- Controller: `apps/web/app/notifications/controllers/notifications_controller.ts` (index / markRead / markAllSeen / markAllRead).
- Routes: `apps/web/app/notifications/routes.ts` (auth-protected group).
- Transformer: `apps/web/app/notifications/transformers/notification_transformer.ts`.
- Canonical notification class: `apps/web/app/users/notifications/user_welcome_notification.ts`.
- User targets: `apps/web/app/users/models/user.ts` → `notificationTargets()`.
- Emission via listener: `apps/web/app/users/start/events.ts` (`user:registered` → welcome mail + welcome notification).
- Shared prop wiring: `apps/web/app/core/middleware/inertia_middleware.ts` (`unseenNotifications` count query).
- Bell UI: `apps/web/app/common/ui/components/notification_bell.tsx`.
- SSE singleton: `apps/web/app/common/ui/hooks/use_transmit.ts`.
- Per-user subscription hook: `apps/web/app/common/ui/hooks/use_notifications_channel.ts`.
- End-to-end listener test: `apps/web/app/users/tests/functional/user_welcome_notification.spec.ts`.
- Endpoint test: `apps/web/app/notifications/tests/functional/notifications_endpoint.spec.ts`.

## Doc refs

- Facteur — https://github.com/facteurjs/facteur (beta; no formal docs site yet).
- AdonisJS Transmit — https://docs.adonisjs.com/guides/digging-deeper/transmit
- SSE spec (MDN) — https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events

## Workflow

### Add a new notification type

1. **Class** at `app/<mod>/notifications/<name>_notification.ts`:
   ```ts
   import { DatabaseMessage } from '@facteurjs/adonisjs/channels/database'
   import { TransmitMessage } from '@facteurjs/adonisjs/channels/transmit'
   import { Notification } from '@facteurjs/adonisjs/types'
   import type User from '#users/models/user'

   export interface OrderShippedParams { orderId: number; trackingUrl: string }

   export default class OrderShippedNotification extends Notification<User, OrderShippedParams> {
     static options = { name: 'order-shipped', deliverBy: { database: true, transmit: true } }

     asDatabaseMessage() {
       const { orderId, trackingUrl } = this.params
       return DatabaseMessage.create()
         .setType('order-shipped')
         .setContent({ title: 'Your order shipped', body: `Order #${orderId}`, link: trackingUrl })
         .setTags(['order', 'shipping'])
     }

     asTransmitMessage() {
       return TransmitMessage.create().setContent({ kind: 'order-shipped' })
     }
   }
   ```
2. **Emit via event**. Action does `emitter.emit('order:shipped', { user, orderId, trackingUrl })`.
3. **Listener** in `<mod>/start/events.ts`:
   ```ts
   emitter.on('order:shipped', async ({ user, orderId, trackingUrl }) => {
     await facteur.notification(OrderShippedNotification)
       .params({ orderId, trackingUrl })
       .to([user])
       .send()
   })
   ```
4. Frontend content is driven by `content.title` / `content.body` / `content.link` from the DB row — the bell renders them uniformly. The `kind` on the transmit message can be used later to filter by type on the client if needed.

### Change the bell UX

`apps/web/app/common/ui/components/notification_bell.tsx` — self-contained. Consumes `unseenNotifications` shared prop + hits the 4 endpoints.

### Move SSE to Redis (multi-instance)

Swap `transport: null` in `config/transmit.ts` for the Redis driver and add Redis to `docker-compose.yaml`. Adonis Transmit reads a distributed transport transparently — the notification class code doesn't change.

### Testing

- Endpoint test: insert rows directly via `Notification.create({...})` and hit the 4 endpoints. See `notifications_endpoint.spec.ts`.
- End-to-end listener test: `mail.fake()` first (to not send real mail from the same listener), then `await emitter.emit('user:registered', payload)`, then assert the `Notification` row. See `user_welcome_notification.spec.ts` and [[testing]].

## Anti-patterns

- ❌ Calling `facteur.notification(...).send()` directly from an action — emit an event; the listener sends.
- ❌ Hardcoding `notifications/user-<id>` in components — use `useNotificationsChannel(user.id, callback)`.
- ❌ Storing render logic in the transmit message — the DB row is the durable copy; transmit is just a nudge (`{ kind: '...' }` is enough).
- ❌ Sending massive payloads over transmit — the browser refetches the list on notification; keep transmit small.
- ❌ Assuming SSE works across multiple Node instances — swap `transport` before scaling out.
- ❌ Bumping `@facteurjs/adonisjs` past `beta.8` without checking release notes — it's beta.

## Related skills

[[actions-events]] · [[mail]] · [[layout-shells]] · [[testing]] · [[authorization]]
