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

- `#auth/*`, `#users/*`, `#common/*`, `#core/*`, `#marketing/*`, `#analytics/*`, `#notifications/*` → `app/<mod>/`
- `#app/*`, `#start/*`, `#config/*`, `#providers/*`, `#tests/*` → matching root dirs
- `#generated/*` → `.adonisjs/server/` (typed data / pages, regenerated on codegen)

Bootstrapping a new module always includes adding a matching `#<mod>/*` alias here.

## Architecture — module per feature

Every feature lives at `app/<mod>/` as a self-contained module. Existing modules: `auth`, `users`, `marketing`, `analytics`, `common`, `core`, `notifications`.

```
app/<module>/
  actions/            # single-purpose class with .handle(input)
  controllers/        # thin: validate → action → redirect/render
  queries/            # read-only Lucid query classes
  policies/           # extend BasePolicy, one per resource
  models/, mixins/, services/, exceptions/, enums/
  transformers/
  validators/         # one file per entity — validators/users.ts, validators/tokens.ts
  database/{factories,migrations,seeders}/
  resources/lang/     # i18n JSON, per module per locale
  ui/                 # Inertia pages + React components
  notifications/      # Notification classes (if the module emits)
  start/{events,view}.ts
  routes.ts
  tests/{unit,functional}/
```

## Skills — where the detailed workflows live

Detailed conventions live as agent skills in `packages/skills/`, in the [Vercel Skills](https://github.com/vercel-labs/skills) format. Install with `npx skills add ./packages/skills --agent claude-code` (or `--all`). **Prefer loading the relevant skill over guessing** — every skill has repo refs to canonical examples and external doc links. Only the invariants below need to hold when a skill isn't loaded.

**Backbone**

- `module-scaffolding` — bootstrap a new `app/<mod>/` (dirs + alias + preload + migration paths).
- `crud` — full stack (route → controller → validator → policy → action → transformer → Inertia page).
- `queries` — read side: list queries + per-concept read models composed in the controller.
- `actions-events` — action shape (`.handle(input)`) and event-driven side effects.
- `testing` — Japa functional + unit patterns (transactions, fakes, sinon, factories).

**Frontend**

- `inertia` — page resolver, shared props, `useForm`, `urlFor`, modals, provider tree.
- `i18n` — three locales, `useTranslation()`, `ctx.i18n.t()`, `User.locale` persistence.
- `layout-shells` — four coexisting shells; pages import explicitly, no runtime toggle.

**Feature**

- `authorization` — `PERMISSIONS` + `ROLES` + `WithRoles` + Bouncer policies + `useCan()` + escalation guards.
- `mail` — `BaseMail` classes + MJML via `@email.layout` + `mailContext()`.
- `notifications` — Facteur + Transmit stack, per-user SSE channel, bell + unseen count.
- `attachment` — `@jrmc/adonis-attachment` converters + model decoration + `preComputeUrls`.
- `migrations` — starter kit convention: edit existing `create_<table>` migrations + `migration:fresh` instead of layering `alter_table`.

**Git**

- `git-commit` — commit types, scopes, examples, safety protocol.

## Non-negotiable invariants

These must hold even without loading a skill:

- Controllers are thin: validate → policy → action → render/redirect. No business logic inline.
- Actions never touch `HttpContext` and never call side-effect code (mail, notifications, transmit) directly — emit a domain event; a listener in `<mod>/start/events.ts` runs the effect.
- Never send a Lucid model to Inertia — always through a Transformer variant.
- Every mutation route is gated by a Bouncer policy (`bouncer.with(X).authorize('method', resource?)`).
- Adding an i18n key requires updates in all three locales (en/fr/pt).
- No runtime layout toggle — pages import their shell explicitly.
- Emails author in MJML using the shared `@email.layout` — never raw `<html><head><style>`.
- Tests: `wrapInGlobalTransaction()` + mandatory fakes (`drive.fake`, `mail.fake`, `emitter.fake`) + `.withCsrfToken()` on POST/PUT/DELETE.
- Migrations (starter kit): fold changes into the existing `create_<table>_table.ts` and `pnpm ace migration:fresh` locally — never on shared / production DB.
- No autoloader — preloads (`adonisrc.ts`), aliases (`package.json`), and migration paths (`config/database.ts`) are explicit.
- Match the shape of the nearest existing example.

## Code style

- Comments only for non-obvious WHY — a hidden constraint, subtle invariant, workaround. Don't narrate what the code does.
- Don't create README / doc files unless the user asks for them.
- Prefer editing existing files over creating new ones.

## Gotchas

- `ctx.auth.user` doesn't always populate after `authenticate()` — use the return value: `const user = await ctx.auth.use('web').authenticate()`.
- `apps/web/database/schema.ts` is auto-generated by ace (gitignored). `pnpm ace migration:fresh` regenerates it; the regenerated file sometimes needs `pnpm --filter web exec eslint --fix database/schema.ts` to satisfy prettier.
- Ace commands and codegen resolve paths against `apps/web/`. `pnpm ace` handles this from anywhere; scripts that rely on `import.meta.url` still resolve against the source location.
- `vine.compile()` is deprecated — use `vine.create({...})` (and `vine.withMetaData<T>().create({...})`).
- Turbo cache can go stale on structural changes; if typecheck complains about types that clearly exist, `rm -rf apps/web/.turbo && pnpm typecheck` to force fresh.

## Git — non-negotiables

Full workflow: `packages/skills/git-commit/SKILL.md`. Rules every agent must respect even without the skill loaded:

- **Never** `--no-verify`, `git push --force`, `git reset --hard`, or amend a pushed commit.
- **Never** commit or push without being asked.
