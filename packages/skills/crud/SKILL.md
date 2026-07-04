---
name: crud
description: 'Build an end-to-end CRUD in this repo — resource route → controller (thin) → validator (VineJS) → policy (Bouncer) → action → transformer (with variants) → Inertia page. Follow the users module as the canonical example. Trigger on: "add CRUD for X", "create resource", "list/create/edit/delete X", "resource endpoint".'
license: MIT
allowed-tools: Read, Edit, Write, Bash, Grep, Glob
---

# CRUD

A CRUD feature in this repo is a stack: `router.resource(...)` in the module's `routes.ts`, a controller with 5–7 thin methods, one VineJS validator per mutation, a `BasePolicy` gating every action, single-purpose action classes for writes, a transformer with per-page variants, an optional `queries/` for list-search-pagination, and Inertia pages under `<mod>/ui/pages/`. Follow the `users` module verbatim — every file that exists there is worth reading before writing your own.

## Conventions

- **Route shape**: `router.resource('/entities', EntitiesController).only([...]).use('*', middleware.auth())`. Optional actions (impersonate, invite, publish, etc.) are separate `router.post(...)` calls in the same file.
- **Controller (thin)**: one method per resource action. Order per method: `policy → validator → action call → render/redirect`. No business logic, no queries longer than one line, no ORM calls beyond `Model.findOrFail`.
- **Validator**: VineJS `vine.create({...})` per mutation, exported from `<mod>/validators/<entity>.ts` (one file per entity — `validators/users.ts`, `validators/tokens.ts`). Use `vine.withMetaData<{...}>().create({...})` when the rule depends on route params (e.g. unique-except-self on edit). `vine.compile()` is **deprecated** — use `vine.create()`.
- **Policy**: `BasePolicy` subclass at `<mod>/policies/<entity>_policy.ts`. One method per gated action. Return boolean or `AuthorizerResponse`. Always gate before validating: `await bouncer.with(XPolicy).authorize('action', resource?)`.
- **Action**: one class per write in `<mod>/actions/<verb_entity>.ts`. Never takes `HttpContext` — see [[actions-events]].
- **Transformer**: `BaseTransformer<Model>` with `toObject()` as the base + variants (`forList`, `forEdit`, `forSharedProps`, `forProfile`). Call `Transformer.transform(model).useVariant('forList')` or `Transformer.paginate(rows, meta).useVariant('forList')`. Never send raw model instances to Inertia.
- **Query**: read-only, in `<mod>/queries/list_<entities>.ts`. Full patterns (list queries + read models for aggregate screens) live in [[queries]].
- **Inertia pages**: at `<mod>/ui/pages/<entity>/`. `index.tsx` (list) is a full page; `create.tsx` and `edit.tsx` are modals mounted over the index via `modal(inertia, 'users/create', {}, { route: 'users.index' })`. See [[inertia]].

## Repo refs (users is the canonical CRUD)

- Route: `apps/web/app/users/routes.ts:35` (`router.resource('/users', UsersController).only([...])`).
- Controller: `apps/web/app/users/controllers/users_controller.ts` — 5-method thin controller.
- Validators: `apps/web/app/users/validators/users.ts` + `apps/web/app/users/validators/tokens.ts` (`createUserValidator`, `editUserValidator` with `withMetaData` for unique-except-self, `listUserValidator`, `createTokenValidator`).
- Policy: `apps/web/app/users/policies/user_policy.ts` — every method returns `PERMISSIONS.usersX` via `hasPermission`.
- Actions: `apps/web/app/users/actions/{create,update,delete}_user.ts`.
- Transformer: `apps/web/app/users/transformers/user_transformer.ts` — `toObject()` + `forList`, `forEdit`, `forSharedProps`, `forProfile` variants.
- List query: `apps/web/app/users/queries/list_users.ts` — search + role filter + sort + pagination.
- Modal helper: `apps/web/app/core/inertia/modal.ts` — used by `create`/`edit` controller methods.
- List page: `apps/web/app/users/ui/pages/index.tsx`.
- Modal pages: `apps/web/app/users/ui/pages/users/{create,edit}.tsx`.

## Doc refs

- Routing (resource routes) — https://docs.adonisjs.com/guides/basics/routing#resourceful-routes
- VineJS validation — https://docs.adonisjs.com/guides/basics/validation
- Bouncer authorization — https://docs.adonisjs.com/guides/security/authorization
- Inertia in AdonisJS — https://docs.adonisjs.com/guides/views-and-templates/inertia

## Workflow

Prerequisite: module exists — see [[module-scaffolding]].

### 1. Model + migration + factory

