---
name: migrations
description: 'Lucid migrations in this starter kit. Convention here is **edit the existing `create_<table>_table.ts` migration + run `migration:fresh`**, not layering `alter_table` migrations on top — this is a starter kit, no production data. Migration paths are declared per module in `config/database.ts`. `database/schema.ts` is auto-generated and gitignored. Use when adding a column, adjusting an index, bootstrapping a new module''s DB, or debugging migration issues. Trigger on: "add column", "migration", "alter table", "create table", "schema".'
license: MIT
allowed-tools: Read, Edit, Write, Bash, Grep, Glob
---

# Migrations

Standard Lucid migrations — `BaseSchema` subclasses in `app/<mod>/database/migrations/<ts>_<name>.ts` with `up()` and `down()`. What's specific to this repo:

1. **This is a starter kit — no production data**. When adding a column to an existing table, **edit the existing `create_<table>_table.ts` migration** and run `pnpm ace migration:fresh` instead of layering an `alter_table` migration on top. The goal is that every downstream project starts from a clean single migration per table, not a create-then-alter chain.
2. **Migration paths are explicit per module** in `apps/web/config/database.ts` → `connections.postgres.migrations.paths`. There is no autoloader. Add your module's path when you create the module ([[module-scaffolding]]).
3. **`apps/web/database/schema.ts` is auto-generated** by ace after `migration:run`/`fresh` and gitignored. Sometimes prettier disagrees with the freshly generated output — `pnpm --filter web exec eslint --fix database/schema.ts` fixes it.

## Conventions

- **Location**: `app/<mod>/database/migrations/<unix-ms-timestamp>_<name>.ts`. Filename shape mirrors what `ace make:migration` would produce.
- **`up()` builds the table** using `this.schema.createTable(...)` with knex-style builders. Always include `id` primary, business columns, then `created_at` (not null) and `updated_at` (nullable) at the bottom, plus any indexes.
- **`down()` drops the table** with `this.schema.dropTable(this.tableName)`.
- **Edit-in-place for schema evolution** (starter kit rule). Add the column to `create_<table>_table.ts`, then `pnpm ace migration:fresh` to rebuild. Downstream projects that have production data can adopt a stricter policy.
- **`migration:fresh` is destructive**: drops every table, re-runs every migration. Fine for the starter but never on a production DB.
- **`migration:run` is additive**: only runs migrations that haven't been applied. Use for adding *net-new* migrations without dropping existing data.
- **Migration paths**: append `'app/<mod>/database/migrations'` to `apps/web/config/database.ts` when the module first gets a migration. Same for seeder paths (`seeders.paths`).
- **Postgres types**: `text` for strings without hard limits, `jsonb` for JSON payloads (not `json` — jsonb is queryable and indexable), `timestamp` for datetimes.
- **Indexes**: declare with `table.index([...])` in the same migration. For lookup columns (`notifiable_id`, `tenant_id`, `user_id`), always add.
- **`schema.ts` is regenerated** on every `migration:run` / `migration:fresh`. If lint complains after regen, auto-fix and move on — it doesn't get committed.

## Repo refs

- Migration paths registration: `apps/web/config/database.ts` (`connections.postgres.migrations.paths`).
- Canonical create migration (folded pattern — `locale` column was merged into the original users create): `apps/web/app/users/database/migrations/1737139066942_create_users_table.ts`.
- Notifications migration (fresh module scaffold): `apps/web/app/notifications/database/migrations/1783197502000_create_notifications_table.ts`.
- Second migration for related table: `apps/web/app/notifications/database/migrations/1783197502001_create_notification_preferences_table.ts`.
- Gitignored schema output: `apps/web/database/schema.ts` (regenerated; ignored via `apps/web/.gitignore`).
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
5. If lint yells at `database/schema.ts`, run `pnpm --filter web exec eslint --fix database/schema.ts`.

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

Drops all tables, re-runs every migration. Regenerates `database/schema.ts` — auto-fix if needed:

```bash
pnpm --filter web exec eslint --fix database/schema.ts
```

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
- ❌ Committing `database/schema.ts` — it's gitignored on purpose.
- ❌ Using `id` as a string / uuid on new tables without a reason — the repo convention is `table.increments('id').primary()`.

## Related skills

[[module-scaffolding]] · [[crud]] · [[testing]]
