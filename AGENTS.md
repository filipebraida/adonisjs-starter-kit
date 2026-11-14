# Agent instructions

## Meta-rule

**ALWAYS look for the existing pattern before writing anything new.** This repo is highly consistent; new code should mirror the closest existing example, not invent shape. Search first, code second.

## Scope

- **Minimal diff.** Prefer the smallest change that satisfies the request — don't refactor unrelated code, rename identifiers "on the way", or restructure imports beyond the diff.
- If the task drifts, ask before expanding scope.

## Stack

AdonisJS 7 (session auth + Bouncer + Lucid), Inertia + React 19, Tailwind 4 + shadcn/Radix, Postgres 16, pnpm monorepo (Turbo).

## Commands

- `pnpm dev` — dev server
- `pnpm test` — full suite, on its own `app_test` database (`db:prepare-test` creates, wipes and migrates it first)
- `pnpm typecheck && pnpm lint` — before saying "done"
- `pnpm infra:up` — Postgres + Mailpit via compose (host ports follow `DB_PORT` / `SMTP_PORT` / `MAILPIT_UI_PORT` / `PGADMIN_PORT`)
- `pnpm ace <cmd>` — Adonis CLI from the repo root (shortcut for `pnpm --filter web exec node ace <cmd>`)
- `pnpm ace make:module <name> [--db] [--i18n] [--events]` — scaffold a module and wire every touchpoint (alias, preload, migration path, tsconfig include, i18n loader)

## Done criteria

Before reporting completion:

- Run `pnpm typecheck && pnpm lint`.
- Run the narrowest relevant test first (module functional spec) before falling back to `pnpm test`.
- If a required command failed to run (missing infra, no network, etc.), stop and report the failure with the relevant output — do not claim completion.

## Architecture — module per bounded context

Every bounded context lives at `app/<mod>/` as a self-contained module. A module owns the ubiquitous language of one context and may hold multiple aggregates inside — modules are **not** 1:1 with aggregates. Existing modules: `auth`, `users`, `marketing`, `analytics`, `core`, `notifications`. Each module dir is aliased as `#<mod>/*` in `apps/web/package.json` → `"imports"` — see the `module-scaffolding` skill to add one.

```
app/<module>/
  actions/            # single-purpose class with .handle(input)
  controllers/        # thin: validate → action → redirect/render
  queries/            # read-only Lucid query classes
  policies/           # extend BasePolicy, one per resource
  models/, mixins/, services/, exceptions/, enums/
  middleware/         # singular — HTTP middleware (registered in start/kernel.ts)
  transformers/
  validators/         # one file per entity — validators/users.ts, validators/tokens.ts
  database/{factories,migrations,seeders}/
  resources/lang/     # i18n JSON, per module per locale
  ui/                 # Inertia pages + React components
  mails/              # BaseMail classes — *_notification.ts (see the mail skill)
  notifications/      # Notification classes (if the module emits)
  types/events.ts     # EventsList declaration merge (if the module emits)
  start/{events,view}.ts
  routes.ts
  tests/{unit,functional}/
```

### Dependency direction

`core` knows no module. `auth` owns identity — `User`, credentials, role assignment (`SyncUserRoles`, `ROLES`) — and depends only on `core`. Feature modules depend on `core`, `auth` and what `DEPENDENCIES` in `apps/web/eslint.config.js` lists for them; that table is the source of truth and the lint fails on any other import between modules. The composition root (`core/middleware/inertia_middleware.ts`, `core/policies/main.ts`, `core/ui/app/**`) may import every module. An action never imports another action. A new dependency between modules is a decision: add it to the table first.

### Naming is wiring

Two conventions the tooling enforces silently — get the name wrong and there's no error, just a missing entry:

- **Filename globs feed the typed registries.** `*_controller.ts` and `*_transformer.ts` are indexed by `indexEntities` into `#generated/controllers` and the shared-props types. A different suffix is silently absent from the registry.
- **Transformer variants are named `for<Screen>`** — `forList`, `forEdit`, `forProfile`, `forSharedProps` — over a `toObject()` base, consumed as `Transformer.transform(x).useVariant('forEdit')`. See `app/users/transformers/user_transformer.ts`.

