---
name: actions-events
description: 'Action + event pattern for AdonisJS. Actions are single-purpose classes with `.handle(input)`; they never touch `HttpContext` and never call side-effect code (mail, notifications, transmit) directly — they emit a domain event and a listener wired in `<mod>/start/events.ts` runs the effect. Use when adding a new action, wiring a domain event, or when a listener is what should call mail/notification/transmit. Trigger on: "create action", "emit event", "add listener", "domain event".'
license: MIT
allowed-tools: Read, Edit, Write, Bash, Grep, Glob
---

# Actions + events

Business logic lives in **actions**; cross-cutting effects run through **events**. Controllers stay thin (`policy → validate → action → response`). Actions take a plain input, never `HttpContext`. When an action needs a side effect (mail, notification, transmit, external HTTP), it **emits a domain event**; a listener in the module's `start/events.ts` receives it and runs the effect. This keeps actions synchronous domain code, keeps side effects composable (a new listener is a new file, not an edit to the action), and makes testing effortless — fake the emitter, fake the mail.

## Rules

- **Location**: `app/<mod>/actions/<verb_noun>.ts` — one file per action.
- **Shape**: default-export a class with a single public method `async handle(input): Promise<Result | void>`. `input` is a plain `interface`. No `HttpContext`.
- **Return or throw**: return the primary value (a model, an id, void). Throw domain exceptions from `app/<mod>/exceptions/` for expected failure paths (rate limits, permission denials, invariant violations).
- **Side effects go through events**. Anything that reaches out is emitted, not called inline:
  ```ts
  emitter.emit('user:registered', { user, token })
  ```
  This applies to every kind of effect without exception:

  | Kind | Example call the action must **not** make |
  | --- | --- |
  | Mail | `mail.send(new WelcomeEmail(...))` |
  | In-app notification | `facteur.notification(...).send()` |
  | SSE / realtime broadcast | `transmit.broadcast(channel, payload)` |
  | External HTTP | `fetch('https://api.stripe.com/...')` |
  | Audit log write | any write to an `audits` / `activity_logs` table that's cross-cutting |

- **Listeners** live in `app/<mod>/start/events.ts`. Register with `emitter.on('event:name', async (data) => { ... })`. Preload the file from `adonisrc.ts` so it wires at boot (see [[module-scaffolding]]).
- **Guards as helper functions** at the top of the action file — e.g. `requireManageRoles(executor)` throws if not permitted. Keeps the action body short and the guard reusable across actions.
- **Controllers call actions**: `await new Action().handle(input)`. Never instantiate an action inside another action; if two actions need shared work, extract a service (behavior with side effects) or a query (read-only).

## Repo refs

- Action shape (`.handle`, no `HttpContext`): `app/users/actions/create_user.ts`.
- Reusable defense-in-depth guards: `app/users/actions/sync_user_roles.ts`.
- Event typing (declaration merge): `app/users/types/events.ts`; listener wiring: `app/users/start/events.ts`.

## Doc refs

- AdonisJS emitter — https://docs.adonisjs.com/guides/digging-deeper/emitter

## Workflow

### Create a new action

1. Create `app/<mod>/actions/<verb_noun>.ts` (e.g. `create_invoice.ts`).
2. Declare an `interface` for the input — everything the action needs, as plain values. Pass `auth` / `session` only if the action must call `auth.use(...).login(user)`.
3. Default-export a class:
   ```ts
   export default class CreateInvoice {
     async handle(input: CreateInvoiceInput): Promise<Invoice> {
       // guards, domain logic, DB writes
       // emit if there are side effects
       return invoice
     }
   }
   ```
4. Throw domain exceptions from `app/<mod>/exceptions/` for expected failure paths.

### Emit a domain event

Inside the action, at the point the side effect should trigger:

```ts
emitter.emit('<mod>:<event>', payload)
```

Naming: `<mod>:<past-tense-verb>` — `user:registered`, `invoice:issued`, `role:changed`.

Payload: plain, serializable. Include the primary entity + whatever the listener needs. Never reach for `HttpContext` fields.

### Add a listener

1. Open (or create) `app/<mod>/start/events.ts`.
2. Add `emitter.on('<event>', async (data) => { ... })`.
3. Ensure `() => import('#<mod>/start/events')` is in `adonisrc.ts` preloads.
4. Multiple listeners on the same event are fine — one per side effect (one mail, one notification, one webhook).

### Concurrency — actions that read-then-write a sequence

When the action derives a value from the current state of a set (next `position` in a list, next `number` in a sequence, unique slug), two concurrent invocations against the same parent will both read the same max and produce a duplicate. Two-layer defense:

1. **`unique(...)` on the schema** so the DB rejects the second write. A safety net, not a UX.
2. **`db.transaction()` with `SELECT parent FOR UPDATE`** to serialize the compute-and-insert on the parent aggregate. Lock the **parent**, not the aggregated table.

```ts
async handle(input: AddItemInput): Promise<Item> {
  const item = await db.transaction(async (trx) => {
    // Lock the parent row for the length of the trx.
    await Parent.query({ client: trx })
      .where('id', input.parentId)
      .forUpdate()
      .firstOrFail()

    const last = await Item.query({ client: trx })
      .where('parent_id', input.parentId)
      .max('position as max')
      .first()

    const position = (Number((last as any)?.$extras?.max) || 0) + 1

    return Item.create(
      { parentId: input.parentId, position, ...input.payload },
      { client: trx }
    )
  })

  await emitter.emit('item:added', { item, parentId: input.parentId })
  return item
}
```

Same shape for deletes with reordering: hold the parent lock, delete, decrement the range.

Do heavy I/O (file upload, external HTTP) **outside** the transaction so the lock isn't held while bytes stream.

### Testing

- Unit-test the action with sinon stubs — see [[testing]].
- Fake the emitter in endpoint tests to verify emission without running listeners: `emitter.fake(['user:registered'])` then `fake.assertEmitted('user:registered')`.
- End-to-end listener test: `await emitter.emit('user:registered', payload)` and assert the side effect (mail sent, notification row created, etc).

## Anti-patterns

- ❌ Action takes `HttpContext` — extract the pieces it needs and pass those as plain fields.
- ❌ Action calls `mail.send(...)` / `facteur.notification(...).send()` / `transmit.broadcast(...)` directly — emit an event, let the listener do it.
- ❌ Read-then-write on a computed column (next position, next sequence number) without `.forUpdate()` on the parent + `unique(...)` on the schema — the race produces duplicates.
- ❌ Business logic in the controller (`if (user.isX) { ... } await something()`) — move it to an action.
- ❌ Multiple public methods on an action — split into separate action files.
- ❌ Listener that reaches into another module's DB directly — cross-module effects should emit their own domain event from the source module and be handled by a listener that owns the destination.
- ❌ Emitting from inside a `db.transaction(...)` — if the transaction rolls back, the listeners already ran. Emit **after** the trx commits.

## Related skills

[[module-scaffolding]] · [[routes]] · [[crud]] · [[testing]] · [[mail]] · [[notifications]]
