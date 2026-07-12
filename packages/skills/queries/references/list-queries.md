# List queries — paginated CRUD tables

Paginated Lucid queries with search, filter, and sort. Input is `{ filters, pagination }`; return is `ModelPaginatorContract<Model>`. Consumed by a resource `index` action + Inertia list page.

Canonical: `app/users/queries/list_users.ts`, consumed by `app/users/controllers/users_controller.ts`.

## Rule

- **Add an `id` tiebreaker at the end of `orderBy`** — without it, two rows sharing the sorted column can swap pages between requests.

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
       if (filters.q) query.where('reference', 'ilike', `%${filters.q}%`)
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
- ❌ Returning raw Lucid instances to Inertia — run the list through a Transformer variant ([[crud]]).
