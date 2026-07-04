---
name: inertia
description: 'Inertia + React 19 patterns for this repo. Pages resolve from module dirs (`app/<mod>/ui/pages/`), shared props flow from a middleware, forms use `useForm` + Tuyau `urlFor` for type-safe URLs, and modals go through a controller helper. Use this when adding an Inertia page, writing a form, reading shared props, or wiring a route to a page component. Trigger on: "add page", "Inertia page", "add form", "useForm", "shared props", "modal", "urlFor".'
license: MIT
allowed-tools: Read, Edit, Write, Bash, Grep, Glob
---

# Inertia

Inertia is the bridge between AdonisJS routes and React pages: controllers call `inertia.render('<name>')`, the client resolves that name to a `.tsx` file inside a module's `ui/pages/`. Shared props flow globally through `InertiaMiddleware.share()`. Forms use `@inertiajs/react`'s `useForm`; URLs come from Tuyau's `urlFor('route.name', params?)` for type safety. Modals are Inertia responses too — the controller helper `modal(...)` renders one page over another. Every provider (theme, i18n, tooltip, tuyau, modal stack) is wired at the root in `app.tsx`.

## Conventions

- **Page location**: `app/<mod>/ui/pages/<subpath>/<page>.tsx`. Controllers reference it by the path minus the `.tsx` and everything before `<mod>/`: `inertia.render('users/index')` → `app/users/ui/pages/index.tsx`, `inertia.render('users/create')` → `app/users/ui/pages/create.tsx`. First segment = module.
- **Shell import**: every page imports its layout shell explicitly ([[layout-shells]]). No runtime chooser.
- **Client entry** (`core/ui/app/app.tsx`): mounts the global provider tree — `I18nextProvider`, `ThemeProvider`, `TooltipProvider`, `TuyauProvider`, `ModalStackProvider`. Don't reorder without reason; theme + i18n need to be outermost so shells see them.
- **Shared props**: added in `core/middleware/inertia_middleware.ts` via `ctx.inertia.always(...)`. Available on the frontend via `usePageProps<{...}>()` or `usePage().props`.
- **Form**: default is `useForm(initial)` from `@inertiajs/react` + a plain `<form onSubmit>`. Call `post(urlFor('route.name'), { onSuccess, onFinish, preserveScroll })`. `#common/ui/components/form.tsx` wraps the built-in `@adonisjs/inertia/react` `<Form>` with a `FormErrorsContext` so nested fields can pull errors — use it when the form is complex enough that fields want context.
- **URLs**: never hardcode. Use `urlFor('route.name', { param: value })` from `~/app/client` (aliased to `apps/web/app/core/ui/app/client.ts`). Route names come from `router.get(...).as('route.name')` in the module's `routes.ts`.
- **Modals**: controller returns `modal(inertia, 'users/create', {}, { route: 'users.index' })` (helper at `#core/inertia/modal`). Modal page wraps content in `<AppModal>` and gets a `close` render prop.
- **Navigation between pages**: `router.visit(url)`, `router.reload({ only: ['propName'], async: true })` for partial reloads, `router.get/post/put/delete(url, data, options)`.
- **Types**: server-generated data types at `#generated/*` (via ace codegen); client-side aliases `@generated/*` (`.adonisjs/client/*`) and `~/*` (relative to the app tsconfig root).

## Repo refs

- Client entry + providers: `apps/web/app/core/ui/app/app.tsx`.
- SSR entry (may share providers): `apps/web/app/core/ui/app/ssr.tsx`.
- Tuyau client + `urlFor`: `apps/web/app/core/ui/app/client.ts`.
- Shared props: `apps/web/app/core/middleware/inertia_middleware.ts` (`share()` method).
- Access shared props on the client: `apps/web/app/common/ui/hooks/use_page_props.tsx`.
- Page index hook (registers all pages for the resolver): `apps/web/app/core/hooks/index_pages_hook.ts`.
- Selective SSR config: `apps/web/config/inertia.ts` + `apps/web/config/ssr.ts` (`isSSREnableForPage`).
- Root Edge shell: `apps/web/resources/views/inertia_layout.edge`.
- Modal controller helper: `apps/web/app/core/inertia/modal.ts`.
- Modal component wrapper: `apps/web/app/common/ui/components/app_modal.tsx`.
- Form + context wrapper: `apps/web/app/common/ui/components/form.tsx`.
- Field + FieldError primitives: `apps/web/app/common/ui/components/{field,field_error}.tsx`.
- Canonical form page (useForm + urlFor + modal + i18n): `apps/web/app/users/ui/pages/create.tsx`.
- Canonical list page: `apps/web/app/users/ui/pages/index.tsx`.
- Landing page (marketing shell): `apps/web/app/marketing/ui/pages/show.tsx`.

