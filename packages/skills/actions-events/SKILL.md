---
name: actions-events
description: 'Action + event pattern for AdonisJS. Actions are single-purpose classes with `.handle(input)`; they never touch `HttpContext` and never call side-effect code (mail, notifications, transmit) directly — they emit a domain event, a listener bound in `<mod>/start/events.ts` only schedules a durable workflow (`@adonis-agora/durable`), and the workflow runs the effect in checkpointed steps. Use when adding a new action, wiring a domain event, adding a listener or a workflow, or deciding where mail/notification/transmit is called. Trigger on: "create action", "emit event", "add listener", "domain event", "workflow", "durable".'
license: MIT
allowed-tools: Read, Edit, Write, Bash, Grep, Glob
---

# Actions + events

Business logic lives in **actions**; cross-cutting effects run through **events**. Controllers stay thin (`policy → validate → action → response`). Actions take a plain input, never `HttpContext`. When an action needs a side effect (mail, notification, transmit, external HTTP), it **emits a domain event**. The module's `start/events.ts` binds a listener class to it; the listener only **schedules** a durable workflow (`XWorkflow.dispatch(plainData)`), and the workflow performs the effect inside checkpointed steps that retry on failure. The in-process emitter has no retry, so an effect run inside a listener is lost when it fails; the workflow's run lives in Postgres and survives a crash. This keeps actions synchronous domain code, keeps side effects composable (a new listener is a new file, not an edit to the action), and makes each layer testable on its own — fake the emitter, stub `dispatch`, run the workflow on a test engine.

## Rules

- **Location**: `app/<mod>/actions/<verb_noun>.ts` — one file per action.
- **Shape**: default-export a class with a single public method `async handle(input): Promise<Result | void>`. `input` is a plain `interface`. No `HttpContext`.
- **Return or throw**: return the primary value (a model, an id, void). Throw domain exceptions from `app/<mod>/exceptions/` for expected failure paths (rate limits, permission denials, invariant violations).
- **Side effects go through events**. Anything that reaches out is emitted, not called inline:

  ```ts
  emitter.emit('user:registered', { user, token })
  ```

  This applies to every kind of effect without exception:

  | Kind                     | Example call the action must **not** make                             |
  | ------------------------ | --------------------------------------------------------------------- |
  | Mail                     | `mail.send(new WelcomeEmail(...))`                                    |
  | In-app notification      | `facteur.notification(...).send()`                                    |
  | SSE / realtime broadcast | `transmit.broadcast(channel, payload)`                                |
  | External HTTP            | `fetch('https://api.stripe.com/...')`                                 |
  | Audit log write          | any write to an `audits` / `activity_logs` table that's cross-cutting |

- **Bindings** live in `app/<mod>/start/events.ts`, and only there: `emitter.on('event:name', [() => import('#<mod>/listeners/<name>')])` — a lazy import of a listener class, never an inline closure. Preload the file from `adonisrc.ts` so it wires at boot (see [[module-scaffolding]]).
- **Listeners only schedule.** `app/<mod>/listeners/<verb_object>.ts` default-exports a class whose `handle(event)` calls `XWorkflow.dispatch({...})` with plain, serializable data (ids, tokens, already-translated strings), never a Lucid model. No `mail.send`, no `facteur`, no `transmit`, no DB read or write in the listener.
- **Workflows do the effect.** `app/<mod>/workflows/<verb_object>_workflow.ts` extends `BaseWorkflow` with `static workflow = { name: '<mod>.<verb-object>', version: '1' }` and a `run(ctx, input)` whose every side effect sits in its own `ctx.localStep('<name>', fn, { retries, backoff })`. Each step is checkpointed, so a retry of a failed step does not repeat the steps that already succeeded. Reload models by id inside the step. The workflow folder must be listed in `workflowsPath` (`config/durable.ts`) **and** in the `workflowsHook` `source` of `adonisrc.ts`.
- **Guards as helper functions** at the top of the action file — e.g. `requireManageRolesIfEscalating(executor, roles)` throws if not permitted. Keeps the action body short and the guard reusable across actions.
- **Controllers call actions**: `await new Action().handle(input)`. An action never calls another action (the lint enforces it; `sync_user_roles` is the one named exception in `apps/web/eslint.config.js`); if two actions need shared work, extract a service (behavior with side effects), a model method, or a query (read-only).

## Repo refs

- Action shape (`.handle`, no `HttpContext`): `app/users/actions/create_user.ts`.
- Reusable defense-in-depth guards: `app/auth/actions/sync_user_roles.ts`.
- Event typing (declaration merge): `app/users/types/events.ts`; binding: `app/users/start/events.ts`.
- Listener that only schedules: `app/users/listeners/send_welcome.ts`. Workflow with two steps (mail + in-app notification): `app/users/workflows/send_welcome_workflow.ts`. Single-step workflow: `app/auth/workflows/send_password_reset_workflow.ts`.
- Durable config (Postgres transport + store, embedded worker, retention of mail runs): `config/durable.ts`; codegen hook: `adonisrc.ts` → `workflowsHook`.

