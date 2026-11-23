---
name: testing
description: 'Japa test patterns for an AdonisJS app. Functional specs go through HTTP with `client`; unit specs call one layer directly, mirroring its source folder, on the real Postgres in per-test transactions. Fakes are mandatory for anything that reaches out (mail, drive, emitter, workflows, transmit) and are created inside the test with `using`. Assert on the rows the test created, never on table totals. Trigger on: "write test", "add spec", "cover with tests", "how do we test X", "mock", "fake", "stub".'
license: MIT
allowed-tools: Read, Edit, Write, Bash, Grep, Glob
---

# Testing

Two suites: **unit** for one module layer (action, query, policy, transformer, listener, workflow, model) called directly, on the real Postgres in a per-test transaction when it reads or writes; **functional** for HTTP endpoints hit through `client`. A spec with no test using `client` is a unit spec. Every spec matches the shape of the nearest existing spec — same imports, same setup/teardown order, same helpers. Anything that reaches out (mail, drive, emitter, durable workflows, transmit, third-party HTTP) must be faked, and there is no global fake in `tests/bootstrap.ts`: each test creates the fakes it needs with `using`.

## Test database

The suite runs on its own database, never the dev one. `.env.test` sets `DB_DATABASE=app_test`, and `.env.test` wins over `.env` under `NODE_ENV=test`. `pnpm test` (and `pnpm coverage`) first runs `pnpm test:prepare` = `NODE_ENV=test node ace db:prepare-test`, which creates the database if the Postgres server lacks it, then `db:wipe` + `migration:run`.

`db:prepare-test` refuses outside `NODE_ENV=test` or for a name not ending in `_test` (`#core/utils/test_database`): it wipes what it migrates, so a misconfigured env must never point it at dev data. Running `node ace test` directly skips the prepare step — fine while the schema hasn't changed, re-run `pnpm test:prepare` after editing a migration.

### Run under `timeout -k`

`forceExit` is off (`adonisrc.ts`), so the process exits only once the event loop drains; a leaked handle keeps it alive, and the `SIGTERM` handler in `bin/test.ts` (`app.terminate()`) can block on that same handle. Wrap every run, as CI does:

```bash
timeout -k 5 120 pnpm ace test --files app/users/tests/functional/users/invite.spec.ts
```

If it trips (exit `124`/`137`), rerun once with a longer timeout. Finishing then means the run is slow; tripping again after the tests passed means a leaked resource — find the live handle (`process.getActiveResourcesInfo()`), do not work around it, and do not report completion.

## Assert what the test created

Never assume a table is empty or holds only your rows (a developer may have seeded `app_test`, a spec may commit outside the transaction), so a total, a "first row" or a fixed name or e-mail depends on its state (the lint rejects table totals). Assert on the rows this test created: `db.assertHas('users', { id: user.id })`, `Notification.query().where('notifiableId', String(user.id))`. Make natural keys unique with `marker()` / `taggedEmail()` from `#tests/helpers/marker` (`const email = taggedEmail(marker('invite'))`). Entities come from factories, never hand-built rows.

## Mandatory fakes by dependency

Every side-effect dependency needs an explicit fake so no test reaches real infra:

| Dependency        | How to fake                                                                                 | Scope                         |
| ----------------- | ------------------------------------------------------------------------------------------- | ----------------------------- |
| Mail              | `using mails = mail.fake()`, in the spec that reaches `mail.send` (a workflow spec)         | Per test                      |
| Drive             | `using disk = drive.fake(env.get('DRIVE_DISK') \|\| 'fs')`, in every test that uploads      | Per test                      |
| Emitter           | `using fake = emitter.fake(['event:name'])` → `EventsBuffer`                                | Per test                      |
| Workflow dispatch | `setWorkflowEngineResolver(() => t.engine)` with a `createTestEngine()`, in a listener spec | Per test; undone in `cleanup` |
| Workflow run      | `createTestEngine()` from `@adonis-agora/durable/testing`                                   | Per test                      |
| Transmit (SSE)    | `transport: null` in `config/transmit.ts` (default)                                         | Global                        |

