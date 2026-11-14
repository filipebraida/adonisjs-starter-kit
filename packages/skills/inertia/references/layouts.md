# Layouts

Two possible patterns:

1. **Layout as a child component** (this kit's pattern) — the page imports its shell and uses it as a JSX wrapper. Which shell to pick: the `layout-shells` skill.
2. **Persistent layout** (native Inertia feature) — Inertia manages the layout instance and keeps it alive across navigations.

## 1. Layout as a child component (current pattern)

```tsx
// app/<mod>/ui/pages/<page>.tsx
import AdminLayout from '#core/ui/components/admin_layout'

export default function Page(props: PageProps) {
  return <AdminLayout breadcrumbs={[...]}>{/* ... */}</AdminLayout>
}
```

**Consequence:** on every Inertia navigation the shell is unmounted and remounted, so **its state is not preserved** across visits. For shells with no state that must survive navigation, this is the simpler, more explicit path.

## 2. Persistent layout — when to adopt

Only if something must stay alive across navigations:

- Preserved sidebar scroll.
- Audio/video player that shouldn't pause on navigation.
- An SSE connection that is expensive to reconnect.
- Global filter state (e.g., table density toggle).

If none of that applies, stick with pattern 1.

### How to declare

Attach `.layout` to the page component **before** the `export default`:

```tsx
function Page(props: PageProps) {
  return <h1>Content</h1>
}

Page.layout = AdminLayout

export default Page
```

- The resolver reads the default export.
- Inertia renders `<AdminLayout><Page /></AdminLayout>` and keeps the layout instance alive across navigations between pages that share it.
- Works in SSR.

The page still names its shell explicitly — this is not a runtime chooser.

### Nested (multiple layouts)

```tsx
Page.layout = [OuterLayout, InnerLayout]
// Renders: <OuterLayout><InnerLayout><Page /></InnerLayout></OuterLayout>
```

### Static layout props

```tsx
Page.layout = [AdminLayout, { breadcrumbs: [{ label: '...' }] }]
```

### Dynamic layout props (derived from the page)

```tsx
Page.layout = (pageProps) => [AdminLayout, { breadcrumbs: [{ label: pageProps.user?.fullName }] }]
```

The callback receives the page props, shared props included.

### Updating layout props from inside the page

```tsx
import { setLayoutProps } from '@inertiajs/react'

export default function Page() {
  setLayoutProps({ breadcrumbs: [{ label: '...' }] })
  return <h1>Content</h1>
}
```

Dynamic props are **reset on navigation** (unless `preserveState`). Priority: `setLayoutProps` > `.layout = [Comp, {...}]` > component defaults.

## Default layout via `createInertiaApp`

Inertia can apply a layout to every page that doesn't define one (wrap `App` in `setup`, or set `component.default.layout ??= ...` in `resolve` in `app/core/ui/app/app.tsx`). This kit does **not** do it on purpose: each page picks its shell explicitly (see `layout-shells`).

## Gotchas

- **SSR**: `ssr.tsx` wraps the tree with fewer providers than `app.tsx`. If a persistent layout depends on a provider, add it on the SSR side too or move that piece into `useEffect`.
- **TypeScript**: if `.layout` causes a type error, type the component as `{ layout?: ... }`. See https://inertiajs.com/docs/v3/advanced/typescript.
- Define `.layout` **before** `export default`.
- Only the layout persists; the page content still swaps.

## Official docs

https://inertiajs.com/docs/v3/the-basics/layouts
