# Read models — aggregate screens

Per-concept read models for dashboards, reports, and homepage widgets. Input is just the scope (`{ period }`, `{ tenantId }`, `{ userId }`). Return is a plain object with the KPIs / trends / lists for that one concept. The controller composes several with `Promise.all([...])`.

## Rules

- **One query per business concept** — not one per widget (fragmentation), not one per screen (couples the query to a specific UI).
- **Composition happens in the controller**, not inside a query. If a screen needs three concepts, the controller does `Promise.all([...])`; each query stays pure and reusable.
- **Return `type` (not `interface`)** — the plain object flows through `inertia.render(...)`, and Inertia's `InertiaProps<T extends JSONDataTypes>` requires an index signature that `interface` doesn't satisfy (typecheck fails with `Type 'X' is not assignable to type 'JSONDataTypes'`).

## Workflow

1. Identify the **business concept** the data belongs to (revenue, user, subscription, order) — not the widget.
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

## Anti-patterns

- ❌ One megaquery returning everything a screen needs — couples the read to a specific UI, not reusable when the same concept appears elsewhere.
- ❌ One query per widget — fragmentation. The controller becomes a 6-item `Promise.all` with barely any logic per query.
- ❌ Using `interface` for a return type that flows through Inertia — fails the `JSONDataTypes` typecheck. Use `type`.
- ❌ Screen-shaped assembly inside a query (a `get_dashboard_kpis` returning a dashboard blob) — assembly happens in the controller.
- ❌ Returning raw Lucid instances to Inertia — return a plain object shape.