Durable consumers are off outside the web process (`consumers` in `config/durable.ts`), so a functional spec that lets a listener run only enqueues a run inside the test transaction; nothing executes it.

### `using`, and the `_` prefix

Every fake that has to be restored is declared with `using` inside the test (the lint enforces it), so it is restored when the test ends even if an assertion throws, and never leaks into the next spec. A fake the test needs only for isolation, never asserted, takes a `_` prefix:

```ts
using _disk = drive.fake(diskName) // isolates the upload, nothing to assert
using fake = emitter.fake(['user:registered'])
// ...
fake.assertEmitted('user:registered')
```

`emitter.fake()` with no argument fakes every event. To fake only some, pass an **array** — a bare string is a TypeScript error:

```ts
using fake = emitter.fake(['user:registered']) // ✅
// emitter.fake('user:registered')             // ❌ wrong type
```

## Rules

- **Location**: a unit spec mirrors the folder of its source — `app/users/listeners/send_welcome.ts` → `app/users/tests/unit/listeners/send_welcome.spec.ts` (`actions/`, `queries/`, `policies/`, `listeners/`, `workflows/`, …); a functional spec lives in a resource folder — `app/<mod>/tests/functional/<area>/<resource>.spec.ts`. The lint enforces both.
- **Group setup**: every group opens with `group.each.setup(() => testUtils.db().wrapInGlobalTransaction())` when the code under test touches DB (nearly always).
- **RBAC helper**: assign a role per user with `withRole(user, ROLES.X)` (`tests/helpers/rbac.ts`). What the role grants comes from `roleGrants` in `config/capabilities.ts` — nothing to seed.
- **Emitter fake**: to isolate an action or endpoint from its listeners, `using fake = emitter.fake(['event:name'])` in the test. Assert with `fake.assertEmitted('event:name')` / `fake.assertNoneEmitted()`.
- **Mail fake**: `using mails = mail.fake()` in the test, then `mails.mails.assertSent(MailClass, (m) => m.message.hasTo(email))` or `mails.mails.assertNoneSent()`.
- **Drive fake**: `using disk = drive.fake(diskName)` in the test. Assert with `await disk.exists(path)` / `disk.assertExists(path)`.
- **Sinon** for stubbing services, drivers, and single functions in unit tests: `sinon.stub<[Arg], Promise<Ret>>().resolves(...)`. Always `group.each.teardown(() => sinon.restore())`.
- **Factories over fixtures** — use `UserFactory.create()` / `UserFactory.merge({...}).create()` instead of hand-building rows.
- **Each test reads on its own.** Set up the scenario inline: a factory when its defaults are representative, the domain action when the state needs an invariant only the action guarantees. No test-only builders like `createDefaultInvoice()`: they hide the data that matters and drift from the real shape.
- **CSRF**: POST/PUT/DELETE must include `.withCsrfToken()` — shield middleware is enforced.
- **Auth**: use `.loginAs(user)` on the request builder — sets the session cookie for that user's guard.
- **JSON vs HTML**: chain `.accept('json')` when asserting a JSON response body, `.withInertia()` for Inertia flows so the exception handler treats the request as UI.
- **DB assertions**: `db.assertHas('table', { column: value })`, `db.assertMissing('table', { ... })` — plugin from `@adonisjs/lucid/plugins/db`.

## Repo refs

