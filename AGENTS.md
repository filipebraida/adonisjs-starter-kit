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
- `pnpm ace <cmd>` — Adonis CLI from the repo root (shortcut for `pnpm --filter web exec node ace <cmd>`)

## Import aliases

Declared in `apps/web/package.json` → `"imports"`:

- `#auth/*`, `#users/*`, `#common/*`, `#core/*`, `#marketing/*`, `#analytics/*` → `app/<mod>/`
- `#app/*`, `#start/*`, `#config/*`, `#providers/*`, `#tests/*` → matching root dirs
- `#generated/*` → `.adonisjs/server/` (typed data / pages, regenerated on codegen)

Bootstrapping a new module always includes adding a matching `#<mod>/*` alias here.

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

**Invariants:**

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
- **i18n**: three locales (`en`, `fr`, `pt`). Adding a key requires updating all three JSON files. `User.locale` is authoritative when authenticated — the switch endpoint persists to DB + cookie; login flows sync the cookie from `user.locale`. Pre-login pages fall back to cookie / `Accept-Language`.
- **Migrations**: this is a starter kit — no production data. Prefer editing the existing `create_<table>_table.ts` migration and running `pnpm ace migration:fresh` over layering an `alter_table` migration on top. Downstream projects can adopt a stricter policy.

## Frontend

Pages under `app/<mod>/ui/pages/`:

- Single entity → `pages/<name>.tsx` (`index.tsx`, `create.tsx`, `edit.tsx`, …)
- Multiple entities → `pages/<entity>/<name>.tsx` following the same filenames

Components mirror the same rule at `app/<mod>/ui/components/`. Shared UI kit at `packages/ui`.

### Layout shells

Every page imports its shell explicitly. There is no runtime layout chooser — variants coexist as distinct components you delete if unused:

- `admin_layout` (`app/common/ui/components/`) — sidebar shell for admin/backoffice pages.
- `authenticated_layout` (`app/common/ui/components/`) — top-nav shell for regular logged-in pages.
- `auth_layout` (`app/auth/ui/components/`) — split-screen shell for sign-in/sign-up/password flows.
- `marketing_layout` (`app/marketing/ui/components/`) — public shell with header + footer.

Add a shell only when a page truly needs a new shape. Adjust `variant`/`collapsible`/direction inside the shell file itself — never expose them as props or user-facing toggles.

## Testing

Specs at `app/<mod>/tests/{unit,functional}/*.spec.ts`. Match the shape of the nearest existing spec.

- Tests run against the same Postgres as dev, wrapped in a per-test transaction via `testUtils.db().wrapInGlobalTransaction()`. No separate test DB config.
- **Fakes are mandatory** for anything that reaches out: attachments (`drive.fake`), mail (`mail.fake`), events (`emitter.fake`).
- **Prefer factories** (`app/<mod>/database/factories/`) over hand-built fixtures.
- **Sinon** for stubbing services, drivers, and external dependencies.
- POST/PUT/DELETE routes must include `.withCsrfToken()` in tests (shield middleware is active).

## Code style

- Comments only for non-obvious WHY — a hidden constraint, a subtle invariant, a workaround. Don't narrate what the code does; the diff and identifiers already do that.
- Don't create README / doc files unless the user asks for them.
- Prefer editing existing files over creating new ones.

## Gotchas

- `ctx.auth.user` doesn't always populate after `authenticate()` — use the return value: `const user = await ctx.auth.use('web').authenticate()`.
- `apps/web/database/schema.ts` is auto-generated by ace (gitignored). `pnpm ace migration:fresh` regenerates it; the regenerated file sometimes needs `eslint --fix` to satisfy prettier.
- Ace commands and codegen resolve paths against `apps/web/`. `pnpm ace` handles this from anywhere; scripts that rely on `import.meta.url` still resolve against the source location.

## Skills

Coding-agent skills live in `packages/skills/`, in the [Vercel Skills](https://github.com/vercel-labs/skills) format. Install into an agent with `npx skills add ./packages/skills --agent claude-code` (or `--all`). Prefer skills over duplicating conventions here — this file stays high-level, skills carry the workflow detail.

Currently shipped:

- `git-commit` — commit types, scopes, examples, workflow, safety protocol.

## Git — non-negotiables

Full workflow: `packages/skills/git-commit/SKILL.md`. Rules every agent must respect even without the skill loaded:

- **Never** `--no-verify`, `git push --force`, `git reset --hard`, or amend a pushed commit.
- **Never** commit or push without being asked.
