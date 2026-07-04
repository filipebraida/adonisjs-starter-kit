---
name: testing
description: 'Japa test patterns for this repo. Functional specs hit real Postgres wrapped in per-test transactions; unit specs stub deps with sinon. Fakes are mandatory for anything that reaches out (drive/mail/emitter). Trigger on: "write test", "add spec", "cover with tests", "how do we test X", "mock", "fake", "stub".'
license: MIT
allowed-tools: Read, Edit, Write, Bash, Grep, Glob
---

# Testing

Two suites: **unit** for action/service internals with dependencies stubbed; **functional** for HTTP endpoints against a real Postgres wrapped in a per-test transaction. Every spec matches the shape of the nearest existing spec — same imports, same setup/teardown order, same helpers. Anything that reaches out (mail, drive, emitter, third-party HTTP) must be faked; the bootstrap already fakes mail globally as a safety net.

## Conventions

- **Location**: `app/<mod>/tests/{unit,functional}/*.spec.ts`.
- **Group setup**: every group opens with `group.each.setup(() => testUtils.db().wrapInGlobalTransaction())` when the code under test touches DB (nearly always).
- **Roles**: functional specs that involve RBAC also call `group.each.setup(() => ensureBaseRoles())`; assign roles per user with `withRole(user, ROLES.ADMIN)`.
- **Emitter fake**: to isolate an endpoint from its listeners, `const fake = emitter.fake(['user:registered'])` in setup + `emitter.restore()` in teardown. Assert with `fake.assertEmitted('user:registered')` / `fake.assertNoneEmitted()`.
- **Mail/drive fakes**: `mail.fake()`, `drive.fake()`. `mail.fake()` supports `.assertSent(Notification, (msg) => ...)` and `.assertNoneSent()`.
- **Sinon** for stubbing services, drivers, and single functions in unit tests: `sinon.stub<[Arg], Promise<Ret>>().resolves(...)`. Always `group.each.teardown(() => sinon.restore())`.
- **Factories over fixtures**: use `UserFactory.create()` / `UserFactory.merge({...}).create()` instead of hand-building rows.
- **CSRF**: POST/PUT/DELETE must include `.withCsrfToken()` — shield middleware is enforced.
- **Auth**: use `.loginAs(user)` on the request builder — sets the session cookie for that user's guard.
- **JSON responses**: chain `.accept('json')` so the endpoint returns JSON instead of redirect HTML.
- **DB assertions**: `db.assertHas('table', { column: value })`, `db.assertMissing('table', { ... })` — plugin from `@adonisjs/lucid/plugins/db`.

## Repo refs

- Runner setup + global mail fake: `apps/web/tests/bootstrap.ts`.
- RBAC helpers: `apps/web/tests/helpers/rbac.ts` (`ensureBaseRoles`, `withRole`, `withPermissions`, `ensureUser`).
- HTTP helpers: `apps/web/tests/helpers/http.ts` (`assertForbiddenRedirect`).
- Factory example: `apps/web/app/users/database/factories/user.ts`.
- Canonical functional spec (auth flow, session assertion, various negative cases): `apps/web/app/auth/tests/functional/sign_in.spec.ts`.
- Canonical functional spec with `emitter.fake` + RBAC: `apps/web/app/users/tests/functional/invite_endpoint.spec.ts`.
- Canonical unit spec (sinon stubs, action invocation): `apps/web/app/auth/tests/unit/sign_up.spec.ts`.
- Model.create-driven endpoint spec: `apps/web/app/notifications/tests/functional/notifications_endpoint.spec.ts`.
- End-to-end listener spec (emitter.emit → side effect assertion): `apps/web/app/users/tests/functional/user_welcome_notification.spec.ts`.

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

  test('admin cria invoice', async ({ client, db, assert }) => {
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

Cover: unauth (302 → /login), forbidden (302 → /), validation error (422), happy path.

### Unit spec for an action

```ts
import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'
import sinon from 'sinon'

import CreateInvoice from '#invoices/actions/create_invoice'

test.group('CreateInvoice', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())
  group.each.teardown(() => sinon.restore())

  test('persiste + emite invoice:issued', async ({ db, assert }) => {
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
- **Emitter** — verify emit without running listener:
  ```ts
  const fake = emitter.fake(['user:registered'])
  // ... trigger endpoint
  fake.assertEmitted('user:registered')
  ```
- **Emitter with listener** — for end-to-end listener specs, don't fake. `mail.fake()` first (to avoid actual send inside the listener), then `await emitter.emit('user:registered', payload)`, then assert the DB row / other side effect.

## Anti-patterns

- ❌ Skipping `wrapInGlobalTransaction()` — rows leak across tests.
- ❌ Hand-built fixture rows when a factory exists.
- ❌ Real network / mail / drive calls in tests.
- ❌ POST/PUT/DELETE without `.withCsrfToken()` — will 403.
- ❌ Asserting redirect location on a JSON call — chain `.accept('json')` instead.
- ❌ Sharing state between tests via module-level variables.
- ❌ Testing controllers directly (instantiate + call handler) — go through `client` so middleware runs.

## Related skills

[[actions-events]] · [[authorization]] · [[crud]]
