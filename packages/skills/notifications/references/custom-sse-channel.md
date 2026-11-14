# Custom SSE channel (not a Facteur notification)

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

Broadcast from a **workflow step** — the task emits a domain event, its listener only dispatches the workflow (see [[actions-events]]):

```ts
await ctx.localStep('broadcast', async () => {
  transmit.broadcast(urlFor('orders.status', { order_id: input.orderId }), {
    status: 'shipped',
  })
})
```

Frontend subscribe — store the subscription **before** `create()` so cleanup on fast unmount / StrictMode still deletes:

```ts
const channel = urlFor('orders.status', { order_id: String(orderId) })
const sub = transmit.subscription(channel)
sub.onMessage(handler)
```

The bell's `notifications/user-<id>` channel is the exception — per-user, Facteur enforces the target internally. Any new custom channel gets its own `transmit.authorize`.

## Anti-patterns

- ❌ Adding a custom channel without `transmit.authorize(pattern, callback)` — any authenticated user can subscribe.
- ❌ `router.findOrFail('...').pattern` at the top level of `start/transmit.ts` — routes aren't committed yet during preload. Hardcode the pattern and guard it with a spec — see [[routes]].
- ❌ Broadcasting from inside the task or from a listener — emit a `resource:state` event; its listener schedules a workflow and the broadcast is a step of it. Future consumers (mail, log, webhook) then attach without touching the task. See [[actions-events]].
