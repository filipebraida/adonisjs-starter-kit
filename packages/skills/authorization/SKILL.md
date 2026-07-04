---
name: authorization
description: 'RBAC + Bouncer pattern in this repo. Capabilities live in a `PERMISSIONS` const, role slugs in `ROLES`; the `WithRoles` mixin composes into `User` to expose `hasPermission`/`hasRole`/`syncRoles`; `BasePolicy` subclasses gate routes; the frontend consumes a typed `useCan()` prop. Escalation is protected in depth. Use when adding a new capability, gating a route, adding a policy, extending role logic, or reading `can` on the frontend. Trigger on: "add permission", "gate route", "policy", "useCan", "role", "RBAC".'
license: MIT
allowed-tools: Read, Edit, Write, Bash, Grep, Glob
---

# Authorization

Role-based access control implemented in plain code on top of AdonisJS Bouncer — no external RBAC library. Four moving parts: (1) `PERMISSIONS` — const catalog of every capability the app understands; (2) `ROLES` — const catalog of role slugs with weights; (3) `WithRoles` mixin composed into `User` — grants `assignRole`/`hasRole`/`hasPermission`/`syncRoles`; (4) `BasePolicy` subclasses — enforce `hasPermission(...)` at the controller. On the frontend a typed `GlobalPermissions` object flows through Inertia's shared props and is consumed via `useCan()`. Adding a permission is a two-line change (`PERMISSIONS` const + wherever it's gated); adding a role is a config + migration touch.

## Conventions

- **Single source of truth for capabilities**: `apps/web/app/users/enums/permission.ts`. Adding a permission = adding one entry to the `PERMISSIONS` const object + referencing it wherever gated. Naming: `<mod>.<action>` (`users.create`, `tokens.view_list`).
- **Role slugs**: `apps/web/app/users/enums/role.ts` — `ROLES.USER` and `ROLES.ADMIN`. Weights (`ROLE_WEIGHTS`) drive `mainRole()` for display ordering. New role = new entry + migration seeding permissions.
- **Roles store their permissions**: on the `Role` model as a JSON column. `role.permissions: Permission[]`. Use `Role.updateOrCreate({ name }, { permissions: [...] })` for seeding.
- **`WithRoles` mixin** composes into `User` (like `withAuthFinder`). Exposes:
  - `assignRole(role)`, `assignRoles(roles)`, `syncRoles(roles)`, `revokeRole(role)`, `revokeRoles(roles)` — mutations.
  - `hasRole(name)`, `hasPermission(permission)` — checks.
  - `getRoleNames()`, `getPermissions()` — reads.
  - `preloadedRoles` getter — sync read of `.load('roles')` result.
- **Policies subclass `BasePolicy`** and live at `app/<mod>/policies/<entity>_policy.ts`. Method per gated action. Return `boolean | AuthorizerResponse`. Always take `currentUser` first, resource second when applicable.
- **Gate at the controller**: `await bouncer.with(EntityPolicy).authorize('methodName', resource?)`. Runs before validators. Throws on deny → 403 → redirect to `/` (or JSON depending on Accept).
- **Frontend shared prop**: Inertia middleware computes a small `can: GlobalPermissions` object (`manageUsers`, `manageTokens`, …) and shares on every request. Read with `useCan()` → `if (!can.manageUsers) return null`.
- **Extending `GlobalPermissions`**: add the boolean field to `app/users/services/global_permissions.ts` and compute it from `user.hasPermission(PERMISSIONS.x)`. The `useCan` hook types update automatically.
- **Escalation guards** are in-depth:
  - `requireManageRoles(executor)` — throws `ManageRolesUnauthorizedException` if missing `users.manage_roles`.
  - `requireManageRolesIfEscalating(executor, desiredRoles)` — enforces the check even if validators accepted a non-default role. Call at create/invite paths.
  - `AdminLockoutException` — prevents removing your own `admin` role. Raised inside `SyncUserRoles` when the target and executor are the same and admin is being dropped.

## Repo refs

