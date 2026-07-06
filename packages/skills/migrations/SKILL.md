---
name: migrations
description: 'Lucid migrations in this starter kit. Convention here is **edit the existing `create_<table>_table.ts` migration + run `migration:fresh`**, not layering `alter_table` migrations on top — this is a starter kit, no production data. Migration paths are declared per module in `config/database.ts`. `app/core/database/schema.ts` is auto-generated but **committed** (models import from it, so ace cannot boot without it). Use when adding a column, adjusting an index, bootstrapping a new module''s DB, or debugging migration issues. Trigger on: "add column", "migration", "alter table", "create table", "schema".'
license: MIT
allowed-tools: Read, Edit, Write, Bash, Grep, Glob
---

# Migrations

Standard Lucid migrations — `BaseSchema` subclasses in `app/<mod>/database/migrations/<ts>_<name>.ts` with `up()` and `down()`. Three things are specific to this starter kit:

1. **Assumes no production data**. When adding a column to an existing table, **edit the existing `create_<table>_table.ts` migration** and run `pnpm ace migration:fresh` instead of layering an `alter_table` migration on top. The goal is that every downstream project inherits a clean single migration per table, not a create-then-alter chain.
2. **Migration paths are explicit per module** in `apps/web/config/database.ts` → `connections.postgres.migrations.paths`. There is no autoloader. Add the module's path when it first gets a migration ([[module-scaffolding]]).
3. **`apps/web/app/core/database/schema.ts` is auto-generated but committed** — models import their schemas from it, so `ace` cannot boot on a fresh checkout without the file. Regenerated on `migration:run` / `fresh`; commit the diff alongside the migration change. Framework-owned — never hand-edit or lint it.

## Rules

- **Location**: `app/<mod>/database/migrations/<unix-ms-timestamp>_<name>.ts`. Filename shape mirrors `ace make:migration` output.
- **`up()` builds the table** using `this.schema.createTable(...)` with knex-style builders. Include `id` primary first, business columns next, `created_at` (not null) and `updated_at` (nullable) at the bottom, plus any indexes.
- **`down()` drops the table** with `this.schema.dropTable(this.tableName)`.
- **Edit-in-place for schema evolution** — the starter-kit rule. Add the column to `create_<table>_table.ts`, then `pnpm ace migration:fresh` to rebuild. Downstream projects that have production data adopt a stricter policy (alter-in-place chains, tools like `pg_dump` for reversibility).
- **`migration:fresh` is destructive** — drops every table, re-runs every migration. Never on shared / production DB.
- **`migration:run` is additive** — only runs migrations that haven't been applied. Use for adding net-new migrations without dropping data.
- **Migration paths**: append `'app/<mod>/database/migrations'` to `apps/web/config/database.ts` when the module first gets a migration. Same for seeder paths (`seeders.paths`).
- **Postgres types**: `text` for strings without hard limits, `jsonb` for JSON payloads (not `json` — `jsonb` is queryable and indexable), `timestamp` for datetimes.
- **Indexes**: declare with `table.index([...])` in the same migration. For lookup columns (`user_id`, `tenant_id`, `notifiable_id`), always add.
- **`schema.ts` is regenerated** on every `migration:run` / `migration:fresh` — commit the diff alongside the migration change. Framework-owned; don't hand-edit or lint it.

## Repo refs

- Migration paths registration: `apps/web/config/database.ts` (`connections.postgres.migrations.paths`).
- Canonical create migration (folded pattern — `locale` column was merged into the original users create): `apps/web/app/users/database/migrations/1737139066942_create_users_table.ts`.
- Notifications migration (fresh module scaffold): `apps/web/app/notifications/database/migrations/1783197502000_create_notifications_table.ts`.
- Second migration for related table: `apps/web/app/notifications/database/migrations/1783197502001_create_notification_preferences_table.ts`.
- Committed schema output: `apps/web/app/core/database/schema.ts` (auto-generated on `migration:*`; commit alongside the migration).
- Downstream memory of the convention: `feedback_starter_kit_migrations.md` (agent memory — same rule).

## Doc refs

- Lucid migrations — https://lucid.adonisjs.com/docs/migrations
- Knex schema builder (Lucid uses knex under the hood) — https://knexjs.org/guide/schema-builder.html
- AdonisJS ace `migration:*` commands — https://lucid.adonisjs.com/docs/migrations#running-migrations

## Workflow

### Add a column to an existing table (starter kit rule)

1. Open `app/<mod>/database/migrations/<ts>_create_<table>_table.ts`.
2. Insert the `table.<type>('column_name').nullable()` line in the appropriate section.
3. Run `pnpm ace migration:fresh`. This drops everything and re-applies. Seeders (if any) run automatically.
4. Update the model to declare the new column.
5. Commit the regenerated `app/core/database/schema.ts` alongside the migration.

### Add a wholly new table

1. Create `app/<mod>/database/migrations/<ts>_create_<name>_table.ts` following the shape:
   ```ts
   import { BaseSchema } from '@adonisjs/lucid/schema'

   export default class extends BaseSchema {
     protected tableName = 'invoices'
     async up() {
       this.schema.createTable(this.tableName, (table) => {
         table.increments('id').primary()
         table.integer('user_id').notNullable().index()
         table.integer('amount_cents').notNullable()
         table.text('currency').notNullable()
         table.timestamp('created_at').notNullable()
         table.timestamp('updated_at').nullable()
       })
     }
     async down() { this.schema.dropTable(this.tableName) }
   }
   ```
2. Append the module's migration path to `config/database.ts` if this is the module's first migration.
3. `pnpm ace migration:run` (additive) if you don't want to wipe existing data, or `migration:fresh` if it's a fresh start.

### Rebuild the local DB from scratch

```bash
pnpm ace migration:fresh
```

Drops all tables, re-runs every migration. Regenerates `app/core/database/schema.ts` — commit the diff alongside the migration change.

### Check migration status

```bash
pnpm ace migration:status
```

Lists every migration file and whether it's applied.

## Anti-patterns

- ❌ Layering `alter_table` migrations on top of a `create_<table>` migration you own — this is a starter kit; fold in-place.
- ❌ Running `migration:fresh` against a shared / production DB — destroys everything.
- ❌ Adding a migration and forgetting to register its module's path in `config/database.ts` — the migration file is invisible.
- ❌ Storing arbitrary JSON in a `json` column instead of `jsonb` — jsonb is queryable and indexable.
- ❌ Skipping indexes on lookup columns (`user_id`, `notifiable_id`, etc.) — expensive at scale.
- ❌ Using `id` as a string / uuid on new tables without a reason — the repo convention is `table.increments('id').primary()`.

## Related skills

[[module-scaffolding]] · [[crud]] · [[testing]]
