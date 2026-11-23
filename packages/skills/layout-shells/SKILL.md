---
name: layout-shells
description: 'Layout shells in an AdonisJS + Inertia app. Instead of a runtime layout chooser, each context has its own purpose-built shell that coexists as a distinct React component. Every page picks its shell explicitly by import. Use when adding a new page (which shell to import), when adding a new area of the app (which shell fits), or when someone proposes runtime configurability. Trigger on: "which layout", "shell", "sidebar", "top nav", "layout choice".'
license: MIT
allowed-tools: Read, Edit, Write, Bash, Grep, Glob
---

# Layout shells

Every page imports the shell it needs; there is no runtime chooser. Variant / collapsible / direction / max-width are hardcoded inside the shell file — not props, not user-facing settings. If a project spun from this template doesn't need one of the shells (e.g. no marketing area), the shell file is deleted, not "disabled by config". The philosophy is **starting clean over configuring at runtime** — configurability adds branches that need to be tested, translated, permissioned; deletion doesn't.

## Rules

- **Every page imports its shell explicitly** at the top of the page file. No wrapper picks the shell based on route, role, or props.
  ```tsx
  import AdminLayout from '#core/ui/components/admin_layout'
  export default function Page() {
    return <AdminLayout>...</AdminLayout>
  }
  ```
- **The shell does not name the page**: each page renders its own `<Head title={t('...')} />` inside the shell — see [[inertia]].
- **Shell decisions are hardcoded**: variant, collapsible, direction, max-width live inside the shell file. Do not accept them as props.
- **Header widgets are shared** across shells that need them (`<NotificationBell />`, `<ToggleTheme />`, `<LanguageSwitcher />`, `<NavUser />`) — same visual identity, imported directly by each shell that mounts them.
- **Nav configs live in a single file** and are exposed as functions (`getMainNav(t)`, `getAdminNav(t)`, `getNavUser(t, area)`, `getTabs(t, area)`, `getMoreGroups(t, area)`), in `#core/ui/app/navigation`. Nav items support a `can: CAPABILITIES_<MOD>.x` field for RBAC gating (filtered by `useAllows()`) — see [[authorization]]. Nav items are never hardcoded inside the shell file.
- **Providers stay at the root client entry**, not inside shells. Theme, i18n, Tuyau, modal stack are mounted once so every shell renders inside them.
- **Adding a shell** is only worth it when the shape is genuinely new (installer wizard chrome, kiosk, checkout). Otherwise reuse an existing shell — the same page can render inside two different shells if two contexts need it.

## Shell inventory (this kit)

- **`AdminLayout`** (`#core/ui/components/admin_layout`) — the logged-in admin shell: collapsible sidebar fed by `getAdminNav(t)`. Wraps the administration pages (users list, activity). It holds admin pages only; the way back to the app is in the user menu.
- **On a phone** both logged-in shells trade their menus for a `TabBar` at the foot of the screen (`getTabs(t, area)`: the everyday destinations, three or four), whose last tab opens the "More" page (`/more?area=…`, `core/ui/pages/more.tsx`) with everything else, grouped by `getMoreGroups(t, area)`. A nav item's `count` shows as a badge in the tab bar.
- **`AuthenticatedLayout`** (`#core/ui/components/authenticated_layout`) — the logged-in shell with a top nav fed by `getMainNav(t)`. Wraps the everyday pages (dashboard, settings).
- **`AuthLayout`** (`#auth/ui/components/auth_layout`) — the pre-login shell (sign-in, sign-up, password flows). Simpler, no nav.
- **`MarketingLayout`** (`#marketing/ui/components/marketing_layout`) — the public landing chrome (header + footer); the page composes its sections (`<Hero>`, `<FeatureShowcase>`, …) inside it.

Both logged-in shells mount the same header widgets, `useFlashToasts()` and the modal root.

Any additional shell (checkout, kiosk, print-friendly) is added only when its chrome is truly distinct.

## Repo refs

- The four shells: `app/core/ui/components/admin_layout.tsx`, `app/core/ui/components/authenticated_layout.tsx`, `app/auth/ui/components/auth_layout.tsx`, `app/marketing/ui/components/marketing_layout.tsx`.
- Nav config (single file): `app/core/ui/app/navigation.ts`.

## Doc refs

- shadcn/ui Sidebar block (typical upstream of the sidebar primitive) — https://ui.shadcn.com/blocks#sidebar

## Workflow

### Pick the shell for a new page

- Login / sign-up / password reset → `AuthLayout`.
- Administration page (managing users, audit) → `AdminLayout`.
- Any other logged-in page → `AuthenticatedLayout`.
- Public marketing page (landing, about, blog) → `MarketingLayout`, sections composed inside it.
- Any other context (checkout, installer, kiosk) → add a new shell only if its chrome shares nothing with the existing ones.

### Add a nav item

Edit the navigation config file — `getMainNav(t)` for the top nav, `getAdminNav(t)` for the admin sidebar, `getNavUser(t, area)` for the user dropdown (it offers the admin panel in the app and the way back in the admin), `getTabs(t, area)` for the phone's tab bar; what is in neither reaches the "More" page on its own. Set `can: CAPABILITIES_<MOD>.x` to gate visibility. Do not put the item inside the shell file.

### Delete an unused shell in a downstream project

For a project that doesn't need one of the shells:

1. Delete the shell file.
2. Delete any pages that used it.
3. Delete the nav config section that fed it (a section that only its shell reads).

Nothing else references the shells — no runtime config, no feature flag.

### Add a new shell (rare)

Only when the shape is genuinely new. Copy the closest existing shell, hardcode the new decisions (variant / direction / max-width), keep the same widget row in the header (bell + theme + lang + user) if the shell is authenticated.

## Anti-patterns

- ❌ Adding `variant` / `collapsible` / `direction` as props on a shell — hardcode them; if the project needs a different shape, add a different shell.
- ❌ Wrapping a shell in a context provider to switch behavior at runtime.
- ❌ Configuring shells via user preferences (theme + language are user prefs; layout choice is not).
- ❌ Nesting one shell inside another.
- ❌ A wrapper component that picks a shell based on the route or role — the page picks. Explicit beats magic.
- ❌ Hardcoding nav items inside the shell file — always go through the nav config functions.
- ❌ Adding page-only providers inside a shell — providers belong at the root client entry so every page and every shell sees them.

## Related skills

[[inertia]] · [[authorization]] · [[i18n]] · [[notifications]]
