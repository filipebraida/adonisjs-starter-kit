# Agent instructions

## Meta-rule

**ALWAYS look for the existing pattern before writing anything new.** This repo is highly consistent; new code should mirror the closest existing example, not invent shape. Search first, code second.

## Stack

AdonisJS 7 (session auth + Bouncer + Lucid), Inertia + React 19, Tailwind 4 + shadcn/Radix, Postgres 16, pnpm monorepo (Turbo).

## Commands

- `pnpm dev` — dev server
- `pnpm test` — full suite
- `pnpm typecheck && pnpm lint` — before saying "done"
- `pnpm infra:up` — Postgres + Mailpit via compose
- `pnpm --filter web exec node ace <cmd>` — Adonis CLI

## Architecture — module per feature

```
app/<module>/
  actions/            # single-purpose class with .handle(input)
  controllers/        # thin: validate → action → redirect/render
  queries/            # read-only Lucid query classes
  policies/           # extend BasePolicy, one per resource
  models/, mixins/, services/, exceptions/, enums/
  transformers/       # follow the existing transformer shape
  validators.ts       # follow the existing validator shape
  database/{factories,migrations,seeders}/
  resources/lang/     # i18n JSON, per module per locale
  ui/                 # Inertia pages + React components
  start/{events,view}.ts     # optional per-module bootstrap
  routes.ts
  tests/{unit,functional}/
```

Existing modules: `auth`, `users`, `marketing`, `analytics`, `common`, `core`.

**Rules:**

- Controllers are thin: validate → call action → render/redirect. No business logic inline.
- Actions never touch `HttpContext` directly. They take a plain input and return values or throw.
- Transformers, validators, Inertia pages, tests — **match the shape of the nearest existing example**.

## Bootstrapping a new module

1. Create the directory tree above.
2. Register in `apps/web/adonisrc.ts` preloads: `() => import('#<mod>/routes')` (add `events`, `view` if the module has them).
3. Add import alias in `apps/web/package.json`: `"#<mod>/*": "./app/<mod>/*.js"`.
4. If the module has migrations/seeders, append its paths to `apps/web/config/database.ts` (`migrations.paths` and `seeders.paths`).

No autoloader — preloads and database paths are explicit.

## Cross-cutting

- **Side effects via events**: `emitter.emit('mod:event', payload)` inside actions; listener wired in `<mod>/start/events.ts` and preloaded from `adonisrc.ts`. Do not call side-effect code (mail, transmit) directly from an action.
- **Route guards**: `middleware.auth()` / `middleware.guest()` on the route.
- **Policy checks**: `bouncer.with(XPolicy).authorize('method', resource?)` inside the controller.
- **Auth guards**: `web` (session cookie, default) and `api` (access tokens on User).
- **RBAC**: `WithRoles` mixin exposes `assignRole`/`syncRoles`/`revokeRole`/`hasRole`/`hasPermission`. `ROLES` and `PERMISSIONS` are const objects — extend them there, not inline.
- **i18n**: three locales (`en`, `fr`, `pt`). Adding a key requires updating all three JSON files.

## Frontend

Pages under `app/<mod>/ui/pages/`:

- Single entity → `pages/<name>.tsx` (`index.tsx`, `create.tsx`, `edit.tsx`, …)
- Multiple entities → `pages/<entity>/<name>.tsx` following the same filenames

Components mirror the same rule at `app/<mod>/ui/components/` (`components/<name>.tsx` or `components/<entity>/<name>.tsx`). Shared UI kit at `packages/ui`.

- Tailwind 4 + shadcn primitives (Radix).
- Follow standard React best practices (hooks discipline, key on lists, no side effects in render).

## Testing

Specs at `app/<mod>/tests/{unit,functional}/*.spec.ts`. Match the shape of the nearest existing spec.

- **Fakes are mandatory** for anything that reaches out: attachments (`drive.fake`), mail (`mail.fake`), events (`emitter.fake`).
- **Prefer factories** (`app/<mod>/database/factories/`) over hand-built fixtures.
- **Sinon** for stubbing services, drivers, and external dependencies.

## Git

- Prefixes: `feat`, `fix(<mod>)`, `refactor`, `test`, `ci`, `db`, `chore`.
- Subject ≤ 70 chars, imperative. Body explains WHY, not WHAT.
- **Never** `--no-verify`, `git push --force`, `git reset --hard`, or amend a pushed commit.
- **Never** commit or push without being asked.

## Do / Don't

- **DO** search for an existing example before writing something new.
- **DO** keep controllers thin — logic in actions/services.
- **DO** run `pnpm typecheck && pnpm lint && pnpm test` before proposing a commit.
- **DO** use factories, fakes, and sinon in tests.
- **DON'T** invent new patterns when one already exists.
- **DON'T** call side-effect code directly from actions — emit an event.
- **DON'T** narrate what code does in comments — only short WHY when non-obvious.
- **DON'T** create README / doc files unprompted.
