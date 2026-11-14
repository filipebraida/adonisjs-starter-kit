# Shared props

Props every Inertia page receives without the controller passing them in `inertia.render`. Single source of truth: `share()` in `app/core/middleware/inertia_middleware.ts`. Use it only for values almost every page needs (signed-in user, locale, CSRF token, `authz`, unseen notification count); per-page data goes in the controller's `inertia.render(...)`.

To see what is available today, read `share()` — this file documents how to consume and extend it, not the inventory.

## Reading on a page

### `InertiaProps<T>` (preferred)

```tsx
import type { InertiaProps } from '#core/ui/app/types'

type PageProps = InertiaProps<{ foo: string }>

export default function Page({ user, locale, foo }: PageProps) {
  // shared props are typed from share(), next to the page's own
}
```

`InertiaProps` merges `Data.SharedProps` (generated from `share()`) with `T`.

### In child components, without prop drilling

```tsx
import { usePage } from '@inertiajs/react'

const { user, unseenNotifications } = usePage().props
```

`usePage().props` is typed from `share()` (`app/core/ui/app/types.ts` declares `sharedPageProps` for `@inertiajs/core`). `usePageProps<T>()` (`#core/ui/hooks/use_page_props`) casts to an explicit `T` when you need one. Capabilities come through `useCan` / `useAllows`, not by reading `authz` by hand.

### Flash messages

Flash is a top-level field (a sibling of `props`), returned by the middleware's `flash()` method and read with `usePage().flash`:

```ts
// controller or exception handler
session.flash('error', i18n.t('errors.E_AUTHORIZATION_FAILURE'))
return response.redirect().back()
```

```tsx
const { error } = usePage().flash
```

The logged-in shells call `useFlashToasts()` (`#core/ui/hooks/use_flash_toasts`), which toasts `flash.error` / `flash.success` on every page. A pre-login form reads `usePage().flash.error` and shows it as a root `<FieldError errors={...} />`. Flash the translated text, not a key: the toast prints it as is.

## Adding a shared prop

1. Add the key in `share()`:

   ```ts
   return {
     // ...existing
     myNewProp: ctx.inertia.always(computeSomething(ctx)),
   }
   ```

2. **No manual type.** The `declare module '@adonisjs/inertia/types'` block at the bottom of the middleware uses `InferSharedProps<InertiaMiddleware>`; `pnpm ace codegen` (or the dev server) regenerates `Data.SharedProps`.

3. Consume it via `InertiaProps` or `usePage().props`.

## `always` vs `optional` in shared props

- **`always(...)`**: recomputed on every request, **including partial reloads**. For cheap data every page needs.
- **`optional(...)`**: only when the client asks with `only: ['x']`. For expensive data few pages need.

## Gotchas

- `share()` may run **before** the auth/session middleware (e.g. a 404). Destructure `auth` / `session` from `ctx as Partial<HttpContext>`, as the file already does.
- Every shared prop runs on **every** Inertia render. Expensive and rarely used → the controller, or `optional`.
- Don't read shared props at module top level (outside React components) — it breaks SSR.
- A shared prop with a Lucid model is a leak: go through a transformer variant (`UserTransformer.transform(user).useVariant('forSharedProps')`).

## Official docs

https://inertiajs.com/docs/v3/data-props/shared-data