## Doc refs

- AdonisJS Inertia — https://docs.adonisjs.com/guides/views-and-templates/inertia
- Inertia.js React — https://inertiajs.com/client-side-setup
- `useForm` — https://inertiajs.com/forms
- Tuyau (route-safe URLs) — https://tuyau.julr.dev/docs

## Workflow

### Add a page

1. **Route + controller method** — see [[crud]] for the full CRUD flow. For a one-off page: `router.get('/dashboard', [DashboardController, 'show']).use(middleware.auth()).as('dashboard.show')`.
2. **Controller** returns `inertia.render('<mod>/<page>', { props })`. Props must be JSON-serializable — transform models with a Transformer first (see [[crud]]).
3. **Page file** at `app/<mod>/ui/pages/<page>.tsx`. Import your shell ([[layout-shells]]):
   ```tsx
   import AuthenticatedLayout from '#common/ui/components/authenticated_layout'

   type PageProps = InertiaProps<{ profile: Data.Users.User.Variants['forProfile'] }>

   export default function DashboardPage({ profile }: PageProps) {
     return (
       <AuthenticatedLayout breadcrumbs={[{ label: 'Dashboard' }]}>
         {/* body */}
       </AuthenticatedLayout>
     )
   }
   ```

### Read shared props

```tsx
import usePageProps from '#common/ui/hooks/use_page_props'

const { user, csrf, unseenNotifications } = usePageProps<{
  user?: Data.Users.User.Variants['forSharedProps']
  csrf?: string
  unseenNotifications?: number
}>()
```

Prefer typed access via `usePageProps<T>()`. For anonymous access to the raw page object, `import { usePage } from '@inertiajs/react'`.

### Write a form

Two patterns, both in the repo:

**A) `useForm` + manual submit** (`users/ui/pages/create.tsx`) — most flexible, works well inside modals:

```tsx
const { data, setData, errors, post, processing, reset } = useForm({ fullName: '', ... })

<form
  onSubmit={(e) => {
    e.preventDefault()
    post(urlFor('users.store'), {
      preserveScroll: true,
      onSuccess: () => { close(); toast('Saved') },
      onFinish: () => reset('password', 'passwordConfirmation'),
    })
  }}
>
  <Field name="fullName" label="Full name" />
  {/* ... */}
</form>
```

**B) `<Form>` wrapper with context** (`#common/ui/components/form.tsx`) — when nested Field components want to read errors via context. Wraps `@adonisjs/inertia/react`'s Form and provides `FormErrorsContext`.

### Modals

Controller side:
```ts
public async create({ bouncer, inertia }: HttpContext) {
  await bouncer.with(EntityPolicy).authorize('create')
  return modal(inertia, 'entities/create', {}, { route: 'entities.index' })
}
```

Modal page:
```tsx
return (
  <AppModal maxWidth="md">
    {({ close }) => (
      <>
        {/* form + Save calls close() on success */}
      </>
    )}
  </AppModal>
)
```

The `{ route: 'entities.index' }` backdrop tells the modal system what to render underneath.

### Partial reload

To refresh just some shared props without navigating:

```ts
router.reload({ only: ['unseenNotifications'], async: true })
```

Great for badges that mutate independently.

## Anti-patterns

- ❌ Hardcoding URLs (`/users/${id}`) — use `urlFor('users.edit', { id })`.
- ❌ Sending Lucid models to `inertia.render(...)` — always run through a Transformer variant.
- ❌ Adding page-only providers at the page level — providers belong in `app.tsx` at the root.
- ❌ Sharing per-page data via the middleware's `share()` — use per-request props from the controller.
- ❌ Using `<a href>` for internal navigation — use `<Link>` from `@adonisjs/inertia/react` or `router.visit`.
- ❌ Forgetting `preserveScroll: true` when a form submit stays on the same page — the browser scrolls to top otherwise.
- ❌ Reading `page.props` untyped — use `usePageProps<T>()`.

## Related skills

[[crud]] · [[layout-shells]] · [[i18n]] · [[actions-events]] · [[testing]]