- Permissions catalog: `apps/web/app/users/enums/permission.ts`.
- Role slugs + weights + `mainRole()`: `apps/web/app/users/enums/role.ts`.
- Role model (permissions column + `hasPermission`): `apps/web/app/users/models/role.ts`.
- `WithRoles` mixin: `apps/web/app/users/mixins/with_roles.ts`.
- User uses it: `apps/web/app/users/models/user.ts` (via `compose(BaseModel, AuthFinder, withRoles())`).
- Canonical policy: `apps/web/app/users/policies/user_policy.ts` — self-exception on view/update, permission check on the rest, `delete` refuses self.
- Also: `apps/web/app/users/policies/token_policy.ts`.
- Global shared prop shape: `apps/web/app/users/services/global_permissions.ts`.
- Inertia middleware wires it: `apps/web/app/core/middleware/inertia_middleware.ts`.
- Frontend hook: `apps/web/app/common/ui/hooks/use_can.ts`.
- Escalation helpers + admin-lockout: `apps/web/app/users/actions/sync_user_roles.ts`.
- Exceptions: `apps/web/app/users/exceptions/{admin_lockout,manage_roles_unauthorized}.ts`.
- Test helpers: `apps/web/tests/helpers/rbac.ts` (`ensureBaseRoles`, `withRole`, `withPermissions`, `ensureUser`).

## Doc refs

- AdonisJS Bouncer — https://docs.adonisjs.com/guides/security/authorization

## Workflow

### Add a new permission

1. Add an entry to `PERMISSIONS` in `app/users/enums/permission.ts`:
   ```ts
   export const PERMISSIONS = {
     ...,
     invoicesCreate: 'invoices.create',
   } as const
   ```
2. Reference it in the policy method that gates it:
   ```ts
   async create(user: User) { return user.hasPermission(PERMISSIONS.invoicesCreate) }
   ```
3. Assign to whichever roles need it (usually the seeder for `admin`).
4. If it's coarse enough to want on the frontend as a boolean, extend `GlobalPermissions` in `global_permissions.ts`.

### Add a new role

1. Add slug to `ROLES` + weight to `ROLE_WEIGHTS` in `app/users/enums/role.ts`.
2. Seed the role with its permissions in `apps/web/app/users/database/seeders/`.
3. Update `ensureBaseRoles()` in `tests/helpers/rbac.ts` if it's a base role every test needs.

### Gate a route (mutation)

```ts
public async store({ bouncer, request, response }: HttpContext) {
  await bouncer.with(InvoicePolicy).authorize('create')
  const payload = await request.validateUsing(createInvoiceValidator)
  await new CreateInvoice().handle({ ...payload, executor: auth.user! })
  return response.redirect().toRoute('invoices.index')
}
```

Policy runs before validator so the 403 doesn't leak field errors. See [[crud]].

### Gate a UI element

```tsx
const can = useCan()
if (!can.manageUsers) return null
```

Or conditionally render a nav item — the shared `getNavUser(t)` supports `can: 'permissionKey'` per item and filters automatically. See [[layout-shells]].

### Escalation-safe user creation / invite

In the action that creates a user with a non-default role:

```ts
await requireManageRolesIfEscalating(input.executor, [input.role])
```

The validator alone isn't enough — a user with `users.create` but not `users.manage_roles` could try to escalate. This guard is defense-in-depth.

### Testing

Set roles per test with helpers:
```ts
const admin = await UserFactory.create()
await withRole(admin, ROLES.ADMIN)
// or granular permissions:
const editor = await UserFactory.create()
await withPermissions(editor, 'editor', [PERMISSIONS.invoicesCreate])
```

Cover the "unauth", "authenticated-but-forbidden", and "authorized" paths for each mutation. See [[testing]].

## Anti-patterns

- ❌ Hardcoding role name strings (`'admin'`) — use `ROLES.ADMIN`.
- ❌ Hardcoding permission strings (`'users.create'`) — use `PERMISSIONS.usersCreate`.
- ❌ Skipping the policy call because "the validator already checked" — validators check payload shape, not authority.
- ❌ Adding a permission to `PERMISSIONS` and forgetting the seeder — admins won't have it.
- ❌ Gating on the frontend only (`if (can.x)`) — always mirror the check on the backend policy.
- ❌ Assigning role by slug string in tests instead of `withRole(user, ROLES.ADMIN)`.
- ❌ Removing an escalation guard "because the validator handles it" — it's defense in depth for a reason.

## Related skills

[[crud]] · [[testing]] · [[actions-events]] · [[layout-shells]]
