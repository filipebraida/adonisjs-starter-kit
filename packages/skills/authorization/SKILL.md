---
name: authorization
description: 'RBAC + Bouncer pattern in an AdonisJS + Inertia app. Capabilities live in a `PERMISSIONS` const, role slugs in `ROLES`; a `WithRoles` mixin composes into `User` to expose `hasPermission` / `hasRole` / `syncRoles`; `BasePolicy` subclasses gate routes; the frontend consumes a typed `useCan()` prop. Escalation is protected in depth. Use when adding a capability, gating a route, adding a policy, extending role logic, or reading `can` on the frontend. Trigger on: "add permission", "gate route", "policy", "useCan", "role", "RBAC".'
license: MIT
allowed-tools: Read, Edit, Write, Bash, Grep, Glob
---

# Authorization

Role-based access control implemented in plain code on top of AdonisJS Bouncer — no external RBAC library. Four moving parts:

1. **`PERMISSIONS`** — a const catalog of every capability the app understands.
2. **`ROLES`** — a const catalog of role slugs, each with a weight used to pick a display role.
3. **`WithRoles`** — a mixin composed into `User` that grants `assignRole` / `hasRole` / `hasPermission` / `syncRoles`.
4. **`BasePolicy` subclasses** — enforce `hasPermission(...)` at the controller.

On the frontend a typed `GlobalPermissions` object flows through Inertia's shared props and is consumed via `useCan()`. Adding a permission is a two-line change (`PERMISSIONS` const + wherever it's gated); adding a role is a config + seed touch.

## Rules

- **Single source of truth for capabilities** in a `PERMISSIONS` const object under the `users` module. Naming: `<mod>.<action>` (`users.create`, `tokens.view_list`). Adding a permission = adding one entry + referencing it wherever it's gated. A new module's capabilities go in this **same** const — the `<mod>.<action>` naming already namespaces them; don't fork a second `PERMISSIONS`. One central catalog; the policies that consume it stay in each module.
- **Role slugs** live in a `ROLES` const with a matching `ROLE_WEIGHTS` map. The weights drive `mainRole()` for display ordering. Adding a role = new entry + a seed that grants its permissions.
- **Roles store their own permissions** on the `Role` model as a JSON column (`role.permissions: Permission[]`). Seed with `Role.updateOrCreate({ name }, { permissions: [...] })`.
- **`WithRoles` mixin** composes into `User` next to `withAuthFinder`. It exposes:
  - Mutations: `assignRole(role)`, `assignRoles(roles)`, `syncRoles(roles)`, `revokeRole(role)`, `revokeRoles(roles)`.
  - Checks: `hasRole(name)`, `hasPermission(permission)`.
  - Reads: `getRoleNames()`, `getPermissions()`, `preloadedRoles` (sync read of `.load('roles')`).
- **Policies** subclass `BasePolicy` and live at `app/<mod>/policies/<entity>_policy.ts`. One method per gated action. Signature: `currentUser` first, resource second when applicable. Return `boolean | AuthorizerResponse`.
- **Gate at the controller before validating**: `await bouncer.with(EntityPolicy).authorize('methodName', resource?)`. On deny it throws → 403 (JSON) or 302 back (HTML/Inertia). **Every mutation route (POST/PUT/PATCH/DELETE) must be gated by a Bouncer policy — no exceptions.**
- **Frontend shared prop**: an Inertia middleware computes a small `can: GlobalPermissions` object (`manageUsers`, `manageTokens`, …) and shares it on every request. Read with `useCan()`. Extending the object = adding a boolean field to `global_permissions.ts` computed from `user.hasPermission(PERMISSIONS.x)`; `useCan` types update automatically.
- **Escalation guards** are defense-in-depth on top of validators:
  - `requireManageRoles(executor)` — throws if the executor lacks `users.manage_roles`.
  - `requireManageRolesIfEscalating(executor, desiredRoles)` — enforces the check even when a validator accepted a non-default role. Call at create / invite paths.
  - `AdminLockoutException` — prevents a user from removing their own `admin` role. Raised inside `SyncUserRoles` when target and executor are the same and admin is being dropped.

