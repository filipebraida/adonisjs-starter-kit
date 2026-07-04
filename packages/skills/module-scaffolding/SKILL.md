---
name: module-scaffolding
description: 'How to add a new module to this AdonisJS monorepo. No autoloader — preloads, aliases, migration paths, and (optionally) events + view mounts are explicit. Follow the step list to wire everything so the module can register routes, run migrations, and be imported via `#<mod>/*`. Trigger on: "create new module", "add module X", "bootstrap module", "scaffold module".'
license: MIT
allowed-tools: Read, Edit, Write, Bash, Grep, Glob
---

# Module scaffolding

Every feature lives under `app/<mod>/` as a self-contained module. There is no autoloader — preloads, import aliases, migration paths, and event listener mounts are all wired explicitly. That means a new module needs updates in three places: the module dir tree, `apps/web/package.json` (alias), and `apps/web/adonisrc.ts` (preload). Migrations/seeders also require `apps/web/config/database.ts`. Miss any of these and the module simply won't load or its rows won't migrate.

## Conventions

- **Existing modules**: `auth`, `users`, `marketing`, `analytics`, `common`, `core`, `notifications`.
- **Module dir tree** (create only the pieces you need — none are required):
  ```
  app/<mod>/
    actions/            # single-purpose class with .handle(input)
    controllers/        # thin: validate → action → redirect/render
    queries/            # read-only Lucid query classes
    policies/           # extend BasePolicy, one per resource
    models/, mixins/, services/, exceptions/, enums/
    transformers/
    validators.ts
    database/{factories,migrations,seeders}/
    resources/lang/     # i18n JSON, per module per locale
    ui/                 # Inertia pages + React components
    notifications/      # Notification classes (if the module emits)
    start/{events,view}.ts
    routes.ts
    tests/{unit,functional}/
  ```
- **Aliases go in** `apps/web/package.json` → `"imports"`. Add `"#<mod>/*": "./app/<mod>/*.js"`.
- **Preloads go in** `apps/web/adonisrc.ts` → `preloads`. Always add `() => import('#<mod>/routes')` at minimum. Add `#<mod>/start/events` if the module emits or listens. Add `#<mod>/start/view` if it mounts edge templates.
- **Migrations/seeders** paths append to `apps/web/config/database.ts` → `connections.postgres.migrations.paths` and `seeders.paths`.
- **i18n** — if the module has UI strings, drop JSON in `resources/lang/{en,fr,pt}/<mod>.json`. Three locales are canonical; all three must exist.

## Repo refs

- Preloads registration: `apps/web/adonisrc.ts:82-100`.
- Import aliases: `apps/web/package.json:18-31` (all `#mod/*` entries).
- Migration paths: `apps/web/config/database.ts:20`.
- Simplest module (only routes + controllers): `apps/web/app/analytics/`.
- Full-featured module (actions, policies, transformers, migrations, seeders, tests): `apps/web/app/users/`.
- Module with events + notifications: `apps/web/app/users/start/events.ts` + `apps/web/app/users/notifications/user_welcome_notification.ts`.
- Recent scaffold example: `apps/web/app/notifications/` (added in `feat(notifications)` commit).

## Workflow

### Bootstrap a new module `<mod>`

1. **Create the dir tree** — only the pieces you'll actually use. `routes.ts` is the one mandatory file.
2. **Add the alias** to `apps/web/package.json`:
   ```json
   "imports": {
     ...
     "#<mod>/*": "./app/<mod>/*.js",
     ...
   }
   ```
3. **Register preload(s)** in `apps/web/adonisrc.ts`:
   ```ts
   preloads: [
     ...
     () => import('#<mod>/routes'),
     // add if the module emits / listens to events
     () => import('#<mod>/start/events'),
     // add if the module has edge templates
     () => import('#<mod>/start/view'),
   ]
   ```
4. **If there are migrations**, append to `apps/web/config/database.ts`:
   ```ts
   migrations: {
     paths: [
       'app/users/database/migrations',
       'app/notifications/database/migrations',
       'app/<mod>/database/migrations',
     ],
   }
   ```
5. **If there are seeders**, append to `seeders.paths` similarly.
6. **If it has i18n keys**, create `app/<mod>/resources/lang/{en,fr,pt}/<mod>.json`. See [[i18n]].
7. **If it has UI**, follow [[inertia]] for the page resolver and [[layout-shells]] for which shell to import.
8. **If it needs CRUD**, follow [[crud]] to fill in the controller / actions / validators / policy / transformer / tests.
9. **Run typecheck** — `pnpm typecheck` — before writing more code, so alias/preload wiring is verified early.
10. **Run migration** if you added tables — `pnpm ace migration:run` (or `migration:fresh` if it's the first pass and no data matters).

### Add a route to an existing module

Just edit `app/<mod>/routes.ts`. `router.get/post/...` calls in that file are picked up because the file is preloaded.

### Delete a module cleanly

Reverse the wiring in the same order — remove preload, remove alias, remove migration path, then delete the dir. Skipping the alias/preload cleanup leaves phantom imports that will fail at boot.

## Anti-patterns

- ❌ Assuming autoloader — everything is explicit. If it's not in the alias + preload, it doesn't exist.
- ❌ Adding migrations without appending to `config/database.ts` — migrations won't run.
- ❌ Adding two modules with overlapping aliases (`#user/*` vs `#users/*`) — pick one.
- ❌ Copying a whole module and forgetting to update the alias references inside — every internal import in a copied module still points to the source.
- ❌ Creating `routes.ts` but not preloading it — routes silently disappear.

## Related skills

[[crud]] · [[actions-events]] · [[testing]] · [[migrations]] · [[i18n]] · [[inertia]]
