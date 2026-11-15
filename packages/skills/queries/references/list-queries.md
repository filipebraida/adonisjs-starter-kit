# List queries — paginated CRUD tables

Paginated Lucid queries with search, filter, and sort. Input is `{ filters, pagination }`; return is `ModelPaginatorContract<Model>`. Consumed by a resource `index` action + Inertia list page.

Canonical: `app/users/queries/list_users.ts`, consumed by `app/users/controllers/users_controller.ts`.

## Rule

- **Add an `id` tiebreaker at the end of `orderBy`** — without it, two rows sharing the sorted column can swap pages between requests.
- **Escape the search term with `escapeLike`** (`#core/utils/escape_like`) before wrapping it in `%…%`: unescaped, a `%` or `_` the person types is a wildcard, so `a_b` also finds `a-b`.
- **The controller sends back the filters it applied**, `null` (or `[]`) when empty, next to the rows. The page reads them from there instead of keeping a copy, and a partial reload only replaces a prop that is present. The page side is in [[crud]] (step 9).

## Workflow

1. Create `app/<mod>/queries/list_<entities>.ts`.
2. Define input types:
   ```ts
   export interface ListInvoicesFilters {
     q?: string
     status?: InvoiceStatus[]
     sort?: InvoicesSortBy
     order?: SortDirection
   }
   export interface ListInvoicesPagination { page: number; perPage: number }
   ```
3. Class with `handle` returning the paginator:
   ```ts
   export default class ListInvoices {
     async handle(
       filters: ListInvoicesFilters = {},
       pag: ListInvoicesPagination = { page: 1, perPage: 10 }
     ) {
       const query = Invoice.query()
       if (filters.q) query.where('reference', 'ilike', `%${escapeLike(filters.q)}%`)
       if (filters.status?.length) query.whereIn('status', filters.status)
       query.orderBy(
         filters.sort ? SORT_COLUMN[filters.sort] : 'created_at',
         filters.order ?? 'desc'
       )
       query.orderBy('id', 'asc') // tiebreaker prevents page swaps
       return query.paginate(pag.page, pag.perPage)
     }
   }
   ```
4. Controller: `authorize → validate → call query → transformer variant → inertia.render`. See [[crud]].

## Anti-patterns

- ❌ Paginating without an `id` tiebreaker — rows tied on the sorted column can swap between pages.
- ❌ `ilike` with the raw term (`%${filters.q}%`) — `%` and `_` in the search act as wildcards; wrap `escapeLike(filters.q)`.
- ❌ Returning raw Lucid instances to Inertia — run the list through a Transformer variant ([[crud]]).