## Repo refs

- Capabilities + roles: `app/users/enums/permission.ts`, `app/users/enums/role.ts`.
- `WithRoles` mixin: `app/users/mixins/with_roles.ts`. Policy: `app/users/policies/user_policy.ts`.
- Escalation guards: `app/users/actions/sync_user_roles.ts`.
- Shared `can` prop → frontend `useCan`: `app/users/services/global_permissions.ts`, `app/common/ui/hooks/use_can.ts`.
- Central registries: `app/core/policies/main.ts`, `app/core/abilities/main.ts`.

## Doc refs

- AdonisJS Bouncer — https://docs.adonisjs.com/guides/security/authorization

## Workflow

### Add a new permission

1. Add an entry to `PERMISSIONS`:
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
3. Grant it to the roles that need it (usually via the seeder for `admin`).
4. If the frontend needs a boolean for the permission, extend `GlobalPermissions`:
   ```ts
   canCreateInvoices: user?.hasPermission(PERMISSIONS.invoicesCreate) ?? false,
   ```

### Add a new role

1. Add slug to `ROLES` + weight to `ROLE_WEIGHTS`.
2. Seed the role with its permissions in a seeder.
3. Update `ensureBaseRoles()` in the test RBAC helpers if it's a base role every test needs.

### Gate a route (mutation)

```ts
public async store({ auth, bouncer, request, response }: HttpContext) {
  await bouncer.with(InvoicePolicy).authorize('create')
  const payload = await request.validateUsing(createInvoiceValidator)
  await new CreateInvoice().handle({ ...payload, executor: auth.getUserOrFail() })
  return response.redirect().toRoute('invoices.index')
}
```

Policy runs before the validator so a 403 doesn't leak field-level errors to unauthorized callers. See [[crud]].

### Gate a UI element

```tsx
const can = useCan()
if (!can.manageUsers) return null
```

Or use the built-in `can: 'permissionKey'` field on nav items — see [[layout-shells]].

### Escalation-safe user creation / invite

In the action that creates a user with a non-default role:

```ts
await requireManageRolesIfEscalating(input.executor, [input.role])
```

The validator alone isn't enough — a user with `users.create` but not `users.manage_roles` could try to escalate. This guard is defense-in-depth.

### Testing

Set roles per test with the RBAC helpers:

```ts
const admin = await UserFactory.create()
await withRole(admin, ROLES.ADMIN)

// or granular:
const editor = await UserFactory.create()
await withPermissions(editor, 'editor', [PERMISSIONS.invoicesCreate])
```

Cover the "unauth", "authenticated-but-forbidden", and "authorized" paths for each mutation. See [[testing]].

## Anti-patterns

- ❌ Hardcoding role name strings (`'admin'`) — use `ROLES.ADMIN`.
- ❌ Hardcoding permission strings (`'users.create'`) — use `PERMISSIONS.usersCreate`.
- ❌ Skipping the policy call because "the validator already checked" — validators check payload shape, not authority.
- ❌ Adding a permission to `PERMISSIONS` and forgetting the seeder — nobody will actually have it.
- ❌ Gating only on the frontend (`if (can.x)`) — always mirror the check on the backend policy. Frontend gating is UX, not security.
- ❌ Assigning role by slug string in tests instead of `withRole(user, ROLES.ADMIN)` — drifts if the slug ever changes.
- ❌ Removing an escalation guard "because the validator handles it" — it's defense in depth for a reason.
- ❌ Owner check via `.where('owner_id', user.id)` in a query instead of the policy — the policy is the source of truth; a query filter is an unrelated concern.

## Related skills

[[crud]] · [[testing]] · [[actions-events]] · [[layout-shells]]
