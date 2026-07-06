---
name: crud
description: 'Build an end-to-end CRUD stack in AdonisJS + Inertia: resource route → thin controller → VineJS validator → Bouncer policy → single-purpose action → transformer variant → Inertia page. Trigger on: "add CRUD for X", "create resource", "list/create/edit/delete X", "resource endpoint".'
license: MIT
allowed-tools: Read, Edit, Write, Bash, Grep, Glob
---

# CRUD

A CRUD feature is a stack, not a single file. The route declares one `router.resource(...)` scoped by auth middleware; the controller has 5–7 tiny methods that only orchestrate; each mutation has a VineJS validator; a `BasePolicy` gates every method; each write goes through a single-purpose action class; a transformer produces per-page shape variants; the read side lives in `queries/`; the UI is Inertia pages under `<mod>/ui/pages/`. The point is that no single layer holds more than its own responsibility, and adding the next resource is copy-shape, not think-shape.

## Rules

Every HTTP method — including `index` — follows the same 3-step spine:

1. **Authorize** via `bouncer.with(XPolicy).authorize(...)`. A `where('owner_id', user.id)` clause in the query is **not** a substitute — the policy is the source of truth.
2. **Validate** via `request.validateUsing(...)`.
3. **Render / redirect** — either `inertia.render('...', props)` for reads or `response.redirect().back()` / `.toRoute(...)` for writes. Writes call an action in between.

Authentication is the middleware's job — controllers never call `authenticate()`; use `auth.getUserOrFail()` when the handler needs the user. Anything past `.authorize()` that also does an owner check is redundant; anything before it that touches the DB other than loading the resource being authorized is a leak.

### Layer conventions

- **Route** — `router.resource('/entities', EntitiesController).only([...])`. Guard by wrapping in a `router.group(() => {...}).middleware(middleware.auth())` block (see [[routes]]). Custom verbs go as separate `router.post(...)` calls, not extra controller methods.
- **Controller (thin)** — one method per resource action. Body order: `policy → validator → action call → render/redirect`. No business logic, no queries longer than one line, no ORM calls beyond `Model.findOrFail`.
- **Validator** — VineJS `vine.create({...})` per mutation, exported from `<mod>/validators/<entity>.ts` (one file per entity — `validators/users.ts`, `validators/tokens.ts`). Use `vine.withMetaData<{...}>().create({...})` when a rule depends on route params (e.g. unique-except-self on edit). `vine.compile()` is **deprecated** — use `vine.create()`.
- **Policy** — `BasePolicy` subclass at `<mod>/policies/<entity>_policy.ts`. One method per gated action. Return `boolean | AuthorizerResponse`. Gate before validating: `await bouncer.with(XPolicy).authorize('action', resource?)`. See [[authorization]].
- **Action** — one class per write in `<mod>/actions/<verb_entity>.ts`. `Input` is a plain interface; the class has one `async handle(input)` method. Never takes `HttpContext`. Side effects go through domain events — see [[actions-events]].
- **Transformer** — `BaseTransformer<Model>` with `toObject()` as the base + variants (`forList`, `forEdit`, `forSharedProps`, `forProfile`). Call `Transformer.transform(model).useVariant('forEdit')` or `Transformer.paginate(rows, meta).useVariant('forList')`. Never send raw Lucid instances to Inertia — the shape leaks and the response type drifts.
- **Query** — read-only, `<mod>/queries/list_<entities>.ts`. Full patterns (list queries + read models for aggregate screens) live in [[queries]].
- **Inertia pages** — under `<mod>/ui/pages/<entity>/`. Index is a full page; create/edit are modals mounted over the index. See [[inertia]].

## Doc refs

- Routing (resource routes) — https://docs.adonisjs.com/guides/basics/routing#resourceful-routes
- VineJS validation — https://docs.adonisjs.com/guides/basics/validation
- Bouncer authorization — https://docs.adonisjs.com/guides/security/authorization
- Inertia in AdonisJS — https://docs.adonisjs.com/guides/views-and-templates/inertia

## Workflow

Prerequisite: the module exists — see [[module-scaffolding]].

### 1. Model + migration + factory

- `app/<mod>/models/<entity>.ts` — Lucid `BaseModel` subclass with `@column()` declarations. Relationships and computed getters live here too.
- `app/<mod>/database/migrations/<ts>_create_<entities>_table.ts` — see [[migrations]].
- `app/<mod>/database/factories/<entity>.ts` — `Factory.define(Model, ({ faker }) => ({...})).build()`.

### 2. Validators (one file per entity)

```ts
// app/<mod>/validators/entities.ts
import vine from '@vinejs/vine'

export const createEntityValidator = vine.create({
  name: vine.string().trim().minLength(3),
  // ...
})

export const editEntityValidator = vine.withMetaData<{ entityId: number }>().create({
  name: vine.string().trim().minLength(3),
  email: vine
    .string()
    .email()
    .unique(async (_, value, field) => {
      const row = await Entity.query()
        .where('email', value)
        .whereNot('id', field.meta.entityId)
        .first()
      return !row
    }),
})

export const listEntityValidator = vine.create({
  ...baseSearchValidator.getProperties(),
  // filters, sort, order
})
```