- `app/<mod>/models/<entity>.ts` — Lucid model extending `BaseModel` from `#common/models/base_model`.
- `app/<mod>/database/migrations/<ts>_create_<entities>_table.ts` — starter kit convention is to fold columns into a single create migration ([[migrations]]).
- `app/<mod>/database/factories/<entity>.ts` — `Factory.define(Model, ({ faker }) => ({...})).build()`.

### 2. Validators (one per mutation)

Split by entity — one file per resource. For an `Entity`, use `<mod>/validators/entities.ts` (plural of the entity):

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
      const row = await Entity.query().where('email', value).whereNot('id', field.meta.entityId).first()
      return row ? false : true
    }),
})

export const listEntityValidator = vine.create({
  ...baseSearchValidator.getProperties(),
  // filters, sort, order
})
```

Use `vine.create({...})` — `vine.compile()` is deprecated. If the module has multiple entities (e.g. `users` also has `tokens`), split into separate files: `validators/users.ts`, `validators/tokens.ts`.

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

Add matching `PERMISSIONS.entity*` to `app/users/enums/permission.ts` — see [[authorization]].

### 4. Actions (one per write)

`app/<mod>/actions/create_entity.ts`, `update_entity.ts`, `delete_entity.ts`. Each has an `interface Input` + `.handle(input)`. See [[actions-events]].

### 5. Transformer

```ts
// app/<mod>/transformers/entity_transformer.ts
export default class EntityTransformer extends BaseTransformer<Entity> {
  toObject() { return { id: this.resource.id, name: this.resource.name } }
  forList() { return { ...this.toObject(), createdAt: this.resource.createdAt.toISO()! } }
  forEdit() { return { ...this.toObject(), /* extras only edit needs */ } }
}
```

Consumers call:
- Single: `EntityTransformer.transform(entity).useVariant('forEdit')`
- List: `EntityTransformer.paginate(rows, paginator.getMeta()).useVariant('forList')`

### 6. List query (if index has filters)

`app/<mod>/queries/list_entities.ts` — takes `{ q, filters, sort, order }` + `{ page, perPage }`, returns paginated result.

### 7. Controller (thin)

Follow `apps/web/app/users/controllers/users_controller.ts` verbatim — every branch is worth mirroring:

```ts
public async index({ bouncer, inertia, request }: HttpContext) {
  await bouncer.with(EntityPolicy).authorize('viewList')
  const payload = await request.validateUsing(listEntityValidator)
  const rows = await new ListEntities().handle({ /* filters */ }, { page: payload.page, perPage: payload.perPage })
  return inertia.render('entities/index', {
    entities: EntityTransformer.paginate(rows.all(), rows.getMeta()).useVariant('forList'),
    // ...
  })
}
```

### 8. Route

```ts
// app/<mod>/routes.ts
const EntitiesController = () => import('#<mod>/controllers/entities_controller')

router
  .resource('/entities', EntitiesController)
  .only(['index', 'create', 'store', 'edit', 'update', 'destroy'])
  .use('*', middleware.auth())
  .as('entities')
```

### 9. Inertia pages

- `<mod>/ui/pages/<entities>/index.tsx` — list page inside `AdminLayout`.
- `<mod>/ui/pages/<entities>/create.tsx` + `edit.tsx` — modals launched by controller `create`/`edit` methods via `modal(...)`.

See [[inertia]] for `<Form>`, `useForm`, `usePageProps`, and `urlFor`.

### 10. i18n

Add keys in all three locales — see [[i18n]].

### 11. Tests

- Functional: `app/<mod>/tests/functional/<entities>_endpoint.spec.ts` — cover unauth (302 → /login), forbidden (302 → /), validation (422), and happy paths for each of the 5 methods.
- Unit: one per action.
- See [[testing]].

## Anti-patterns

- ❌ Business logic in the controller — move it to an action.
- ❌ Skipping `bouncer.authorize(...)` on any mutation — every write must be gated.
- ❌ Sending a Lucid model to Inertia without a transformer — types will leak and shape drifts.
- ❌ Transformer that has one variant with everything — over-fetch. Trim variants per page.
- ❌ Validator inline in the controller — always in `<mod>/validators.ts`.
- ❌ Using `#generated/controllers` in `routes.ts` when the codegen hasn't run yet for the new module — use direct dynamic imports (`const X = () => import('#<mod>/controllers/x_controller')`).
- ❌ Adding controller methods that aren't `index/create/store/edit/update/destroy` to the resource — put them as separate `router.post(...)` calls in `routes.ts`.

## Related skills

[[module-scaffolding]] · [[actions-events]] · [[authorization]] · [[inertia]] · [[testing]] · [[i18n]] · [[migrations]]
