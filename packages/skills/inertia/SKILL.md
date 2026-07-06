---
name: inertia
description: 'Inertia + React 19 patterns in an AdonisJS app. Pages resolve from module dirs (`app/<mod>/ui/pages/`), shared props flow from a middleware, forms use `useForm` + Tuyau `urlFor` for type-safe URLs, and modals go through a controller helper. Use when adding an Inertia page, writing a form, reading shared props, or wiring a route to a page component. Trigger on: "add page", "Inertia page", "add form", "useForm", "shared props", "modal", "urlFor".'
license: MIT
allowed-tools: Read, Edit, Write, Bash, Grep, Glob
---

# Inertia

Inertia is the bridge between AdonisJS routes and React pages: controllers call `inertia.render('<name>', { props })`, the client resolves that name to a `.tsx` file inside a module's `ui/pages/`. Shared props flow globally through an Inertia middleware. Forms use `@inertiajs/react`'s `useForm`; URLs come from Tuyau's `urlFor('route.name', params?)` for type safety. Modals are Inertia responses too — a controller helper renders one page over another. Every provider (theme, i18n, tooltip, Tuyau, modal stack) is wired at the root client entry.

## Rules

- **Page location**: `app/<mod>/ui/pages/<subpath>/<page>.tsx`. Controllers reference the page by the path minus `.tsx` and everything before `<mod>/`: `inertia.render('users/index')` → `app/users/ui/pages/index.tsx`, `inertia.render('users/create')` → `app/users/ui/pages/create.tsx`. First segment = module.
- **Shell import**: every page imports its layout shell explicitly ([[layout-shells]]). No runtime chooser.
- **Client entry** mounts the global provider tree — theme, i18n, tooltip, Tuyau, modal stack. Don't reorder without reason; theme + i18n need to be outermost so shells see them.
- **Shared props**: added by the Inertia middleware via `ctx.inertia.always(...)`. Available on the frontend via a typed `usePageProps<{...}>()` hook. Per-request data (page-specific) goes in the controller's `inertia.render(...)` call, not in the middleware.
- **Form**: default is `useForm(initial)` from `@inertiajs/react` + a plain `<form onSubmit>`. Call `post(urlFor('route.name'), { onSuccess, onFinish, preserveScroll })`. A local `<Form>` wrapper is provided that adds a `FormErrorsContext` so nested fields can pull errors from context — use it when the form is deep enough that field components want the errors without prop-drilling.
- **URLs**: never hardcode. Use `urlFor('route.name', { param: value })` from Tuyau. Route names come from `router.get(...).as('route.name')` in the module's `routes.ts`.
- **Modals**: controllers return the modal helper (`modal(inertia, 'page', props, { route: 'backdrop.route' })`). The modal page wraps content in the modal component and receives a `close` render prop.
- **Navigation between pages**: `router.visit(url)`; `router.reload({ only: ['propName'], async: true })` for partial reloads; `router.get/post/put/delete(url, data, options)` for programmatic form submits.
- **Types**: server-generated data types come from an ace codegen; the client alias makes them available across pages. Don't duplicate the type in the page — `import type` from the codegen path.

## Doc refs

- AdonisJS Inertia — https://docs.adonisjs.com/guides/views-and-templates/inertia
- Inertia.js React — https://inertiajs.com/client-side-setup
- `useForm` — https://inertiajs.com/forms
- Tuyau (route-safe URLs) — https://tuyau.julr.dev/docs

## Workflow

### Add a page

1. **Route + controller method** — see [[crud]] for the full CRUD flow, [[routes]] for the route shape. For a one-off page: `router.get('/dashboard', [DashboardController, 'show']).middleware(middleware.auth()).as('dashboard.show')`.
2. **Controller** returns `inertia.render('<mod>/<page>', { props })`. Props must be JSON-serializable — transform Lucid models with a Transformer variant (see [[crud]]).
3. **Page file** at `app/<mod>/ui/pages/<page>.tsx`. Import the shell ([[layout-shells]]):
   ```tsx
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
const { user, csrf, unseenNotifications } = usePageProps<{
  user?: Data.Users.User.Variants['forSharedProps']
  csrf?: string
  unseenNotifications?: number
}>()
```

Prefer typed access via `usePageProps<T>()`. For anonymous access to the raw page object, `import { usePage } from '@inertiajs/react'`.

### Write a form

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

For deep forms where nested `Field` components want errors via context instead of props, use the `<Form>` wrapper that adds `FormErrorsContext`.

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
      <>{/* form + Save calls close() on success */}</>
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

Good for badges and counters that mutate independently of the current page.

## Anti-patterns

- ❌ Hardcoding URLs (`/users/${id}`) — use `urlFor('users.edit', { id })`.
- ❌ Sending Lucid models to `inertia.render(...)` — always run through a Transformer variant. The shape leaks and the response type drifts.
- ❌ Adding page-only providers at the page level — providers belong at the root client entry.
- ❌ Sharing per-page data via the middleware's `share()` — that inflates every response. Per-request data goes in the controller's `inertia.render(...)`.
- ❌ Using `<a href>` for internal navigation — use `<Link>` from `@adonisjs/inertia/react` or `router.visit`.
- ❌ Forgetting `preserveScroll: true` when a form submit stays on the same page — the browser jumps back to the top otherwise.
- ❌ Reading `page.props` untyped — use `usePageProps<T>()`.
- ❌ Duplicating a query's return type in the page — `import type` from the query file (see [[queries]]).

## Related skills

[[routes]] · [[crud]] · [[queries]] · [[layout-shells]] · [[i18n]] · [[actions-events]] · [[testing]]