If the module has multiple entities (e.g. `users` also has `tokens`), split them into separate files: `validators/users.ts`, `validators/tokens.ts`.

### 3. Policy

```ts
// app/<mod>/policies/<entity>_policy.ts
export default class EntityPolicy extends BasePolicy {
  async viewList(user: User) { return user.hasPermission(PERMISSIONS.entityViewList) }
  async view(user: User, entity: Entity) { /* self OR permission */ }
  async create(user: User) { return user.hasPermission(PERMISSIONS.entityCreate) }
  async update(user: User, entity: Entity) { /* self OR permission */ }
  async delete(user: User, entity: Entity) { /* deny self-delete + permission */ }
}
```

Register matching `PERMISSIONS.entity*` in the RBAC catalog — see [[authorization]].

### 4. Actions (one per write)

`app/<mod>/actions/create_entity.ts`, `update_entity.ts`, `delete_entity.ts`. Each exposes an `Input` interface and an `async handle(input)`. See [[actions-events]].

### 5. Transformer

```ts
// app/<mod>/transformers/entity_transformer.ts
export default class EntityTransformer extends BaseTransformer<Entity> {
  toObject() {
    return { id: this.resource.id, name: this.resource.name }
  }
  forList() {
    return { ...this.toObject(), createdAt: this.resource.createdAt.toISO()! }
  }
  forEdit() {
    return { ...this.toObject(), /* extras only edit needs */ }
  }
}
```

Consumers:
- Single: `EntityTransformer.transform(entity).useVariant('forEdit')`
- Paginated: `EntityTransformer.paginate(rows, paginator.getMeta()).useVariant('forList')`

### 6. List query (when index has filters)

`app/<mod>/queries/list_entities.ts` — takes `{ q, filters, sort, order }` + `{ page, perPage }`, returns paginated result. See [[queries]].

### 7. Controller (thin)

```ts
public async index({ bouncer, inertia, request }: HttpContext) {
  await bouncer.with(EntityPolicy).authorize('viewList')                       // 1
  const payload = await request.validateUsing(listEntityValidator)             // 2
  const rows = await new ListEntities().handle({ /* filters */ }, payload)     // 3
  return inertia.render('entities/index', {                                    // 4
    entities: EntityTransformer.paginate(rows.all(), rows.getMeta()).useVariant('forList'),
  })
}
```

Nested resource (`parents.children`) — load the owner first, gate on it:

```ts
public async store({ auth, bouncer, params, request, response }: HttpContext) {
  const user = auth.getUserOrFail()
  const parent = await Parent.findOrFail(params.parent_id)
  await bouncer.with(ChildPolicy).authorize('create', parent)
  const payload = await request.validateUsing(createChildValidator)
  await new CreateChild().handle({ userId: user.id, parentId: parent.id, ...payload })
  return response.redirect().back()
}
```

### 8. Route

```ts
// app/<mod>/routes.ts
const EntitiesController = () => import('#<mod>/controllers/entities_controller')

router
  .group(() => {
    router
      .resource('/entities', EntitiesController)
      .only(['index', 'create', 'store', 'edit', 'update', 'destroy'])
      .where('id', router.matchers.number())
      .as('entities')
  })
  .middleware(middleware.auth())
```

See [[routes]] for verb vs. resource, numeric matchers, nested resources.

### 9. Inertia pages

- `<mod>/ui/pages/<entities>/index.tsx` — list page.
- `<mod>/ui/pages/<entities>/create.tsx` + `edit.tsx` — modals launched by controller `create`/`edit` methods.

See [[inertia]] for `<Form>`, `useForm`, `usePageProps`, `urlFor`, and modal wiring.

### 10. i18n

Every UI string used in the pages needs an entry in every supported locale JSON — see [[i18n]].

### 11. Tests

- Functional: `app/<mod>/tests/functional/<entities>_endpoint.spec.ts` — cover unauth (302 → login), forbidden (302 → home), validation (422), happy path per method.
- Unit: one per action.
- See [[testing]].

## Anti-patterns

- ❌ Business logic in the controller — move it to an action.
- ❌ Skipping `bouncer.authorize(...)` on any mutation — every write must be gated. A `where` clause is not authorization.
- ❌ Sending a Lucid model to Inertia without a transformer — the shape leaks and page prop types drift.
- ❌ A transformer with one variant returning everything — over-fetch, hurts the response payload. Trim variants per page.
- ❌ Validator declared inline in the controller — always in `<mod>/validators/<entity>.ts`.
- ❌ Custom verbs (`activate`, `publish`) added as extra methods on the resource controller — put them as separate `router.post(...)` calls with their own controller (or method), keeping the resource `.only([...])` list clean.
- ❌ Controllers calling `auth.authenticate()` — the `auth()` middleware ran first; use `auth.getUserOrFail()`.

## Related skills

[[module-scaffolding]] · [[routes]] · [[actions-events]] · [[queries]] · [[authorization]] · [[inertia]] · [[testing]] · [[i18n]] · [[migrations]]