- Functional spec (per-test transaction via `client`): `app/users/tests/functional/users/users.spec.ts`.
- Unit spec (sinon, action in isolation): `app/users/tests/unit/actions/create_user.spec.ts`. Action + emitter fake: `app/users/tests/unit/actions/invite_user.spec.ts`.
- Listener spec (the test engine in place of the app's): `app/users/tests/unit/listeners/send_welcome.spec.ts`. Workflow spec (test engine + mail fake): `app/users/tests/unit/workflows/send_welcome_workflow.spec.ts`.
- `using` drive fake, asserted and `_`-prefixed: `app/users/tests/functional/settings/profile.spec.ts`.
- RBAC helper: `tests/helpers/rbac.ts`. Unique markers: `tests/helpers/marker.ts`. Forbidden-redirect assertion: `tests/helpers/http.ts`.
- Test database: `commands/prepare_test_database.ts`, `.env.test`.

## Doc refs

- Japa runner — https://japa.dev/docs
- AdonisJS testing intro — https://docs.adonisjs.com/guides/testing/introduction
- Fake mail / drive — https://docs.adonisjs.com/guides/digging-deeper/mail#fakes
- Durable testing harness — `durable-reliability` skill in `apps/web/node_modules/@adonis-agora/durable/skills/`

## Workflow

### Functional endpoint spec

```ts
import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'

import { UserFactory } from '#auth/database/factories/user'
import { ROLES } from '#auth/enums/role'
import { marker } from '#tests/helpers/marker'
import { withRole } from '#tests/helpers/rbac'

test.group('Endpoint POST /invoices', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())

  test('admin creates an invoice', async ({ client, db }) => {
    const reference = marker('invoice')
    const admin = await UserFactory.create()
    await withRole(admin, ROLES.ADMIN)

    const response = await client
      .post('/invoices')
      .loginAs(admin)
      .withCsrfToken()
      .redirects(0)
      .json({ reference, amount: 100, currency: 'BRL' })

    response.assertStatus(302)
    await db.assertHas('invoices', { reference, amount: 100 })
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
import emitter from '@adonisjs/core/services/emitter'
import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'

import CreateInvoice from '#invoices/actions/create_invoice'

test.group('CreateInvoice', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())

  test('persists + emits invoice:issued', async ({ db, assert }) => {
    using fake = emitter.fake(['invoice:issued'])

    const invoice = await new CreateInvoice().handle({
      amount: 100,
      currency: 'BRL',
    })

    assert.equal(invoice.amount, 100)
    await db.assertHas('invoices', { id: invoice.id })
    fake.assertEmitted('invoice:issued')
  })
})
```

For specs that stub with sinon, add `group.each.teardown(() => sinon.restore())`. To stub an injected dep (like an auth guard), fake the ctx shape with `as unknown as`:

```ts
const login = sinon.stub<[User], Promise<void>>().resolves()
const auth = { use: () => ({ login }) } as unknown as Parameters<Action['handle']>[0]['auth']
```

### Faking side effects — one spec per layer

- **Action / endpoint** — verify the emit without running the listener:
  ```ts
  using fake = emitter.fake(['user:registered'])
  // ... call the action or hit the endpoint
  fake.assertEmitted('user:registered')
  ```
- **Listener** — assert the effect, not the call. The test engine stands in for the app's, the listener really schedules on it, and the spec waits for the run and checks what it did:
  ```ts
  const t = createTestEngine()
  const { name, version } = SendWelcomeWorkflow.workflow
  t.engine.register(name, version, (ctx, input) =>
    new SendWelcomeWorkflow().run(ctx, input as SendWelcomeInput)
  )
  setWorkflowEngineResolver(() => t.engine)
  cleanup(() => setWorkflowEngineResolver(undefined))

  await new SendWelcome().handle({ user, token: 'invite-token', translations, message: 'Hi' })

  const [run] = await t.store.listRuns({}) // the one run it scheduled
  await t.engine.waitForRun(run.id)
  mails.mails.assertSent(WelcomeNotification, (sent) => sent.message.hasTo(user.email))
  ```
- **Workflow** — run it on the in-memory test engine and assert the effect:
  ```ts
  using mails = mail.fake()
  router.commit() // the mail signs a named route; only the functional suite's HTTP server commits them
  const user = await UserFactory.create()

  const t = createTestEngine()
  const { name, version } = SendWelcomeWorkflow.workflow
  t.engine.register(name, version, (ctx, input) =>
    new SendWelcomeWorkflow().run(ctx, input as SendWelcomeInput)
  )
  await t.run(name, { userId: user.id, token: 'invite-token', translations }, 'run-1')

  await assertRunStatus(t.store, 'run-1', 'completed')
  mails.mails.assertSent(WelcomeNotification, (sent) => sent.message.hasTo(user.email))
  ```
- **Workflow with a dispatched step** (`ctx.step`) — `t.run` returns as soon as the run suspends on the step, before the in-memory transport delivers it, so the status is still `suspended`. Serve the step with `t.transport.handle(name, fn)` (or the real `@Step` method) and wait until the run settles before asserting. Copy this helper to `apps/web/tests/helpers/workflow.ts` with the first such spec:
  ```ts
  import type { TestEngine } from '@adonis-agora/durable/testing'

  /** Waits until the run stops moving: it finished, or it sleeps on a timer until the next `tick`. */
  export async function waitForWorkflow(t: TestEngine, runId: string) {
    let previous = ''
    let settled = 0
    for (const _attempt of Array.from({ length: 300 })) {
      const run = await t.store.getRun(runId)
      const now = run ? `${run.status}:${new Date(run.updatedAt).getTime()}` : ''
      settled = now === previous ? settled + 1 : 0
      previous = now
      if (run && run.status !== 'running' && settled >= 5) return
      await new Promise((resolve) => setTimeout(resolve, 10))
    }
  }
  ```
  ```ts
  t.transport.handle('probe:double', async (input) => ({ value: (input as { n: number }).n * 2 }))
  await t.run('probe', { n: 21 }, 'run-1')
  await waitForWorkflow(t, 'run-1')
  await assertRunStatus(t.store, 'run-1', 'completed')
  ```

## Anti-patterns

- ❌ Skipping `wrapInGlobalTransaction()` — rows leak between tests, ordering matters, flakiness appears.
- ❌ Asserting a table total, a "first row" or a fixed e-mail — it depends on rows the test did not create; assert on its own rows, keyed by a marker.
- ❌ A fake set in group setup and restored in teardown, or a global fake in `tests/bootstrap.ts` — declare it with `using` inside the test.
- ❌ An upload with no `drive.fake(...)` — the real file stays on disk after the run.
- ❌ Rendering a full HTML response of an SSR page (`config/ssr.ts`) in a functional spec — SSR boots Vite, whose watchers keep the process alive. Use `.withInertia()` or `.accept('json')`.
- ❌ Hand-built fixture rows when a factory exists — inconsistent baseline data.
- ❌ Real network / mail / drive calls in tests — flaky, slow, sometimes sends real emails.
- ❌ POST/PUT/DELETE without `.withCsrfToken()` — will 403.
- ❌ Asserting redirect location on a JSON call — chain `.accept('json')` instead.
- ❌ Asserting the exception handler's 302 as if it were the policy's return — assert the resource state (`assertHas` / `assertMissing`), not the redirect.
- ❌ Sharing state between tests via module-level variables — transaction rollback doesn't clean JS state.
- ❌ Testing controllers directly (instantiate + call handler) — go through `client` so middleware, validators and policies actually run.
- ❌ Faking the emitter _and_ expecting the listener to run — the fake swallows the event.
- ❌ A functional spec that emits the event and expects the workflow's effect without a test engine — the listener only enqueues a run on the app's engine, and nothing consumes it in tests.
- ❌ `sinon.stub(XWorkflow, 'dispatch')` and asserting its arguments — it proves the code calls what it calls. Assert the effect.
- ❌ A library test: what the framework or a package does with our config (Lucid's `preload`, the router's 404, VineJS rejecting a missing field). A spec guards our behavior.

## Related skills

[[actions-events]] · [[authorization]] · [[crud]]
