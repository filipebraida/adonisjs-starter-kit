---
name: queries
description: 'Read-only query patterns in an AdonisJS + Inertia app — two flavors. **List queries** for CRUD tables (Lucid paginator with search + filter + sort). **Read models** for aggregate screens (dashboards, reports) with one query per business concept composed by the controller. Types live in the query file and cross to the frontend via `import type`. Trigger on: "query", "list users", "dashboard data", "read model", "fetch data", "aggregate", "read side".'
license: MIT
allowed-tools: Read, Edit, Write, Bash, Grep, Glob
---

# Queries

Reads live in `app/<mod>/queries/` — never `services/` (those are for behavior with side effects). Types are defined inside the query file; the frontend consumes them via `import type`, so there is no duplication and no separate `types/` file.

## Two flavors — pick one, then open its reference

The two shapes never coexist in one task. Choose by what you're building:

- **List query** — a paginated CRUD table (search / filter / sort), returning `ModelPaginatorContract<Model>` for a resource `index`. → read `references/list-queries.md`.
- **Read model** — an aggregate screen (dashboard, report): one query per business concept, composed by the controller with `Promise.all([...])`. → read `references/read-models.md`.

## Rules (both flavors)

- **Location**: `app/<mod>/queries/<verb>_<subject>.ts` — e.g., `list_users.ts`, `get_revenue_metrics.ts`.
- **Shape**: default-export a class with `async handle(input)`. `Input` is a plain `type` or `interface`. No `HttpContext`.
- **Split by business concept** — not by widget (fragmentation) and not per screen (couples the query to a UI).
- **Frontend consumes types via `import type`** from the query file. Type-only imports are stripped at build, so the frontend never bundles server code.
- **Never return raw Lucid instances to Inertia** — lists run through a Transformer variant ([[crud]]); read models return a plain object shape.

## Doc refs

- Lucid pagination — https://lucid.adonisjs.com/docs/pagination
- CQRS reads (Martin Fowler) — https://martinfowler.com/bliki/CQRS.html
- Read models in CQRS — https://learn.microsoft.com/en-us/azure/architecture/patterns/cqrs

## Testing

Unit-test the query directly (`await new ListInvoices().handle({...})`) with a factory-seeded DB inside `wrapInGlobalTransaction`. See [[testing]].

## Related skills

[[crud]] · [[inertia]] · [[actions-events]] · [[testing]] · [[authorization]]
