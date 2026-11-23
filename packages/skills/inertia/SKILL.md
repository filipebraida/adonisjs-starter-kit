---
name: inertia
description: 'Inertia v3 + React 19 patterns in an AdonisJS app. Pages resolve from module dirs (`app/<mod>/ui/pages/`) and render `<Head title>`, shared props flow from a middleware, forms use the project `<Form route>` (`useForm` only with a stated reason), URLs come from Tuyau `urlFor` / `<Link route>`, dates and numbers from the shared formatters, and modals are `inertia.modal(...)`. Use when adding an Inertia page, writing a form, reading shared props, or wiring a route to a page component. Trigger on: "add page", "Inertia page", "add form", "useForm", "shared props", "modal", "urlFor".'
license: MIT
allowed-tools: Read, Edit, Write, Bash, Grep, Glob
---

# Inertia

Inertia is the bridge between AdonisJS routes and React pages: controllers call `inertia.render('<name>', { props })`, the client resolves that name to a `.tsx` file inside a module's `ui/pages/`. Shared props flow globally through an Inertia middleware. Forms use the project `<Form>` (`#core/ui/components/form`), which wraps the AdonisJS `<Form route>` and feeds validation errors to its fields; URLs come from Tuyau's `urlFor('route.name', params?)` for type safety. Modals are Inertia responses too — `inertia.modal(...)` renders one page over another. Every provider (theme, i18n, tooltip, Tuyau, modal stack) is wired at the root client entry. The `ui` preset of `@filipebraida/eslint-config-adonis` enforces most rules below; an exception is a named block in `apps/web/eslint.config.js`, never an `eslint-disable` comment.

## Rules

- **Page location**: `app/<mod>/ui/pages/<subpath>/<page>.tsx`. Controllers reference the page by the path minus `.tsx` and everything before `<mod>/`: `inertia.render('users/index')` → `app/users/ui/pages/index.tsx`, `inertia.render('users/create')` → `app/users/ui/pages/create.tsx`. First segment = module.
- **Shell import**: every page imports its layout shell explicitly ([[layout-shells]]). No runtime chooser.
- **Title**: every page renders `<Head title={t('<mod>.<page>.title')} />` from `@inertiajs/react`. A modal page (its component returns `<Modal>` as the root) keeps the title of the page under it.
- **Client entry** mounts the global provider tree — theme, i18n, tooltip, Tuyau, modal stack. Don't reorder without reason; theme + i18n need to be outermost so shells see them.
- **Shared props**: added by the Inertia middleware via `ctx.inertia.always(...)`. Available on the frontend via a typed `usePageProps<{...}>()` hook. Per-request data (page-specific) goes in the controller's `inertia.render(...)` call, not in the middleware.
- **Form**: default is the project `<Form route="route.name">` from `#core/ui/components/form`, with `<Field name>` + `<FieldError />` from the same module — the method comes from the route, errors reach each field through context, `processing` comes from the render prop. `useForm` from `@inertiajs/react` only for state that is not a flat set of named inputs (upload progress + preview, a controlled shared field component, a confirm button outside the `<form>`), and then the file opens with `// useForm and not <Form>: <reason>`.
- **URLs**: never hardcode. `<Link route="route.name" routeParams={{ id }}>` from `@adonisjs/inertia/react` for links, `urlFor('route.name', { param: value }, { qs })` from `~/app/client` for programmatic visits and `href`s with a query string. Route names come from `.as('route.name')` in the module's `routes.ts`.
- **Dates and numbers** go through `#core/ui/format/date` (`formatDate`, `formatDateTime`, `formatRelativeTime`) and `#core/ui/format/number` (`formatNumber`, `formatCurrency`, `formatPercent`) with the user's locale (`useTranslation().language`). No `toLocaleString` / `Intl` in a screen.
- **Capability-gated UI**: `useCan(CAPABILITIES_<MOD>.x)` from `@adonis-agora/authz-react` for one check; `useAllows()` (`#core/ui/hooks/use_allows`) to filter a list in one render (nav items). Ask what the user can do, never which role they have — see [[authorization]].
- **Modals**: the controller returns `inertia.modal('<mod>/<page>', props, { route: 'backdrop.route' })` (`adonis-inertia-modal`). The modal page returns `<Modal>` from `adonis-inertia-modal/react` as its root and receives a `close` render prop.
- **Navigation between pages**: `router.visit(url)`; `router.reload({ only: ['propName'], async: true })` for partial reloads; `router.get/post/put/delete(url, data, options)` for programmatic form submits.
- **Types**: server-generated data types come from an ace codegen; the client alias makes them available across pages. Don't duplicate the type in the page — `import type` from the codegen path.

