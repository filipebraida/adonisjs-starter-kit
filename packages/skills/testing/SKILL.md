---
name: testing
description: 'Japa test patterns for an AdonisJS app. Functional specs hit real Postgres wrapped in per-test transactions; unit specs stub deps with sinon. Fakes are mandatory for anything that reaches out (mail, drive, emitter, transmit). Trigger on: "write test", "add spec", "cover with tests", "how do we test X", "mock", "fake", "stub".'
license: MIT
allowed-tools: Read, Edit, Write, Bash, Grep, Glob
---

# Testing

Two suites: **unit** for action/service internals with dependencies stubbed; **functional** for HTTP endpoints hit against a real Postgres wrapped in a per-test transaction. Every spec matches the shape of the nearest existing spec — same imports, same setup/teardown order, same helpers. Anything that reaches out (mail, drive, emitter, transmit, third-party HTTP) must be faked; a global mail fake in `tests/bootstrap.ts` is a safety net so a forgotten setup doesn't send a real email.

## Mandatory fakes by dependency

Every side-effect dependency needs an explicit fake so no test reaches real infra:

| Dependency | How to fake | Scope |
| --- | --- | --- |
| Mail | `mail.fake()` | Global in `tests/bootstrap.ts` + per-test when asserting |
| Drive | `drive.fake(env.get('DRIVE_DISK') ?? 'fs')` | Per-group setup + teardown |
| Emitter | `emitter.fake(['event:name'])` → `EventsBuffer` | Per-test opt-in |
| Transmit (SSE) | `transport: null` in `config/transmit.ts` (default) | Global |

`emitter.fake` takes an **array** of event names — a bare string is a TypeScript error:

```ts
const events = emitter.fake(['user:registered']) // ✅
// emitter.fake('user:registered')               // ❌ wrong type
```

## Rules

- **Location**: `app/<mod>/tests/{unit,functional}/*.spec.ts`.
- **Group setup**: every group opens with `group.each.setup(() => testUtils.db().wrapInGlobalTransaction())` when the code under test touches DB (nearly always).
- **RBAC helpers**: functional specs involving roles/permissions call `group.each.setup(() => ensureBaseRoles())`; assign per user with `withRole(user, ROLES.X)` / `withPermissions(user, [...])`.
- **Emitter fake**: to isolate an endpoint from its listeners, `const fake = emitter.fake(['event:name'])` in setup + `emitter.restore()` in teardown. Assert with `fake.assertEmitted('event:name')` / `fake.assertNoneEmitted()`.
- **Mail fake**: `const mails = mail.fake()` in the test, then `mails.assertSent(Notification, (msg) => ...)` or `mails.assertNoneSent()`.
- **Drive fake**: `drive.fake(...)` in group setup, `drive.restore(...)` in teardown. Assert with `disk.assertExists(path)`, `disk.assertMissing(path)`.
- **Sinon** for stubbing services, drivers, and single functions in unit tests: `sinon.stub<[Arg], Promise<Ret>>().resolves(...)`. Always `group.each.teardown(() => sinon.restore())`.
- **Factories over fixtures** — use `UserFactory.create()` / `UserFactory.merge({...}).create()` instead of hand-building rows.
- **CSRF**: POST/PUT/DELETE must include `.withCsrfToken()` — shield middleware is enforced.
- **Auth**: use `.loginAs(user)` on the request builder — sets the session cookie for that user's guard.
- **JSON vs HTML**: chain `.accept('json')` when asserting a JSON response body, `.withInertia()` for Inertia flows so the exception handler treats the request as UI.
- **DB assertions**: `db.assertHas('table', { column: value })`, `db.assertMissing('table', { ... })` — plugin from `@adonisjs/lucid/plugins/db`.

## Doc refs

- Japa runner — https://japa.dev/docs
- AdonisJS testing intro — https://docs.adonisjs.com/guides/testing/introduction
- Fake mail / drive — https://docs.adonisjs.com/guides/digging-deeper/mail#fakes

## Workflow

### Functional endpoint spec

