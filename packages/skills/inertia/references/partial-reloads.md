# Partial reloads, deferred, merge — recipes

Ways to avoid computing expensive props on every request.

## 1. `inertia.optional` — only when asked

The prop isn't computed unless the client does a partial reload with `only: [...]`.

```ts
return inertia.render('<mod>/index', {
  entities: EntityTransformer.paginate(rows.all(), rows.getMeta()).useVariant('forList'),
  // Only runs on router.reload({ only: ['owners'] })
  owners: inertia.optional(async () =>
    UserTransformer.transform(await User.all()).useVariant('forList')
  ),
})
```

Typical use: a combobox that loads its options on demand.

## 2. `inertia.defer` — render the page, load later

Inertia mounts the page without the data, fires a background request, and merges the result in.

```ts
return inertia.render('<mod>/<page>', {
  light: baseLight, // renders immediately
  heavy: inertia.defer(() => computeHeavy()), // loads in the background
  other: inertia.defer(() => computeOther(), 'side-panel'), // same group → one request
})
```

On the React side the prop starts as `undefined`:

```tsx
type PageProps = InertiaProps<{ light: Light; heavy?: Heavy }>

function Page({ heavy }: PageProps) {
  if (!heavy) return <Skeleton />
  return <HeavyPanel data={heavy} />
}
```

## 3. `inertia.merge` — accumulate instead of replace

Infinite pagination and growing lists:

```ts
return inertia.render('<mod>/feed', {
  posts: inertia.merge(await loadPage(page)),
})
```

Each `router.reload({ only: ['posts'] })` concatenates instead of overwriting. Combine with `defer` as `inertia.defer(() => loadPage(page)).merge()`; `.deepMerge()` for nested objects.

## 4. `inertia.always` — immune to partial reload

```ts
unseenNotifications: ctx.inertia.always(unseenNotifications)
```

Every shared prop in `app/core/middleware/inertia_middleware.ts` uses it (`errors`, `user`, `locale`, `csrf`, `authz`, `unseenNotifications`).

## Gotchas

- `only` / `except` **only work** on visits to the same page; navigation between pages ignores them.
- On a partial reload, `always` props are recomputed — the middleware's cost is paid every time. Keep `share()` cheap.
- `defer` **does not reach the first HTML** of an SSR page (`config/ssr.ts`): the follow-up request happens on the client. Use synchronous data on SSR pages.
- For list filters, `router.reload({ only: ['list'], replace: true, preserveScroll: true })` is lighter than a full visit — but it does not change the URL (see [router.md](router.md)).
- The notification bell refreshes its badge with `router.reload({ only: ['unseenNotifications'], async: true })` (`app/core/ui/components/notification_bell.tsx`).

## Official docs

- Partial reloads: https://inertiajs.com/docs/v3/data-props/partial-reloads
- Deferred props: https://inertiajs.com/docs/v3/data-props/deferred-props
- Merging props: https://inertiajs.com/docs/v3/data-props/merging-props
- Load when visible: https://inertiajs.com/docs/v3/data-props/load-when-visible