## Repo refs

- Page resolver: `app/core/ui/app/app.tsx`. Shared props (`share()`): `app/core/middleware/inertia_middleware.ts`. `InertiaProps<T>`: `app/core/ui/app/types.ts`. Tuyau client (`urlFor`): `app/core/ui/app/client.ts`.
- `<Form>` wrapper: `app/core/ui/components/form.tsx`; in use: `app/auth/ui/components/forgot_password_form.tsx`. `useForm` with its reason: `app/users/ui/components/profile_form.tsx`.
- Page + `<Head>` + typed props: `app/users/ui/pages/index.tsx`. Modal page + `inertia.modal` controller: `app/users/ui/pages/create.tsx`, `app/users/controllers/users_controller.ts`.
- Formatters: `app/core/ui/format/{date,number}.ts` (used in `app/analytics/ui/pages/dashboard.tsx`). `useCan`: `app/users/ui/pages/settings.tsx`.

## References

Generic Inertia v3 knowledge, adapted to this kit — load the one you need:

- [references/forms.md](references/forms.md) — `<Form>` wrapper, when `useForm`, uploads, field vs root errors, `transform`.
- [references/router.md](references/router.md) — `<Link>`, `router.*`, visit options, filters that update the URL.
- [references/partial-reloads.md](references/partial-reloads.md) — `optional`, `defer`, `merge`, `always`.
- [references/pagination.md](references/pagination.md) — `Transformer.paginate(...)` shape and page navigation.
- [references/shared-props.md](references/shared-props.md) — reading and adding shared props, flash.
- [references/layouts.md](references/layouts.md) — child-component shells vs persistent layouts.
- [references/ssr.md](references/ssr.md) — selective SSR allowlist and its gotchas.
- [references/types.md](references/types.md) — generated `Data.*`, `InertiaPages`, `InertiaProps`.

## Doc refs

- AdonisJS Inertia — https://docs.adonisjs.com/guides/views-and-templates/inertia
- Inertia.js React — https://inertiajs.com/client-side-setup
- Inertia v3 forms — https://inertiajs.com/docs/v3/the-basics/forms
- Tuyau (route-safe URLs) — https://tuyau.julr.dev/docs

## Workflow

### Add a page

1. **Route + controller method** — see [[crud]] for the full CRUD flow, [[routes]] for the route shape. For a one-off page: `router.get('/dashboard', [controllers.analytics.Dashboard, 'show']).middleware(middleware.auth()).as('dashboard.show')`.
2. **Controller** returns `inertia.render('<mod>/<page>', { props })`. Props must be JSON-serializable — transform Lucid models with a Transformer variant (see [[crud]]).
3. **Page file** at `app/<mod>/ui/pages/<page>.tsx`. Import the shell ([[layout-shells]]):
   ```tsx
   import { Head } from '@inertiajs/react'

   import AuthenticatedLayout from '#core/ui/layouts/authenticated'
   import type { InertiaProps } from '#core/ui/app/types'
   import { useTranslation } from '#core/ui/hooks/use_translation'

   import type { Data } from '@generated/data'

   type PageProps = InertiaProps<{
     profile: Data.Users.User.Variants['forProfile']
   }>

   export default function DashboardPage({ profile }: PageProps) {
     const { t } = useTranslation()

     return (
       <AuthenticatedLayout breadcrumbs={[{ label: t('analytics.dashboard.breadcrumb') }]}>
         <Head title={t('analytics.dashboard.breadcrumb')} />
         {/* body */}
       </AuthenticatedLayout>
     )
   }
   ```

