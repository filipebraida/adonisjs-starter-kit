---
name: authorization
description: 'RBAC with @adonis-agora/authz on top of AdonisJS Bouncer. Each module declares its capabilities in `<mod>/enums/capability.ts`; `config/capabilities.ts` grants them to roles in code (`roleGrants`, nothing seeded); only the user → role assignment is stored. Policies check capabilities through `#core/authz/authorizer`; the frontend reads the shared `authz` prop with `useCan` / `<Can>` from `@adonis-agora/authz-react`. Escalation is protected in depth. Use when adding a capability, gating a route, adding a policy, adding a role, or gating UI. Trigger on: "add permission", "capability", "gate route", "policy", "useCan", "role", "RBAC", "authz".'
license: MIT
allowed-tools: Read, Edit, Write, Bash, Grep, Glob
---

# Authorization

Role-based access control with [`@adonis-agora/authz`](https://github.com/DavideCarvalho/adonis-agora-authz) (DB-backed RBAC, wildcard matching) under AdonisJS Bouncer. Five moving parts:

1. **Capabilities** — each module declares its own in `app/<mod>/enums/capability.ts` as a `CAPABILITIES_<MOD>` const of `<domain>.<action>` slugs.
2. **Role grants** — `config/capabilities.ts` maps every role in `ROLES` to the capabilities it grants (`users.*` wildcards allowed). Read at check time from code: no seed, no screen can strip a capability the app depends on.
3. **Assignments** — the only RBAC state in the database: `user.assignRole(ROLES.X)` writes a row in the authz tables (`auth/database/migrations/*_create_authz_tables.ts`).
4. **`Authorizer`** (`#core/authz/authorizer`) — `can(user, capability)` with the request's permission cache. Policies and actions inject it.
5. **Bouncer policies** — `BasePolicy` subclasses that combine a capability with ownership/state and gate the controller.

On the frontend the shared `authz` prop (`{ roles, permissions }`, built by `buildAuthzShare` in `InertiaMiddleware`) is read with `useCan(capability)` or `<Can permission="...">` from `@adonis-agora/authz-react`, wildcard-aware.

## Rules

- **Capabilities live with their module**: `app/<mod>/enums/capability.ts`, naming `<domain>.<action>` (`users.create`, `tokens.view_list`). Typed as `Capability` (`#core/authz/capability`) at the check site, so a typo is a compile error at the constant.
- **Grants live in one place**: `config/capabilities.ts` → `roleGrants`. Adding a capability without granting it means nobody has it (except via wildcards such as `users.*`).
- **Role slugs** live in `ROLES` (`app/auth/enums/role.ts`) with `ROLE_WEIGHTS` for `mainRole()` display ordering. `roleGrants` is typed `Record<Role, string[]>`, so a new role must be granted.
- **Checks go through `Authorizer.can`** in policies and actions — not `user.can()` from the mixin — so every check in a request shares one cached read.
- **Policies** subclass `BasePolicy`, use `@inject()` with `Authorizer`, live at `app/<mod>/policies/<entity>_policy.ts`. One method per gated action; `currentUser` first, resource second.
- **Gate at the controller before validating**: `await bouncer.with(EntityPolicy).authorize('method', resource?)`. Every mutation route must be gated by a policy.
- **Reading roles in lists**: `User.roles` is a read-only `manyToMany` to `AuthzRole` via `authzRolesRelation()` — `preload('roles')` / `whereHas('roles', …)` work. Writes always go through the store (`assignRole`, `SyncUserRoles`), never `AuthzRole`.
- **Escalation guards** are defense in depth on top of validators:
  - `requireManageRoles(executor)` — throws `ManageRolesUnauthorizedException` without `users.manage_roles`.
  - `requireManageRolesIfEscalating(executor, roles)` — enforces it on create/invite when a non-default role is requested.
  - `AdminLockoutException` — `SyncUserRoles` refuses to remove the executor's own `admin`.
  - `SyncUserRoles` removes before granting, inside one transaction: a failure halfway leaves less privilege, never more.
- **Permission cache**: the library caches role and permission reads per request on its own (AsyncLocalStorage is on in `config/app.ts`), so every check in a request costs one read; outside a request each check reads the store. Don't pass a `cache` of your own. Grants changed mid-request apply from the next request.

## Repo refs

- Capabilities: `app/users/enums/capability.ts`, `app/auth/enums/capability.ts` (`users.manage_roles`). Roles: `app/auth/enums/role.ts`. Grants: `config/capabilities.ts`. Lib config: `config/authz.ts`.
- `Authorizer` + `Capability`: `app/core/authz/`. Policy: `app/users/policies/user_policy.ts`.
- Escalation guards: `app/auth/actions/sync_user_roles.ts`.
- Shared `authz` prop: `app/core/middleware/inertia_middleware.ts`. Nav filtering: `app/core/ui/hooks/use_allows.ts`.
- Roles relation: `app/auth/models/user.ts` (`roles`), `app/auth/models/authz_role.ts`.
- Central registries: `app/core/policies/main.ts`, `app/core/abilities/main.ts` (`can` / `hasRole` Bouncer abilities).

## Doc refs

- @adonis-agora/authz — https://github.com/DavideCarvalho/adonis-agora-authz (also the skills shipped in `node_modules/@adonis-agora/authz/skills/`)
- AdonisJS Bouncer — https://docs.adonisjs.com/guides/security/authorization

## Workflow

### Add a capability

1. Declare it in the module:
   ```ts
   // app/invoices/enums/capability.ts
   export const CAPABILITIES_INVOICES = {
     invoicesCreate: 'invoices.create',
   } as const
   ```
2. Grant it in `config/capabilities.ts` (`'invoices.*'` or the exact slug) to the roles that need it.
3. Check it in the policy:
   ```ts
   @inject()
   export default class InvoicePolicy extends BasePolicy {
     constructor(private authz: Authorizer) {
       super()
     }

     async create(user: User) {
       return this.authz.can(user, CAPABILITIES_INVOICES.invoicesCreate)
     }
   }
   ```

### Add a role

1. Add the slug to `ROLES` and a weight to `ROLE_WEIGHTS`.
2. Add its entry to `roleGrants` in `config/capabilities.ts` (the type requires it).
3. Nothing to seed: the role row is created on first assignment.

### Gate a route (mutation)

```ts
async store({ auth, bouncer, request, response }: HttpContext) {
  await bouncer.with(InvoicePolicy).authorize('create')
  const payload = await request.validateUsing(createInvoiceValidator)
  await new CreateInvoice().handle({ ...payload, executor: auth.getUserOrFail() })
  return response.redirect().toRoute('invoices.index')
}
```

Policy runs before the validator so a 403 doesn't leak field-level errors to unauthorized callers. See [[crud]].

### Gate a UI element

```tsx
import { useCan } from '@adonis-agora/authz-react'

const canCreate = useCan(CAPABILITIES_INVOICES.invoicesCreate)
```

For lists filtered in one render (nav items), set `can: CAPABILITIES_X.y` on the item — `useAllows()` filters them. See [[layout-shells]].

### Escalation-safe user creation / invite

```ts
await requireManageRolesIfEscalating(input.executor, [input.role])
await user.assignRole(input.role)
```

### Testing

```ts
const admin = await UserFactory.create()
await withRole(admin, ROLES.ADMIN) // tests/helpers/rbac.ts
```

What the role grants comes from `roleGrants`; the assignment is rolled back with the test's global transaction. Cover unauthenticated, authenticated-but-forbidden and authorized for each mutation. See [[testing]].

## Anti-patterns

- ❌ Hardcoding role or capability strings — use `ROLES.X` / `CAPABILITIES_<MOD>.x` (grants in `config/capabilities.ts` may use wildcards).
- ❌ Seeding role → permission rows — grants are code (`roleGrants`); a seeded grant is invisible to review and drifts per environment.
- ❌ Calling `user.can()` in a policy instead of `Authorizer.can` — it skips the request's shared cache.
- ❌ Writing through `AuthzRole` or the authz tables directly — use `assignRole` / the store, so the lib's invariants hold.
- ❌ Gating only on the frontend — `useCan` is UX, the policy is security.
- ❌ Removing an escalation guard "because the validator handles it" — it's defense in depth.
- ❌ Owner check via `.where('owner_id', user.id)` in a query instead of the policy.

## Related skills

[[crud]] · [[testing]] · [[actions-events]] · [[layout-shells]]