## Doc refs

- AdonisJS emitter — https://docs.adonisjs.com/guides/digging-deeper/emitter
- `@adonis-agora/durable` — the package ships its own skills in `apps/web/node_modules/@adonis-agora/durable/skills/` (`durable-workflows`, `durable-determinism`, `durable-reliability`). Read them before using anything beyond `ctx.localStep`.

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

### Add a listener + workflow

1. **Workflow** at `app/<mod>/workflows/<verb_object>_workflow.ts`:
   ```ts
   import { BaseWorkflow, type WorkflowCtx } from '@adonis-agora/durable'
   import mail from '@adonisjs/mail/services/main'

   /** What the run keeps: plain data, never the model. */
   export interface SendInvoiceInput {
     invoiceId: number
     translations: MailBasicTranslation
   }

   export default class SendInvoiceWorkflow extends BaseWorkflow {
     static workflow = { name: 'billing.send-invoice', version: '1' }

     async run(ctx: WorkflowCtx, input: SendInvoiceInput) {
       await ctx.localStep(
         'mail',
         async () => {
           const invoice = await Invoice.findOrFail(input.invoiceId)
           await mail.send(new InvoiceIssuedNotification(invoice, input.translations))
         },
         { retries: 5, backoff: 'exp', backoffMs: 1000 }
       )
     }
   }
   ```
   One `ctx.localStep` per effect (mail, notification, webhook), each with a stable name. Nothing with I/O outside a step: the body replays on every turn. Changing the steps of a live workflow means bumping `version` (see the `durable-determinism` skill).
2. **First workflow of the module?** Add `'app/<mod>/workflows'` to `workflowsPath` in `config/durable.ts` and to `workflowsHook({ source: [...] })` in `adonisrc.ts`. Names are unique across folders — prefix them with the module.
3. **Listener** at `app/<mod>/listeners/<verb_object>.ts`:
   ```ts
   import type { EventsList } from '@adonisjs/core/types'

   import SendInvoiceWorkflow from '#billing/workflows/send_invoice_workflow'

   /** Schedules the invoice mail; the workflow sends it. */
   export default class SendInvoice {
     async handle({ invoice, translations }: EventsList['invoice:issued']) {
       await SendInvoiceWorkflow.dispatch({
         invoiceId: invoice.id,
         translations,
       })
     }
   }
   ```
4. **Bind** it in `app/<mod>/start/events.ts`: `emitter.on('invoice:issued', [() => import('#billing/listeners/send_invoice')])`, and make sure `() => import('#<mod>/start/events')` is in `adonisrc.ts` preloads.
5. Several listeners on the same event are fine — one per independent effect. Effects that belong together (a mail and its in-app notification) are two steps of one workflow.

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

One spec per layer, each in the folder that mirrors its source — see [[testing]]:

- **Action** (`tests/unit/actions/`): `using fake = emitter.fake(['user:registered'])`, call the action, `fake.assertEmitted('user:registered')`.
- **Listener** (`tests/unit/listeners/`): `sinon.stub(XWorkflow, 'dispatch')`, call `new Listener().handle(payload)`, assert `dispatch` got the plain data. Canonical: `app/users/tests/unit/listeners/send_welcome.spec.ts`.
- **Workflow** (`tests/unit/workflows/`): run it on `createTestEngine()` from `@adonis-agora/durable/testing`, `assertRunStatus(t.store, runId, 'completed')`, then assert the effect (`using mails = mail.fake()`, notification row). Canonical: `app/users/tests/unit/workflows/send_welcome_workflow.spec.ts`.

## Anti-patterns

- ❌ Action takes `HttpContext` — extract the pieces it needs and pass those as plain fields.
- ❌ Action calls `mail.send(...)` / `facteur.notification(...).send()` / `transmit.broadcast(...)` directly — emit an event; the listener schedules a workflow that does it.
- ❌ Listener that sends the mail or notification itself, or reads/writes the DB — it has no retry; dispatch a workflow.
- ❌ Inline closure in `emitter.on(...)` — bind a listener class by lazy import.
- ❌ A Lucid model in `dispatch(...)` input — the run stores JSON; pass the id and reload inside the step.
- ❌ I/O in a workflow's `run` outside `ctx.localStep` — it re-executes on every replay and is never checkpointed.
- ❌ Read-then-write on a computed column (next position, next sequence number) without `.forUpdate()` on the parent + `unique(...)` on the schema — the race produces duplicates.
- ❌ Business logic in the controller (`if (user.isX) { ... } await something()`) — move it to an action.
- ❌ Multiple public methods on an action — split into separate action files.
- ❌ Listener that reaches into another module's DB directly — cross-module effects should emit their own domain event from the source module and be handled by a listener that owns the destination.
- ❌ Emitting from inside a `db.transaction(...)` — if the transaction rolls back, the listeners already ran. Emit **after** the trx commits.

## Related skills

[[module-scaffolding]] · [[routes]] · [[crud]] · [[testing]] · [[mail]] · [[notifications]]
