# Router, links and URLs

Two ways to navigate without a full reload:

- **`<Link>`** from `@adonisjs/inertia/react` — declarative, for JSX links.
- **`router`** from `@inertiajs/react` — imperative, for navigating after a JS action.

For type-safe URLs (especially with query strings), use **`urlFor`** from the Tuyau client (`~/app/client`, i.e. `app/core/ui/app/client.ts`). Never a hand-written internal URL or an internal `<a href>` (the lint rejects both).

## `<Link>` — by route name

```tsx
import { Link } from '@adonisjs/inertia/react'

<Link route="auth.sign_in.show">{t('...')}</Link>

<Link route="users.edit" routeParams={{ id: user.id }}>
  {t('...')}
</Link>
```

- `route=` + `routeParams=` are **type-safe**: TS rejects unknown routes or missing params (registry in `.adonisjs/client/registry/`).
- Available names come from `.as(...)` in `app/*/routes.ts`.
- For query strings, use `urlFor` + `href` (below).

## `<Link>` with `href` + `urlFor`

```tsx
import { urlFor } from '~/app/client'

<Link href={urlFor('users.index', {}, { qs: { page: 2 } })}>{t('...')}</Link>
<Link href={urlFor('users.activity', {}, { qs: { actorId: row.original.id } })}>{t('...')}</Link>
```

Signature: `urlFor(routeName, params, { qs })`. `params` is required (empty object when the route has no dynamic segment) — don't confuse it with `qs`.

## Links with non-GET methods

```tsx
<Link route="<mod>.<action>" method="post" as="button">
  {t('...')}
</Link>
```

Always set `method="..."`; `as="button"` keeps it accessible ("open in new tab" makes no sense for a POST).

## `router` — programmatic navigation

```ts
import { router } from '@inertiajs/react'

router.visit(url, options) // base; accepts method
router.get(url, data, options)
router.post(url, data, options)
router.put(url, data, options)
router.patch(url, data, options)
router.delete(url, options)
router.reload(options) // revisit the current URL
router.replace(url, options) // replace in history
```

Use it when the navigation doesn't come from a click (custom submit, debounce, selection effect).

## Most-used options

| Option                                        | Effect                                 | When to use                                               |
| --------------------------------------------- | -------------------------------------- | --------------------------------------------------------- |
| `preserveScroll: true`                        | Don't scroll to top                    | Filters, pagination, submits that stay on the same page.  |
| `preserveState: true`                         | Keep state of surviving components     | Controlled inputs; avoids flicker.                        |
| `replace: true`                               | `history.replaceState` instead of push | Search filters (don't pollute the back button).           |
| `only: ['a','b']`                             | Partial reload                         | Only one slice changed; `always` shared props still come. |
| `except: ['heavy']`                           | Opposite of `only`                     | Rare — `only` is usually clearer.                         |
| `onProgress(event)`                           | Upload progress                        | Progress bar on submits with files.                       |
| `onStart`, `onSuccess`, `onError`, `onFinish` | Lifecycle hooks                        | Loaders, toasts, closing a modal.                         |
| `headers: {...}`                              | Custom headers                         | Rare; CSRF is already automatic.                          |

## Pattern — filters/search that update the URL

```ts
function applyFilters(params: Record<string, string | number | undefined>) {
  router.get(urlFor('users.index'), params, {
    preserveScroll: true,
    preserveState: true,
    replace: true,
  })
}
```

Real example: `app/users/ui/components/users_table_filters.tsx`.

## Partial reload vs full navigation

When only one slice of the page changes, `router.reload({ only: ['list'] })` avoids remounting the page — but it keeps the URL. Details in [partial-reloads.md](partial-reloads.md).

## Canceling a visit

```ts
router.visit(url, {
  onCancelToken: (cancelToken) => {
    /* keep it to cancel later */
  },
})
```

## Global events

```ts
useEffect(() => router.on('start', () => showLoader()), [])
```

`router.on` returns the unsubscribe; return it from `useEffect` or the listener leaks on HMR. Events: `start`, `progress`, `finish`, `before`, `cancel`, `success`, `error`, `invalid`, `exception`, `navigate`.

## Gotchas

- `href=` with an external absolute URL becomes a plain browser navigation — use a plain `<a target="_blank" rel="noreferrer">` for external links.
- `router.reload()` without `only` is a full request.
- `preserveState` doesn't preserve `useState` of a component that gets **remounted**.

## Official docs

- Manual visits: https://inertiajs.com/docs/v3/the-basics/manual-visits
- Links: https://inertiajs.com/docs/v3/the-basics/links
- Events: https://inertiajs.com/docs/v3/advanced/events
