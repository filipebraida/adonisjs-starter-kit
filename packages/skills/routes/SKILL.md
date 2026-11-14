---
name: routes
description: 'Route definitions in an AdonisJS module. Prefer `router.resource(...)` for CRUD verbs; put verb-only actions (activate, publish, finalize) as separate `router.post/get/delete(...)` on a single-action controller. Controllers are referenced through the generated `#generated/controllers` registry, not direct imports. Always pin numeric params with `router.matchers.number()` — otherwise a non-numeric URL falls through to the controller and blows up on the ORM. Trigger on: "add route", "register route", "resource route", "matcher", ":id 500", "route naming".'
license: MIT
allowed-tools: Read, Edit, Write, Bash, Grep, Glob
---

# Routes

Each module owns its `routes.ts`. The file gets discovered by the preload wired in [[module-scaffolding]] — there is no autoloader. Controllers are referenced through the generated registry (`controllers.<mod>.<Name>` from `#generated/controllers`, rebuilt by `pnpm ace codegen` or the dev server), and middleware comes from `#start/kernel`. Routes have three loads to bear: they're the source of truth for URL generation (typed clients like Tuyau and the server-side URL builder read the named routes), for the middleware chain that guards the endpoint, and for the param typing that keeps garbage input out of the ORM.

## Rules

1. **Numeric params get `router.matchers.number()`**. Without it, a non-numeric URL reaches the controller, `Number('foo') → NaN`, and Postgres throws `invalid input syntax for type integer` — the response is a 500. With the matcher the router 404s upstream, before boot.
2. **CRUD verbs go through `router.resource()`**, trimmed with `.only([...])` / `.except([...])` to what the controller exposes. Custom verb actions (activate, publish, finalize) are separate `router.post(...)` in the same file, each on its own single-action controller (`<verb>_<object>_controller.ts`, only `handle()`) — never an extra method on the resource controller. See [[crud]] for the two controller shapes.
3. **Reference controllers via the registry.** `[controllers.users.ImpersonateUser]` for a single-action controller (resolves to `handle`), `[controllers.users.Invite, 'store']` when naming a resource method, `controllers.users.Users` for `router.resource`. Never `import UsersController from ...` or a lazy `() => import(...)` in a routes file.
4. **Every route is named** with `.as(...)`, following the URL hierarchy: `parents.children.action`. Named routes are the single source of truth for both the typed frontend URL client and the server-side `urlFor(...)` / `signedUrlFor(...)` used in mails and workflows. Both derive the URL from the name; the name is a contract.
5. **Param names**: the resource the route acts on is `:id`; every other param is camelCase, as the controller reads it (`/parents/:parentId/children/:id`). For a nested resource rename the parent segment with `.params({ parents: 'parentId' })` and pin every id.
6. **Group by shared middleware**. Put every route that shares the same auth/middleware stack inside one `router.group(() => {...}).use([...])` block; a single route takes `.middleware(middleware.auth())` (or `.use(...)`) directly. Public routes live outside, guarded ones inside.

## Reference shape

```ts
import router from '@adonisjs/core/services/router'

import { controllers } from '#generated/controllers'
import { middleware } from '#start/kernel'

router
  .group(() => {
    // Top-level resource
    router
      .resource('/entities', controllers.entities.Entities)
      .only(['index', 'create', 'store', 'show'])
      .where('id', router.matchers.number())
      .as('entities')

    // Verb action on an entity — single-action controller (publish_entity_controller.ts)
    router
      .post('/entities/:id/publish', [controllers.entities.PublishEntity])
      .where('id', router.matchers.number())
      .as('entities.publish')

    // Nested resource — rename the parent segment + pin every numeric id
    router
      .resource('parents.children', controllers.entities.Children)
      .only(['index', 'store', 'destroy'])
      .params({ parents: 'parentId' })
      .where('parentId', router.matchers.number())
      .where('id', router.matchers.number())

    // Verb action inside the nested resource
    router
      .post('/parents/:parentId/children/:id/approve', [controllers.entities.ApproveChild])
      .where('parentId', router.matchers.number())
      .where('id', router.matchers.number())
      .as('parents.children.approve')
  })
  .use([middleware.auth()])
```

## Choosing verb vs resource

- `router.resource(...)` when the endpoint fits a standard CRUD verb: `index`, `create`, `store`, `show`, `edit`, `update`, `destroy`. Trim with `.only([...])` / `.except([...])` to what the controller actually exposes.
- `router.post/get/delete(...)` with `.as(...)` when the action does not fit a CRUD verb: activate, publish, impersonate, mark read. Each goes to a single-action controller and lives in the same `routes.ts` as the resource it belongs to (`users.impersonate.handle` → `ImpersonateUserController`).
- A form and its submit that are one real resource keep resource methods on a plain route (`[controllers.users.Invite, 'show']` + `[controllers.users.Invite, 'store']`).

## Hardcoding a route pattern

Some server-side callers need the pattern — the raw template with `:params`, not a filled URL. Example: `transmit.authorize('/pattern/:x/...', ...)` inside `start/transmit.ts`. Because that file executes during preload, before `Server.boot()` calls `router.commit()`, doing `router.findOrFail(name).pattern` there throws.

Two options, in order of preference:

1. **Hardcode the pattern + add a spec that guards it.** Export the pattern as a constant, and write a functional test asserting the constant equals `router.findOrFail(name).pattern`. If the route ever renames, the test breaks before deploy.
2. **Defer with `app.ready(...)`.** Only works when the pattern is needed at request-handling time. `app.ready` fires before `router.commit()`, so it does **not** rescue `transmit.authorize`.

## Repo refs

- Resource + single-action verb routes with numeric matchers, per-route middleware: `app/users/routes.ts`.
- Grouped verb-only routes on single-action controllers (`.use([middleware.auth()])`): `app/notifications/routes.ts`.
- Non-numeric param pinned with a regex matcher (`RESET_TOKEN`): `app/auth/routes.ts`.
- Generated registry: `.adonisjs/server/controllers.ts` (committed; CI fails when `pnpm ace codegen` would change it).

## Anti-patterns

- ❌ Numeric `:id` without `.where('id', router.matchers.number())` — 500 on any non-numeric URL. The lint checks string routes; a `router.resource(...)` needs the `.where(...)` by hand.
- ❌ Direct `import XController from ...` instead of `controllers.<mod>.X` from `#generated/controllers`.
- ❌ Route without `.as(...)` — no `urlFor` can reach it.
- ❌ Verb action stuffed into the resource controller as an extra method — pollutes route naming and forces `.only([...])` to grow.
- ❌ `router.findOrFail(...)` at the top level of `start/*.ts` — the router isn't committed yet at preload time.
- ❌ Renaming params to `id1` / `id2`, or snake_case (`parent_id`) — the resource is `:id`, others are semantic camelCase (`parentId`).
- ❌ One giant middleware chain on each individual route instead of a `router.group(...).use([...])` block.

## Related skills

[[module-scaffolding]] · [[crud]] · [[actions-events]] · [[notifications]] · [[testing]]
