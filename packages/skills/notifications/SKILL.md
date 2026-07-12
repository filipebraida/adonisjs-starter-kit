---
name: notifications
description: 'In-app notifications + realtime SSE in an AdonisJS + Inertia app. Stack: `@facteurjs/adonisjs` for the notification classes and delivery channels + `@adonisjs/transmit` for the SSE transport. Notifications persist to Postgres and push to a per-user SSE channel. Bell + unread badge in the logged-in shell. Emission goes through domain events. Use when adding a new notification type, wiring a listener, adding a custom SSE channel, or debugging the bell. Trigger on: "add notification", "notify user", "SSE", "bell", "facteur", "transmit".'
license: MIT
allowed-tools: Read, Edit, Write, Bash, Grep, Glob
---

# Notifications + SSE

In-app notifications persist as rows in the `notifications` table and stream to the user's personal channel in realtime via SSE. Facteur (`@facteurjs/adonisjs`) is the framework: one `Notification<User, Params>` class per type, with a `deliverBy: { database, transmit }` config and per-channel methods (`asDatabaseMessage`, `asTransmitMessage`). Transmit (`@adonisjs/transmit`) is the SSE transport — in-memory / single-node by default (`transport: null` in `config/transmit.ts`); swap to a distributed transport (e.g. Redis) when scaling out to multiple instances. Emission always goes through domain events: actions emit, a listener calls `facteur.notification(...).params(...).to([user]).send()`.

## Rules

- **A dedicated `notifications` module** owns the model, transformer, controller and routes for the bell:
  - `GET /notifications` → list + unseen count.
  - `POST /notifications/:id/read` → mark one read.
  - `POST /notifications/seen` → mark all as seen (the dot disappears; row stays "unread").
  - `POST /notifications/read` → mark all read.
- **Notification classes** live at `app/<mod>/notifications/<name>_notification.ts`, extending `Notification<User, Params>`:
  ```ts
  static options = { name: 'user-welcome', deliverBy: { database: true, transmit: true } }
  asDatabaseMessage() { return DatabaseMessage.create().setType(...).setContent({...}).setTags([...]) }
  asTransmitMessage() { return TransmitMessage.create().setContent({ kind: '...' }) }
  ```
- **User routing** via `User.notificationTargets()`:
  ```ts
  {
    database: { notifiableId: String(this.id) },
    transmit: { channel: `notifications/user-${this.id}` },
  }
  ```
  Facteur maps each channel's target automatically.
- **Emission goes through events** — see [[actions-events]]. The listener calls:
  ```ts
  await facteur.notification(SomeNotification).params({...}).to([user]).send()
  ```
- **Shared prop `unseenNotifications`** (count) is computed in the Inertia middleware when a user is authenticated. It powers the bell badge on first render — the SSE stream keeps it in sync afterward.
- **Bell UI** subscribes to the per-user channel via `useNotificationsChannel(user.id, onIncoming)`, hits the endpoint to fetch the list when opened, marks-all-seen on open, marks-read on click.
- **Frontend SSE client** is a lazy singleton: one `EventSource` on `/__transmit/events`, all channels multiplex through it.
- **SSE transport** — `apps/web/config/transmit.ts` defaults to `transport: null` (in-memory, single-node). The `@adonisjs/transmit` provider auto-registers the `/__transmit/*` routes, so the bell works out of the box. Swap `transport` for a distributed driver (Redis) when horizontally scaling.

## Doc refs

- Facteur — https://github.com/facteurjs/facteur
- AdonisJS Transmit — https://docs.adonisjs.com/guides/digging-deeper/transmit
- SSE spec (MDN) — https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events

## Workflow

### Add a new notification type