## Skills — where the detailed workflows live

Detailed conventions live as agent skills in `packages/skills/`, in the [Vercel Skills](https://github.com/vercel-labs/skills) format. Install with `npx skills add ./packages/skills --agent claude-code` (or `--all`). **Prefer loading the relevant skill over guessing** — every skill has repo refs to canonical examples and external doc links. Only the invariants below need to hold when a skill isn't loaded.

**Backbone**

- `module-scaffolding` — bootstrap a new `app/<mod>/` via `node ace make:module` (wires alias + preload + migration paths + tsconfig include).
- `crud` — full stack (route → controller → validator → policy → action → transformer → Inertia page).
- `routes` — resource vs. verb routes, numeric matchers, naming.
- `queries` — read side: list queries + per-concept read models composed in the controller.
- `actions-events` — action shape (`.handle(input)`) and event-driven side effects.
- `testing` — Japa functional + unit patterns (transactions, fakes, sinon, factories).

**Frontend**

- `inertia` — page resolver, shared props, `useForm`, `urlFor`, modals, provider tree.
- `i18n` — two locales (`en`, `pt`), `useTranslation()`, `ctx.i18n.t()`, `User.locale` persistence.
- `layout-shells` — four coexisting shells; pages import explicitly, no runtime toggle.

**Feature**

- `authorization` — `@adonis-agora/authz`: per-module capabilities + `roleGrants` in code + `Authorizer` in Bouncer policies + `useCan()` from `authz-react` + escalation guards.
- `mail` — `BaseMail` classes + MJML via `@email.layout` + `mailContext()`.
- `notifications` — Facteur + Transmit stack, per-user SSE channel, bell + unseen count.
- `auditing` — `@filipebraida/adonis-auditing`: `Auditable` models + `auditCustom` security events + resolvers (actor, IP, impersonated_by) + the Activity page.
- `attachment` — `@jrmc/adonis-attachment` converters + model decoration + `preComputeUrls`.
- `migrations` — starter kit convention: edit existing `create_<table>` migrations + `migration:fresh` instead of layering `alter_table`.

**Git**

- `git-commit` — commit types, scopes, examples, safety protocol.

## Lint

`apps/web` runs [`@filipebraida/eslint-config-adonis`](https://github.com/filipebraida/eslint-config-adonis) in the modules layout: it turns these conventions into errors (where each file lives, what an action, query, controller or page may do, how specs share the database) and each message says where the code goes. Read the message's note before changing code.

- **Never `eslint-disable`.** A justified exception is a named block in `apps/web/eslint.config.js` with a comment saying why; remove it when the reason goes away.
- Specs live by layer: `app/<mod>/tests/unit/<layer>/<name>.spec.ts`, `app/<mod>/tests/functional/<area>/<resource>.spec.ts`.
- Dates and numbers go through `#core/ui/format/*`; every page renders `<Head>`; internal URLs come from `urlFor`.
- `lefthook` runs Prettier and ESLint on staged files before a commit and the typecheck before a push.

## Code style

- Comments only for non-obvious WHY — a hidden constraint, subtle invariant, workaround. Don't narrate what the code does.
- Don't create README / doc files unless the user asks for them.
- Prefer editing existing files over creating new ones.

## UI layers — which to import

Two tiers, by design (not duplication):

- `@workspace/ui/*` (`packages/ui`) — **headless primitives** (shadcn/Radix): `Field`, `FieldError`, `toast`, buttons, tables. No app or Inertia knowledge.
- `#core/ui/*` — **Inertia-aware composition** that wraps the primitives: `Form`/`Field`/`FieldError` bind form errors via `FormErrorsContext` + `FieldNameContext`; `useFlashToasts` pipes Inertia flash into the primitive `toast`.

Rule: inside Inertia pages/forms import from `#core/ui`; reach for `@workspace/ui` directly only for a primitive that has no app wrapper. Add new primitives to `packages/ui`, new app-composition to `#core/ui`.

## Git — non-negotiables

Full workflow: `packages/skills/git-commit/SKILL.md`. Rules every agent must respect even without the skill loaded:

- **Never** `--no-verify`, `git push --force`, `git reset --hard`, or amend a pushed commit.
- **Never** commit or push without being asked.
