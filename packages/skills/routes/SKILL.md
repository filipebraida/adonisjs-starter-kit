---
name: routes
description: 'Route definitions in an AdonisJS module. Prefer `router.resource(...)` for CRUD verbs; put verb-only actions (activate, publish, finalize) as separate `router.post/get/delete(...)`. Always pin numeric params with `router.matchers.number()` — otherwise a non-numeric URL falls through to the controller and blows up on the ORM. Trigger on: "add route", "register route", "resource route", "matcher", ":id 500", "route naming".'
license: MIT
allowed-tools: Read, Edit, Write, Bash, Grep, Glob
---

# Routes

Each module owns its `routes.ts`. The file gets discovered by the preload wired in [[module-scaffolding]] — there is no autoloader. Routes have three loads to bear: they're the source of truth for URL generation (typed clients like Tuyau and the server-side URL builder read the named routes), for the middleware chain that guards the endpoint, and for the param typing that keeps garbage input out of the ORM.

## Rules

1. **Numeric params get `router.matchers.number()`**. Without it, a non-numeric URL reaches the controller, `Number('foo') → NaN`, and Postgres throws `invalid input syntax for type integer` — the response is a 500. With the matcher the router 404s upstream, before boot.
2. **CRUD verbs go through `router.resource()`**. Custom verb actions (activate, publish, finalize) are separate `router.post(...)` in the same file, not extra methods on the resource controller.
3. **Route names follow the URL hierarchy**: `parents.children.action`. Named routes are the single source of truth for both the typed frontend URL client and the server-side `urlFor(...)` used inside jobs and listeners. Both derive the URL from the name; the name is a contract.
4. **Param names match across parents**: for a nested resource named `parents.children` use `.params({ parents: 'parent_id' })` and pin every id: `.where('parent_id', router.matchers.number()).where('id', router.matchers.number())`. Snake_case, semantic, matching what the URL client expects.
5. **Group by shared middleware**. Put every route that shares the same auth/middleware stack inside one `router.group(() => {...}).middleware(...)` block. Public routes live outside, guarded ones inside.

## Reference shape

```ts
router
  .group(() => {
    // Top-level resource
    router
      .resource('/entities', EntitiesController)
      .only(['index', 'create', 'store', 'show'])
      .where('id', router.matchers.number())
      .as('entities')

    // Verb action on an entity
    router
      .post('/entities/:id/publish', [EntitiesController, 'publish'])
      .where('id', router.matchers.number())
      .as('entities.publish')

    // Nested resource — rename the parent segment + pin every numeric id
    router
      .resource('parents.children', ChildrenController)
      .only(['index', 'store', 'destroy'])
      .params({ parents: 'parent_id' })
      .where('parent_id', router.matchers.number())
      .where('id', router.matchers.number())

    // Verb action inside the nested resource
    router
      .post('/parents/:parent_id/children/:id/approve', [ChildrenController, 'approve'])
      .where('parent_id', router.matchers.number())
      .where('id', router.matchers.number())
      .as('parents.children.approve')
  })
  .middleware(middleware.auth())
```

## Choosing verb vs resource

- `router.resource(...)` when the endpoint fits a standard CRUD verb: `index`, `create`, `store`, `show`, `edit`, `update`, `destroy`. Trim with `.only([...])` to what the controller actually exposes.
- `router.post/get/delete(...)` with `.as(...)` when the action does not fit a CRUD verb: activate, publish, finalize, invite, impersonate. Put them in the same `routes.ts` as the resource they belong to.

## Hardcoding a route pattern

Some server-side callers need the pattern — the raw template with `:params`, not a filled URL. Example: `transmit.authorize('/pattern/:x/...', ...)` inside `start/transmit.ts`. Because that file executes during preload, before `Server.boot()` calls `router.commit()`, doing `router.findOrFail(name).pattern` there throws.

Two options, in order of preference:

1. **Hardcode the pattern + add a spec that guards it.** Export the pattern as a constant, and write a functional test asserting the constant equals `router.findOrFail(name).pattern`. If the route ever renames, the test breaks before deploy.
2. **Defer with `app.ready(...)`.** Only works when the pattern is needed at request-handling time. `app.ready` fires before `router.commit()`, so it does **not** rescue `transmit.authorize`.

## Anti-patterns

- ❌ Numeric `:id` without `.where('id', router.matchers.number())` — 500 on any non-numeric URL.
- ❌ Verb action stuffed into the resource controller as an extra method — pollutes route naming and forces `.only([...])` to grow.
- ❌ `router.findOrFail(...)` at the top level of `start/*.ts` — the router isn't committed yet at preload time.
- ❌ Renaming params to `id1` / `id2` in nested resources — URL clients read semantic names (`parent_id`, `child_id`).
- ❌ One giant middleware chain on each individual route instead of a `router.group(...).middleware(...)` block.

## Related skills

[[module-scaffolding]] · [[crud]] · [[actions-events]] · [[notifications]] · [[testing]]