```ts
import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'

import { UserFactory } from '#users/database/factories/user'
import { ROLES } from '#users/enums/role'
import { ensureBaseRoles, withRole } from '#tests/helpers/rbac'

test.group('Endpoint POST /invoices', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())
  group.each.setup(() => ensureBaseRoles())

  test('admin creates invoice', async ({ client, db }) => {
    const admin = await UserFactory.create()
    await withRole(admin, ROLES.ADMIN)

    const response = await client
      .post('/invoices')
      .loginAs(admin)
      .withCsrfToken()
      .json({ amount: 100, currency: 'BRL' })

    response.assertStatus(302)
    await db.assertHas('invoices', { amount: 100 })
  })
})
```

Cover: **unauth** (302 → /login), **forbidden** (via `.withInertia()` + `db.assertHas` — see below), **validation error** (422 when JSON), **happy path**.

### Testing authorization in an Inertia app

The exception handler for `E_AUTHORIZATION_FAILURE` branches on `Accept`:

- **JSON**: returns **403**.
- **HTML / Inertia** (what the real client sends): flashes + `redirect().back()` → **302**.

`.assertStatus(403)` on `.accept('json')` exercises a code path the UI never triggers. Assert the **effect** — the state that would change if the block failed:

```ts
test('non-owner cannot delete another user\'s post', async ({ client, db }) => {
  const owner = await UserFactory.create()
  const stranger = await UserFactory.create()
  const post = await PostFactory.merge({ userId: owner.id }).create()

  await client
    .delete(`/posts/${post.id}`)
    .loginAs(stranger)
    .withInertia()
    .withCsrfToken()
    .redirects(0)

  await db.assertHas('posts', { id: post.id }) // row still exists → policy blocked
})
```

Rules of thumb:

- Ownership tests use `.withInertia()` + `db.assertMissing` / `db.assertHas` to check the effect.
- Only assert status codes when the client cares about the exact number (422, `Location: /login`).

### Unit spec for an action

```ts
import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'
import sinon from 'sinon'

import CreateInvoice from '#invoices/actions/create_invoice'

test.group('CreateInvoice', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())
  group.each.teardown(() => sinon.restore())

  test('persists + emits invoice:issued', async ({ db, assert }) => {
    const invoice = await new CreateInvoice().handle({
      amount: 100,
      currency: 'BRL',
    })

    assert.equal(invoice.amount, 100)
    await db.assertHas('invoices', { id: invoice.id })
  })
})
```

To stub an injected dep (like an auth guard), fake the ctx shape with `as unknown as`:

```ts
const login = sinon.stub<[User], Promise<void>>().resolves()
const auth = { use: () => ({ login }) } as unknown as Parameters<Action['handle']>[0]['auth']
```

### Faking side effects

- **Mail** — asserted per-message:
  ```ts
  const mails = mail.fake()
  await someAction()
  mails.assertSent(WelcomeNotification, (msg) => msg.to === user.email)
  ```
- **Emitter** — verify emit without running the listener:
  ```ts
  const fake = emitter.fake(['user:registered'])
  // ... trigger endpoint
  fake.assertEmitted('user:registered')
  ```
- **Emitter with listener** — for end-to-end listener specs, do **not** fake the emitter. `mail.fake()` first (so the listener's mail send is captured, not sent), then `await emitter.emit('user:registered', payload)`, then assert the effect (DB row created, mail sent, etc).

## Anti-patterns

- ❌ Skipping `wrapInGlobalTransaction()` — rows leak between tests, ordering matters, flakiness appears.
- ❌ Hand-built fixture rows when a factory exists — inconsistent baseline data.
- ❌ Real network / mail / drive calls in tests — flaky, slow, sometimes sends real emails.
- ❌ POST/PUT/DELETE without `.withCsrfToken()` — will 403.
- ❌ Asserting redirect location on a JSON call — chain `.accept('json')` instead.
- ❌ Asserting the exception handler's 302 as if it were the policy's return — assert the resource state (`assertHas` / `assertMissing`), not the redirect.
- ❌ Sharing state between tests via module-level variables — transaction rollback doesn't clean JS state.
- ❌ Testing controllers directly (instantiate + call handler) — go through `client` so middleware, validators and policies actually run.
- ❌ Faking the emitter *and* expecting the listener to run — the fake swallows the event.

## Related skills

[[actions-events]] · [[authorization]] · [[crud]]