### Read shared props

```tsx
const { user, csrf, unseenNotifications } = usePageProps<{
  user?: Data.Users.User.Variants['forSharedProps']
  csrf?: string
  unseenNotifications?: number
}>()
```

Prefer typed access via `usePageProps<T>()`. For anonymous access to the raw page object, `import { usePage } from '@inertiajs/react'`.

### Write a form

```tsx
import { Field, FieldError, Form } from '#core/ui/components/form'

;<Form route="auth.forgot_password.handle" resetOnSuccess onSuccess={() => toast(t('...'))}>
  {({ processing }) => (
    <>
      <Field name="email">
        <FieldLabel htmlFor="email">{t('auth.forgot_password.form.email.label')}</FieldLabel>
        <Input id="email" name="email" type="email" required />
        <FieldError />
      </Field>
      <Button type="submit" disabled={processing}>
        {t('auth.forgot_password.actions.submit')}
      </Button>
    </>
  )}
</Form>
```

When `<Form>` cannot express it, `useForm` — and say why on the file's first line:

```tsx
// useForm and not <Form>: the avatar upload reports its progress and previews the picked
// file before the submit.
const { data, setData, errors, put, progress } = useForm({
  fullName: user.fullName ?? '',
  avatar: null as File | null,
})
// put(urlFor('profile.update'), { preserveScroll: true, onSuccess: ... })
```

With `useForm`, errors live in `errors.<field>`; the context-bound `<FieldError />` does not see them. Details in [references/forms.md](references/forms.md).

### Modals

Controller side:

```ts
public async create({ bouncer, inertia }: HttpContext) {
  await bouncer.with(EntityPolicy).authorize('create')
  return inertia.modal('entities/create', {}, { route: 'entities.index' })
}
```

Modal page:

```tsx
import { Modal } from 'adonis-inertia-modal/react'

export default function CreateEntityPage() {
  return (
    <Modal maxWidth="md">{({ close }) => <>{/* form + Save calls close() on success */}</>}</Modal>
  )
}
```

The `{ route: 'entities.index' }` backdrop tells the modal system what to render underneath.

### Partial reload

To refresh just some shared props without navigating:

```ts
router.reload({ only: ['unseenNotifications'], async: true })
```

Good for badges and counters that mutate independently of the current page.

## Anti-patterns

- ❌ Hardcoding URLs (`/users/${id}`) — use `<Link route="users.edit" routeParams={{ id }}>` or `urlFor('users.edit', { id })`.
- ❌ `useForm` without the `// useForm and not <Form>: <reason>` line, or raw `<Form>` from `@inertiajs/react` / `@adonisjs/inertia/react` in a screen — use `#core/ui/components/form`.
- ❌ A page without `<Head title>`.
- ❌ `new Date(x).toLocaleDateString()` / `Intl.NumberFormat` in a screen — use `#core/ui/format/*`.
- ❌ `user.roles.includes('admin')` in the UI — `useCan(...)` / `useAllows()`.
- ❌ An `eslint-disable` comment to get past a UI rule — fix the code, or add a named exception block in `apps/web/eslint.config.js`.
- ❌ Sending Lucid models to `inertia.render(...)` — run through a Transformer variant ([[crud]]).
- ❌ Adding page-only providers at the page level — providers belong at the root client entry.
- ❌ Sharing per-page data via the middleware's `share()` — that inflates every response. Per-request data goes in the controller's `inertia.render(...)`.
- ❌ Using `<a href>` for internal navigation — use `<Link>` from `@adonisjs/inertia/react` or `router.visit`.
- ❌ Forgetting `preserveScroll: true` when a form submit stays on the same page — the browser jumps back to the top otherwise.
- ❌ Reading `page.props` untyped — use `usePageProps<T>()`.
- ❌ Duplicating a query's return type in the page — `import type` from the query file (see [[queries]]).

## Related skills

[[routes]] · [[crud]] · [[queries]] · [[layout-shells]] · [[i18n]] · [[actions-events]] · [[testing]]
