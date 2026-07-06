---
name: module-scaffolding
description: 'How to add a new bounded-context module to an AdonisJS + Inertia app when there is no autoloader. Aliases, preloads, migration paths and event mounts are wired explicitly — miss one and the module silently disappears. Trigger on: "create new module", "add module X", "bootstrap module", "scaffold module".'
license: MIT
allowed-tools: Read, Edit, Write, Bash, Grep, Glob
---

# Module scaffolding

A module is a self-contained bounded context under `app/<mod>/`: controllers, actions, queries, models, policies, transformers, migrations, translations, UI pages and tests all live together. Nothing is autoloaded. To make a new module visible, four wires get connected explicitly: the alias in `package.json`, the preload(s) in `adonisrc.ts`, the migration/seeder paths in `config/database.ts`, and (if the module has UI strings) the language JSONs.

## Rules

- Module tree — create only the pieces the module actually needs. `routes.ts` is the only mandatory file.
  ```
  app/<mod>/
    actions/            # single-purpose classes with .handle(input)
    controllers/        # thin: validate → policy → action → render/redirect
    queries/            # read-only Lucid query classes
    policies/           # BasePolicy subclasses, one per resource
    models/, mixins/, services/, exceptions/, enums/
    transformers/       # BaseTransformer with per-page variants
    validators/         # one file per entity — validators/users.ts, validators/tokens.ts
    database/{factories,migrations,seeders}/
    resources/lang/     # i18n JSON, one file per locale
    ui/                 # Inertia pages + React components
    notifications/      # Notification classes (if the module emits)
    start/{events,view}.ts
    routes.ts           # required
    tests/{unit,functional}/
  ```
- **Alias** in `package.json` → `"imports"`: `"#<mod>/*": "./app/<mod>/*.js"`.
- **Preload** in `adonisrc.ts` → `preloads`: always `() => import('#<mod>/routes')`. Add `() => import('#<mod>/start/events')` when the module emits or listens; add `() => import('#<mod>/start/view')` when it registers edge components.
- **Migration path** in `config/database.ts` → `connections.<db>.migrations.paths`. Same for `seeders.paths` when the module ships seeders.
- **Locale files**: if the module has UI strings, create one JSON per supported locale under `resources/lang/<locale>/<mod>.json`. All locales must exist — see [[i18n]].
- **Uninstall order** mirrors install order in reverse: preload → alias → migration path → dir. Leaving stale wiring gives boot errors on the next start.

## Workflow

### Bootstrap a new module `<mod>`

1. Create the dir tree. Skip subdirs you won't use. Only `routes.ts` is required.
2. Add the alias to `package.json` (`"#<mod>/*": "./app/<mod>/*.js"`).
3. Register preload(s) in `adonisrc.ts` — always `routes`; add `start/events` and/or `start/view` when applicable.
4. If the module has migrations, append its path to `config/database.ts` migrations paths.
5. If it has seeders, append its path to `seeders.paths`.
6. If it has UI strings, create one JSON per locale under `resources/lang/<locale>/<mod>.json` — see [[i18n]].
7. Fill in the module: CRUD stack via [[crud]], route shape via [[routes]], read side via [[queries]], side effects via [[actions-events]].
8. Run `pnpm typecheck` before writing more code — alias/preload wiring is verified at that point.
9. If tables were added, run `pnpm ace migration:run` (or `migration:fresh` on a scratch DB) — see [[migrations]].

### Add a route to an existing module

Edit the module's `routes.ts`. `router.get/post/...` calls are picked up automatically because the file is already preloaded.

### Delete a module cleanly

Reverse the wiring in this order: preload → alias → migration path → dir. Skipping any of the first three leaves phantom imports that fail at boot.

## Anti-patterns

- ❌ Assuming an autoloader — everything is explicit. If it's not in the alias + preload, it doesn't exist.
- ❌ Adding migrations without appending the path to `config/database.ts` — the migrations won't run and no error surfaces until a query fails.
- ❌ Overlapping aliases (`#user/*` next to `#users/*`) — pick one shape, don't create ambiguity.
- ❌ Copying an existing module and forgetting to rewrite the internal `#<mod>/*` imports — copies still point at the source module.
- ❌ Creating `routes.ts` without preloading it — the routes silently disappear.
- ❌ Adding a locale JSON but leaving keys missing in the others — runtime falls back silently to the primary locale.

## Related skills

[[routes]] · [[crud]] · [[actions-events]] · [[queries]] · [[testing]] · [[migrations]] · [[i18n]] · [[inertia]]
