---
name: module-scaffolding
description: 'How to add a new module to this AdonisJS monorepo — prefer `node ace make:module`, which scaffolds and wires every touchpoint. User-invoked via /module-scaffolding when wiring a module by hand or adding a piece later.'
disable-model-invocation: true
license: MIT
allowed-tools: Read, Edit, Write, Bash, Grep, Glob
---

# Module scaffolding

Every feature lives under `app/<mod>/` as a self-contained module. There is no autoloader — preloads, import aliases, migration paths, tsconfig includes, and event listener mounts are all wired explicitly. Miss any of these and the module simply won't load, its rows won't migrate, or its event types won't typecheck.

## Quick start — `make:module`

Do not wire by hand unless you have to. The generator creates the skeleton and injects every touchpoint idempotently:

```bash
node ace make:module <mod>                     # routes + controller + ui page + smoke test
node ace make:module <mod> --db --i18n --events
```

- `--db` — adds `database/migrations/` and registers its path in `config/database.ts`.
- `--i18n` — adds `resources/lang/{en,fr,pt}/<mod>.json` and registers the i18n loader.
- `--events` — adds `start/events.ts` + `types/events.ts`, preloads events, **and** adds the `types/**` glob to the core tsconfig (skip that and the `EventsList` merge breaks the client typecheck).

Always wired: the `#<mod>/*` alias, the `#<mod>/routes` preload, and the `ui/**` tsconfig include. After running it, `pnpm dev` (or any `node ace`) regenerates route/page types, then `pnpm typecheck`. The rest of this skill is what the command does under the hood — use it to add a piece later or to wire a module by hand.

## Conventions

- **Module dir tree & existing modules** — see AGENTS.md → "Architecture — module per bounded context" (always in context). Create only the pieces you need; `routes.ts` is the only mandatory file.
- **Aliases go in** `apps/web/package.json` → `"imports"`. Add `"#<mod>/*": "./app/<mod>/*.js"`.
- **Preloads go in** `apps/web/adonisrc.ts` → `preloads`. Always add `() => import('#<mod>/routes')` at minimum. Add `#<mod>/start/events` if the module emits or listens. Add `#<mod>/start/view` if it mounts edge templates.
- **Migrations/seeders** paths append to `apps/web/config/database.ts` → `connections.postgres.migrations.paths` and `seeders.paths`.
- **tsconfig include** — when the module has `ui/`, add `../../<mod>/ui/**/*.ts` and `../../<mod>/ui/**/*.tsx` to `apps/web/app/core/ui/tsconfig.json` → `include`. Add `../../<mod>/types/**/*.ts` when it has `types/events.ts`, or the `EventsList` merge is invisible to the client tsc and event typechecks break.
- **i18n** — if the module has UI strings, drop JSON in `resources/lang/{en,fr,pt}/<mod>.json`. Three locales are canonical; all three must exist.

## Repo refs

- Preloads registration: `apps/web/adonisrc.ts` → `preloads`.
- Import aliases: `apps/web/package.json` → `"imports"` (all `#mod/*` entries).
- Migration paths: `apps/web/config/database.ts` → `migrations.paths`.
- tsconfig include (client typecheck): `apps/web/app/core/ui/tsconfig.json` → `include` (see the `auth`/`users` `ui/**` + `types/**` entries).
- Generator: `apps/web/commands/make_module.ts`.
- Smallest module — just `routes.ts` + a controller; add other layers only as the module needs them.
- Full-featured module (actions, policies, transformers, migrations, seeders, tests): `apps/web/app/users/`.
- Module with events + notifications: `apps/web/app/users/start/events.ts` + `apps/web/app/users/notifications/user_welcome_notification.ts`.

## Workflow

### Bootstrap a new module `<mod>`

Prefer `node ace make:module <mod> [--db] [--i18n] [--events]` (see Quick start). The steps below are the by-hand equivalent, and what you follow to add a piece to an existing module.

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
6. **If it has `ui/` (or `types/events.ts`)**, add the includes to `apps/web/app/core/ui/tsconfig.json`:
   ```jsonc
   "include": [
     ...
     "../../<mod>/ui/**/*.ts",
     "../../<mod>/ui/**/*.tsx",
     "../../<mod>/types/**/*.ts",   // only if the module has types/events.ts
     ...
   ]
   ```
7. **If it has i18n keys**, create `app/<mod>/resources/lang/{en,fr,pt}/<mod>.json`. See [[i18n]].
8. **If it has UI**, follow [[inertia]] for the page resolver and [[layout-shells]] for which shell to import.
9. **If it needs CRUD**, follow [[crud]] to fill in the controller / actions / validators / policy / transformer / tests.
10. **Run typecheck** — `pnpm typecheck` — before writing more code, so alias/preload/tsconfig wiring is verified early.
11. **Run migration** if you added tables — `pnpm ace migration:run` (or `migration:fresh` if it's the first pass and no data matters).

### Add a route to an existing module

Just edit `app/<mod>/routes.ts`. `router.get/post/...` calls in that file are picked up because the file is preloaded.

### Delete a module cleanly

Reverse the wiring in the same order — remove preload, alias, migration path, tsconfig include, then delete the dir. Skipping the alias/preload cleanup leaves phantom imports that will fail at boot.

## Anti-patterns

- ❌ Assuming autoloader — everything is explicit. If it's not in the alias + preload, it doesn't exist.
- ❌ Adding migrations without appending to `config/database.ts` — migrations won't run.
- ❌ Adding `types/events.ts` without its `types/**` glob in `app/core/ui/tsconfig.json` — the `EventsList` merge is invisible to the client tsc and event typechecks break.
- ❌ Adding two modules with overlapping aliases (`#user/*` vs `#users/*`) — pick one.
- ❌ Copying a whole module and forgetting to update the alias references inside — every internal import in a copied module still points to the source.
- ❌ Creating `routes.ts` but not preloading it — routes silently disappear.

## Related skills

[[crud]] · [[actions-events]] · [[testing]] · [[migrations]] · [[i18n]] · [[inertia]]
