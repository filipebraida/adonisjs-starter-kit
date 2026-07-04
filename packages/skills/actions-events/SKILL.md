---
name: actions-events
description: 'Action + event pattern for this repo. Actions are single-purpose classes with `.handle(input)`; they never touch HttpContext and never call side-effect code (mail, notifications, transmit) directly — they emit a domain event and a listener wired in `<mod>/start/events.ts` runs the effect. Use when adding a new action, wiring a domain event, or when a listener is what should call mail/notification. Trigger on: "create action", "emit event", "add listener", "domain event".'
license: MIT
allowed-tools: Read, Edit, Write, Bash, Grep, Glob
---

# Actions + events

Business logic lives in **actions**; cross-cutting effects run through **events**. Controllers stay thin (validate → policy → action → response). Actions take a plain input, never `HttpContext`. When an action needs a side effect (mail, notification, transmit, external API), it emits a domain event; a listener in the module's `start/events.ts` receives it and runs the effect. This keeps actions synchronous domain code and makes testing effortless — fake the emitter, fake the mail.

## Conventions

- **Location**: `app/<mod>/actions/<verb_noun>.ts` — one file per action.
- **Shape**: default-export a class with a single public method `async handle(input): Promise<Result | void>`. Input is a plain `interface`. No `HttpContext` on the input.
- **Return or throw**: return the primary value (a model, an id, void). Throw domain exceptions from `app/<mod>/exceptions/` for expected failure paths (rate limits, permission denials, invariant violations).
- **Side effects go through events**. Anything that reaches out — mail, notifications, transmit, third-party APIs — is emitted, not called inline:
  ```ts
  emitter.emit('user:registered', { user, token, translations })
  ```
- **Listeners live in** `app/<mod>/start/events.ts`. Register with `emitter.on('event:name', async (data) => { ... })`. Preload the file from `adonisrc.ts` so it wires up at boot.
- **Guards as helper functions** at the top of the action file — e.g. `requireManageRoles(executor)` throws if not permitted. Keep the action body short.
- **Controllers call actions**: `await new Action().handle(input)`. Never instantiate an action inside another action; if two actions need shared work, extract a service.

## Repo refs

- Simple action: `apps/web/app/auth/actions/sign_in.ts` — session regen + login.
- Action with event emission: `apps/web/app/users/actions/invite_user.ts` (`emitter.emit('user:registered', ...)` at the end).
- Listener registration: `apps/web/app/users/start/events.ts` — receives `user:registered`, sends mail + facteur notification.
- Preload wiring: `apps/web/adonisrc.ts:82-100` (`() => import('#users/start/events')`).
- Guards + escalation pattern: `apps/web/app/users/actions/sync_user_roles.ts` (`requireManageRoles`, `requireManageRolesIfEscalating`, `AdminLockoutException`).
- Domain exceptions: `apps/web/app/users/exceptions/admin_lockout.ts`, `apps/web/app/auth/exceptions/`.

## Doc refs

- AdonisJS emitter — https://docs.adonisjs.com/guides/digging-deeper/emitter

## Workflow

### Create a new action

1. Create `app/<mod>/actions/<verb_noun>.ts` (e.g. `create_invoice.ts`).
2. Declare an `interface` for the input — everything the action needs, as plain values. Pass `auth`/`session` only if the action must call `auth.use(...).login(user)`.
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

Payload: plain, serializable. Include the primary entity + whatever the listener needs. Don't reach for `HttpContext` fields.

### Add a listener

1. Open (or create) `app/<mod>/start/events.ts`.
2. Add `emitter.on('<event>', async (data) => { ... })`.
3. Ensure `() => import('#<mod>/start/events')` is in `adonisrc.ts` preloads.
4. Multiple listeners on the same event are fine — one per side effect (one mail, one notification, one webhook).

### Testing

- Unit test the action with sinon stubs — see [[testing]].
- Fake the emitter in endpoint tests to verify emission without running listeners: `emitter.fake(['user:registered'])` then `fake.assertEmitted('user:registered')`.
- End-to-end listener test: `await emitter.emit('user:registered', payload)` and assert the side effect (mail sent, notification row, etc).

## Anti-patterns

- ❌ Action takes `HttpContext` — extract the pieces it needs and pass those.
- ❌ Action calls `mail.send(...)` / `facteur.notification(...).send()` directly — emit an event, let the listener do it.
- ❌ Business logic in controller (`if (user.isX) { ... } await something()`) — move it to an action.
- ❌ Multiple public methods on an action — split into separate action files.
- ❌ Listener that reaches into another module's DB directly — cross-module effects should also emit their own domain event.

## Related skills

[[testing]] · [[mail]] · [[notifications]] · [[crud]]
