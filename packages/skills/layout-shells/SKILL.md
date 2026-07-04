---
name: layout-shells
description: 'Layout shells in this repo. Instead of a runtime layout chooser, four purpose-built shells coexist as distinct components (admin_layout, authenticated_layout, auth_layout, marketing_layout). Every page picks its shell explicitly. Use when adding a new page (which shell to import), when adding a new area of the app (which shell fits), or when discussing runtime configurability. Trigger on: "which layout", "shell", "sidebar", "top nav", "layout choice".'
license: MIT
allowed-tools: Read, Edit, Write, Bash, Grep, Glob
---

# Layout shells

Four shells coexist as distinct React components; every page imports the one it needs and no toggle chooses at runtime. Variant/collapsible/direction are hardcoded inside the shell file — never props, never user-facing settings. If a project spun from this starter doesn't need one of the shells (e.g. no marketing site), the shell file is deleted, not "disabled by config". The philosophy is **starting clean over configuring at runtime**.

## Conventions

- **Four shells**:
  - `admin_layout` (`app/common/ui/components/admin_layout.tsx`) — sidebar shell for admin/backoffice pages. Wraps in `SidebarProvider` + `AppSidebar`. Includes Toaster + ModalRoot.
  - `authenticated_layout` (`app/common/ui/components/authenticated_layout.tsx`) — top-nav shell for regular logged-in pages. Max-width 7xl body.
  - `auth_layout` (`app/auth/ui/components/auth_layout.tsx`) — split-screen shell (form left, illustration right) for sign-in / sign-up / password flows.
  - `marketing_layout` (`app/marketing/ui/components/marketing_layout.tsx`) — public shell with header + main + footer.
- **Every page imports its shell explicitly**:
  ```tsx
  import AdminLayout from '#common/ui/components/admin_layout'
  export default function Page() { return <AdminLayout>...</AdminLayout> }
  ```
- **No runtime toggle**. Do not accept `variant`/`collapsible`/`direction` as props. If the project truly needs both a sidebar and a top-nav area (admin + regular user), pages simply import different shells.
- **Header widgets are shared** across logged-in shells: `<NotificationBell />`, `<ToggleTheme />`, `<LanguageSwitcher />`, `<NavUser />`.
- **Navigation configs**:
  - `getMainNav(t)` — items for the top nav of `authenticated_layout`.
  - `getAdminNav(t)` — items for the sidebar of `admin_layout`. Includes a "Dashboard" link back to the top-nav area.
  - `getNavUser(t)` — user-dropdown items shared by all logged-in shells. Items support `can: PermissionKey` for RBAC gating (see [[authorization]]).
- **Providers stay at the root**, not in shells. Theme, i18n, Tuyau, Modal stack all live in `apps/web/app/core/ui/app/app.tsx` — shells just render inside them.
- **Adding a shell** is only worth it when the shape is truly new (e.g. an installer wizard chrome). Otherwise reuse an existing shell.

## Repo refs

- Admin (sidebar) shell: `apps/web/app/common/ui/components/admin_layout.tsx`.
- Authenticated (top-nav) shell: `apps/web/app/common/ui/components/authenticated_layout.tsx`.
- Auth (split-screen) shell: `apps/web/app/auth/ui/components/auth_layout.tsx`.
- Marketing (public) shell: `apps/web/app/marketing/ui/components/marketing_layout.tsx`.
- Nav configs: `apps/web/app/common/ui/config/navigation.config.ts` (`getMainNav`, `getAdminNav`, `getNavUser`).
- Sidebar primitive: `packages/ui/src/components/sidebar.tsx`.
- Uses AdminLayout: `apps/web/app/users/ui/pages/index.tsx` (Users admin list).
- Uses AuthenticatedLayout: `apps/web/app/analytics/ui/pages/dashboard.tsx`, `apps/web/app/users/ui/pages/settings.tsx`.
- Uses AuthLayout: `apps/web/app/auth/ui/pages/{sign_in,sign_up,forgot_password,reset_password}.tsx`.
- Uses MarketingLayout: `apps/web/app/marketing/ui/pages/show.tsx`.

## Doc refs

- shadcn/ui Sidebar block (upstream of the sidebar primitive) — https://ui.shadcn.com/blocks#sidebar

(This skill is repo convention; no external framework doc drives it.)

## Workflow

### Pick the shell for a new page

- Is it a login / sign-up / password reset page? → `auth_layout`.
- Is it a public marketing page (landing, about, blog)? → `marketing_layout`.
- Is it an admin / backoffice screen (users management, reports, org settings)? → `admin_layout`.
- Any other logged-in page (dashboard, profile settings, main app UX)? → `authenticated_layout`.

### Add a nav item

- Top-nav (`authenticated_layout`): add to `getMainNav(t)` in `apps/web/app/common/ui/config/navigation.config.ts`.
- Sidebar (`admin_layout`): add to `getAdminNav(t)` in the same file.
- User dropdown (shared): add to `getNavUser(t)`. Set `can: 'permissionKey'` to gate visibility.

### Delete an unused shell in a downstream project

For a project that doesn't need one:

1. Delete the shell file (`<shell>_layout.tsx`).
2. Delete any pages that used it.
3. Delete the nav config section that fed it (e.g. `getAdminNav` if you removed the sidebar).
4. Delete the corresponding icons in `apps/web/app/common/ui/icons/` if they were only used there.

Nothing else references the shells — no runtime config, no feature flag.

### Add a new shell (rare)

Only when the shape is genuinely new. Copy the closest existing shell, hardcode the new decisions (variant / direction / max-width), keep the same widget row in the header (bell + theme + lang + user).

## Anti-patterns

- ❌ Adding `variant`/`collapsible`/`direction` as props on a shell.
- ❌ Wrapping a shell in a context provider to switch behavior at runtime.
- ❌ Configuring shells via user preferences (theme + language are user prefs; layout choice is not).
- ❌ Nesting one shell inside another.
- ❌ Reintroducing a runtime chooser in `AppLayout` — the whole starter was refactored specifically to remove that.
- ❌ Hardcoding sidebar items inside `admin_layout.tsx` — always go through `getAdminNav`.

## Related skills

[[inertia]] · [[authorization]] · [[i18n]] · [[notifications]]
