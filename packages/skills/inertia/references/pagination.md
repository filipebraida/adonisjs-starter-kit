# Pagination

Canonical format in this kit — **always** `Transformer.paginate(rows, meta).useVariant('forList')` in the controller. Never return the raw Lucid paginator (snake_case fields, a different shape, untyped on the client).

## Controller

```ts
async index({ bouncer, inertia, request }: HttpContext) {
  await bouncer.with(EntityPolicy).authorize('viewList')
  const payload = await request.validateUsing(listEntityValidator)

  const rows = await new ListEntities().handle(
    { q: payload.q },
    { page: payload.page ?? 1, perPage: payload.perPage ?? 10 }
  )

  return inertia.render('<mod>/index', {
    entities: EntityTransformer.paginate(rows.all(), rows.getMeta()).useVariant('forList'),
  })
}
```

`page` / `perPage` come from the shared search validator (`app/core/validators/search.ts`), which caps `perPage` (`MAX_PER_PAGE`) — a trivial DoS otherwise. The list query lives in `queries/` (see the `queries` skill). Canonical: `app/users/controllers/users_controller.ts`.

## Client shape

`paginate(...)` serializes to `{ data, metadata }`:

```ts
type PageProps = InertiaProps<{
  entities: {
    data: Data.<Mod>.Entity.Variants['forList'][]
    metadata: {
      total: number
      perPage: number
      currentPage: number
      lastPage: number
      firstPage: number
      firstPageUrl?: string
      lastPageUrl?: string
      nextPageUrl?: string | null
      previousPageUrl?: string | null
    }
  }
}>
```

`InertiaProps` comes from `#core/ui/app/types`, `Data` from `@generated/data`. See `app/users/ui/pages/index.tsx`. If the metadata type shows up in a second page, extract it next to `InertiaProps` instead of copying it.

## Page-to-page navigation

`urlFor(name, params, { qs })` + `<Link href>` (or `router.get`):

```tsx
import { Link } from '@adonisjs/inertia/react'

import { urlFor } from '~/app/client'

const { currentPage, lastPage } = entities.metadata

<nav>
  {currentPage > 1 && (
    <Link href={urlFor('<mod>.index', {}, { qs: { page: currentPage - 1 } })} preserveScroll>
      {t('core.table.pagination.go_previous_page')}
    </Link>
  )}
  {currentPage < lastPage && (
    <Link href={urlFor('<mod>.index', {}, { qs: { page: currentPage + 1 } })} preserveScroll>
      {t('core.table.pagination.go_next_page')}
    </Link>
  )}
</nav>
```

## Combining with filters

When the URL has other params (search, sort, filters), **all** of them go into the visit alongside `page`:

```ts
function goToPage(page: number) {
  router.get(
    urlFor('<mod>.index'),
    { ...currentFilters, page },
    { preserveScroll: true, preserveState: true, replace: true }
  )
}
```

When a **filter** changes, reset `page` to `1` — otherwise the user lands on a page that may not exist in the new result. Real example: `app/users/ui/components/users_table_filters.tsx`.

## Infinite scroll

`inertia.merge` on the server + `router.reload({ only })` on the client. `merge` concatenates arrays and replaces objects, so keep the rows and the metadata in separate props:

```ts
return inertia.render('<mod>/index', {
  entities: inertia.merge(EntityTransformer.transform(rows.all()).useVariant('forList')),
  entitiesMeta: rows.getMeta(),
})
```

```tsx
function loadMore() {
  router.reload({
    only: ['entities', 'entitiesMeta'],
    data: { page: entitiesMeta.currentPage + 1 },
    preserveScroll: true,
    preserveState: true,
  })
}
```

Docs: https://inertiajs.com/docs/v3/data-props/infinite-scroll and [partial-reloads.md](partial-reloads.md).

## Gotchas

- `router.reload({ only: [...] })` **does not change the URL** — for back button and shareable links, use `router.get(url, params)`.
- Pagination labels are i18n keys like any UI text.
