---
name: queries
description: 'Read-only query patterns in an AdonisJS + Inertia app — two flavors. **List queries** for CRUD tables (Lucid paginator with search + filter + sort). **Read models** for aggregate screens (dashboards, reports) with one query per business concept composed by the controller. Types live in the query file and cross to the frontend via `import type`. Trigger on: "query", "list users", "dashboard data", "read model", "fetch data", "aggregate", "read side".'
license: MIT
allowed-tools: Read, Edit, Write, Bash, Grep, Glob
---

# Queries

Reads live in `app/<mod>/queries/` — never `services/` (services are for behavior with side effects). Two flavors: **list queries** for paginated CRUD lists (Lucid + `ModelPaginatorContract`), and **read models** for aggregate screens where a controller composes several per-concept queries. Split by **business concept**, not by widget and not per screen. Types are defined inside the query file; the frontend consumes them via `import type`, so there is no duplication and no separate `types/` file.

## Rules

- **Location**: `app/<mod>/queries/<verb>_<subject>.ts` — e.g., `list_users.ts`, `get_revenue_metrics.ts`.
- **Shape**: default-export a class with `async handle(input)`. `Input` is a plain `type` or `interface`. No `HttpContext`.
- **Return `type` (not `interface`)** when the shape flows through `inertia.render(...)`. Inertia's `InertiaProps<T extends JSONDataTypes>` requires an index signature that `interface` doesn't satisfy — the typecheck fails with `Type 'X' is not assignable to type 'JSONDataTypes'`.
- **Composition happens in the controller**, not inside a query. If a screen needs three concepts, the controller does `Promise.all([...])`; each query stays pure and reusable.
- **One query per business concept** — not one per widget (fragmentation), not one per screen (couples the query to a specific UI).
- **Frontend consumes types via `import type`** from the query file. Type-only imports are stripped at build so the frontend never bundles server code.
- **Never return raw Lucid instances to Inertia** — for lists run through a Transformer variant ([[crud]]); for read models return a plain object shape.
- **Paginated queries always add an `id` tiebreaker at the end of `orderBy`** — without it, two rows sharing the sorted column can swap pages between requests.

## Two flavors

### 1. List queries — for CRUD list pages

Paginated Lucid queries with search, filter, sort. Input is `{ filters, pagination }`; return is `ModelPaginatorContract<Model>`. Consumed by a resource `index` action + Inertia list page.

### 2. Read models — for aggregate screens

Per-concept read models for dashboards, reports, homepage widgets. Input is just the scope (`{ period }`, `{ tenantId }`, `{ userId }`). Return is a plain object with KPIs / trends / lists needed for that concept. Controller composes multiple with `Promise.all([...])`.

## Doc refs

- Lucid pagination — https://lucid.adonisjs.com/docs/pagination
- CQRS reads (Martin Fowler) — https://martinfowler.com/bliki/CQRS.html
- Read models in CQRS — https://learn.microsoft.com/en-us/azure/architecture/patterns/cqrs

## Workflow

### Add a list query

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

### Add a read model

1. Identify the **business concept** the data belongs to (revenue, user, subscription, order). Not the widget.
2. Create `app/<mod>/queries/get_<concept>_metrics.ts`.
3. Define the return `type` (not `interface`):
   ```ts
   export type RevenueMetrics = {
     revenue: { value: number; change: number; trend: number[]; format: 'currency' }
     chart: number[]
   }
   ```
4. Class:
   ```ts
   export default class GetRevenueMetrics {
     async handle({ period }: { period: Period }): Promise<RevenueMetrics> { /* ... */ }
   }
   ```
5. Controller composes:
   ```ts
   const [revenue, users, subscriptions] = await Promise.all([
     new GetRevenueMetrics().handle({ period }),
     new GetUserMetrics().handle({ period }),
     new GetSubscriptionMetrics().handle({ period }),
   ])
   return inertia.render('analytics/dashboard', { period, revenue, users, subscriptions })
   ```
6. Page consumes types via `import type`:
   ```ts
   import type { RevenueMetrics } from '#<mod>/queries/get_revenue_metrics'
   type PageProps = InertiaProps<{ period: Period; revenue: RevenueMetrics /* ... */ }>
   ```

### Testing

Unit-test the query directly (`await new ListInvoices().handle({...})`) with a factory-seeded DB inside `wrapInGlobalTransaction`. See [[testing]].

## Anti-patterns

- ❌ One megaquery returning everything a screen needs — couples the read to a specific UI, not reusable when the same concept appears elsewhere.
- ❌ One query per widget — fragmentation. The controller becomes a 6-item `Promise.all` with barely any logic per query.
- ❌ Using `interface` for a return type that flows through Inertia — fails the `JSONDataTypes` typecheck. Use `type`.
- ❌ Putting reads in `services/` — services are for behavior with side effects. Reads go in `queries/`.
- ❌ Duplicating the return type in the page file — use `import type` from the query. TypeScript strips it at build.
- ❌ Screen-shaped assembly inside a query (a `get_dashboard_kpis` returning a dashboard blob) — assembly happens in the controller.
- ❌ Returning raw Lucid instances to Inertia — use a Transformer variant for CRUD lists ([[crud]]), or a plain object shape for read models.
- ❌ Paginating without an `id` tiebreaker — rows tied on the sorted column can swap between pages.

## Related skills

[[crud]] · [[inertia]] · [[actions-events]] · [[testing]] · [[authorization]]