1. **Class** at `app/<mod>/notifications/<name>_notification.ts`:
   ```ts
   import { DatabaseMessage } from '@facteurjs/adonisjs/channels/database'
   import { TransmitMessage } from '@facteurjs/adonisjs/channels/transmit'
   import { Notification } from '@facteurjs/adonisjs/types'

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
2. **Emit via event**. The action does:
   ```ts
   emitter.emit('order:shipped', { user, orderId, trackingUrl })
   ```
3. **Listener** in `<mod>/start/events.ts`:
   ```ts
   emitter.on('order:shipped', async ({ user, orderId, trackingUrl }) => {
     await facteur.notification(OrderShippedNotification)
       .params({ orderId, trackingUrl })
       .to([user])
       .send()
   })
   ```
4. Frontend rendering reads `content.title` / `content.body` / `content.link` from the persisted row — the bell renders every notification uniformly. `kind` on the transmit message is available for client-side filtering by type if needed.
5. Verify: a functional spec that emits the event and asserts a notification row persisted for the user. Don't fake the emitter in a listener spec — see [[testing]].

### Custom SSE channel (not a Facteur notification)

When a background task needs to push resource-scoped state (job progress, live status), skip Facteur and broadcast directly on a per-resource channel. Requires opting into a `start/transmit.ts` preload (the default provider only auto-registers the `/__transmit/*` routes). Two rules:

1. **Channel name is the URL of the resource's route.** The backend generates it with `urlFor(...)` from `@adonisjs/core/services/url_builder`; the frontend generates it with the typed URL client. Same string, single source of truth (the route registry).
2. **Every private channel needs `transmit.authorize(pattern, callback)`** in `start/transmit.ts`. Without it any authenticated user can subscribe to any other resource's channel.

```ts
// start/transmit.ts
// The pattern is hardcoded because routes aren't committed during preload — see [[routes]].
// A functional spec asserts it equals router.findOrFail(name).pattern.
export const ORDER_CHANNEL_PATTERN = '/orders/:order_id/status'

transmit.authorize<{ order_id: string }>(
  ORDER_CHANNEL_PATTERN,
  async (ctx, params) => {
    const user = ctx.auth?.user
    if (!user) return false
    const order = await Order.find(params.order_id)
    return !!order && order.userId === user.id
  }
)
```

Broadcast from a **listener** (not from inside the job):

```ts
transmit.broadcast(
  urlFor('orders.status', { order_id: orderId }),
  { status: 'shipped', at: Date.now() }
)
```

Frontend subscribe — store the subscription **before** `create()` so cleanup on fast unmount / StrictMode still deletes:

```ts
const channel = urlFor('orders.status', { order_id: String(orderId) })
const sub = transmit.subscription(channel)
sub.onMessage(handler)
```

The bell's `notifications/user-<id>` channel is the exception — per-user, Facteur enforces the target internally. Any new custom channel gets its own `transmit.authorize`.

### Testing

- Endpoint test: insert rows directly via `Notification.create({...})` and hit the 4 endpoints.
- End-to-end listener test: `mail.fake()` first (to keep any co-fired mail from actually sending), then `await emitter.emit('event:name', payload)`, then assert the `Notification` row exists.

See [[testing]].

## Anti-patterns

- ❌ Calling `facteur.notification(...).send()` directly from an action — emit an event; the listener sends.
- ❌ Hardcoding `notifications/user-<id>` in components — use the per-user subscription hook.
- ❌ Storing render logic in the transmit message — the DB row is the durable copy; transmit is just a nudge (`{ kind: '...' }` is enough).
- ❌ Sending massive payloads over transmit — the browser refetches the list on notification; keep transmit small.
- ❌ Adding a custom channel without `transmit.authorize(pattern, callback)` — any authenticated user can subscribe.
- ❌ `router.findOrFail('...').pattern` at the top level of `start/transmit.ts` — routes aren't committed yet during preload. Hardcode the pattern and guard it with a spec — see [[routes]].
- ❌ Broadcasting from inside a job — emit a `resource:state` event and put the broadcast in the listener. Future consumers (mail, log, webhook) then attach without touching the job. See [[actions-events]].

## Related skills

[[actions-events]] · [[routes]] · [[mail]] · [[layout-shells]] · [[testing]] · [[authorization]]
