# Agent instructions

AdonisJS 7 + Inertia/React 19 starter kit, pnpm monorepo. The app is `apps/web`; shared UI primitives are `packages/ui`; agent skills are `packages/skills`.

## Hard rules

- **Copy the closest existing example.** The repo is consistent: search for the pattern first, then mirror it. Do not invent a new shape.
- **Minimal diff.** No unrelated refactors, renames or import reshuffles. If the task grows, ask before expanding it.
- **Never `eslint-disable`.** A justified exception is a named block in `apps/web/eslint.config.js` with a comment saying why.
- **English** for identifiers, files, routes, comments and spec titles. User-facing text only through i18n keys, in every locale (`en`, `pt`).
- **Comments only for a non-obvious why** (a hidden constraint, an invariant, a workaround). Never narrate what the code does.
- **Prefer editing an existing file** to creating one. No README or doc files unless asked.
- **Git:** never commit or push unless asked; never `--no-verify`, `git push --force`, `git reset --hard`, or amend a pushed commit. Full workflow: `packages/skills/git-commit/SKILL.md`.
- **Done means verified:** `pnpm typecheck && pnpm lint`, then the narrowest relevant spec, then `pnpm test`. If a command cannot run (no database, no network), stop and report its output; do not claim completion.

## Commands

Run from the repo root.

| Command                                                  | What it does                                                                                                                                   |
| -------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm dev`                                               | Dev server on `:3333` (hot reload + Vite HMR)                                                                                                  |
| `pnpm test`                                              | Full Japa suite on its own `app_test` database, recreated and migrated first; needs the compose Redis (durable keys under `durable-test`)      |
| `pnpm typecheck` / `pnpm lint`                           | Required before saying done                                                                                                                    |
| `pnpm test:stories`                                      | Every Storybook story rendered in Chromium, with its `play`                                                                                    |
| `pnpm ace <cmd>`                                         | Adonis CLI (`pnpm --filter web exec node ace <cmd>`)                                                                                           |
| `pnpm ace codegen`                                       | Regenerates the committed `.adonisjs/`; CI fails when it is stale                                                                              |
| `pnpm ace make:module <name> [--db] [--i18n] [--events]` | Scaffolds `app/<name>/` and wires the alias, routes, preloads, client tsconfig include and (with `--db`) the migration path                    |
| `pnpm infra:up` / `infra:down`                           | Postgres 18, Redis, Mailpit and pgAdmin via compose; host ports follow `DB_PORT`, `REDIS_PORT`, `SMTP_PORT`, `MAILPIT_UI_PORT`, `PGADMIN_PORT` |

## Where code goes

Every bounded context is a module at `apps/web/app/<mod>/`, aliased `#<mod>/*`. Modules: `core`, `auth`, `users`, `notifications`, `analytics`, `marketing`.

| Thing                            | Place                                                                                                                                                                                                                       | Shape                                                                                                |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Use case                         | `actions/<verb>_<object>.ts`                                                                                                                                                                                                | class with one public `handle(input)`; never imports another action                                  |
| HTTP entry                       | `controllers/<name>_controller.ts`                                                                                                                                                                                          | resource methods only, or one `handle()` named `<verb>_<object>` (a page may be a noun: `dashboard`) |
| Read side                        | `queries/`                                                                                                                                                                                                                  | read-only Lucid query classes                                                                        |
| Authorization                    | `policies/<entity>_policy.ts`                                                                                                                                                                                               | extends `BasePolicy`, checks capabilities via `#core/authz/authorizer`                               |
| Validation                       | `validators/<entity>.ts`                                                                                                                                                                                                    | VineJS, one file per entity                                                                          |
| Side effect (mail, notification) | `workflows/<verb_object>_workflow.ts`                                                                                                                                                                                       | durable workflow, one `ctx.localStep` per effect                                                     |
| Reaction to an event             | `listeners/`                                                                                                                                                                                                                | only schedules a workflow                                                                            |
| Events                           | `types/events.ts` + `start/events.ts`                                                                                                                                                                                       | `EventsList` merge + emitter wiring                                                                  |
| Page                             | `ui/pages/**.tsx`                                                                                                                                                                                                           | renders `<Head>`, picks its layout shell by import                                                   |
| Component / hook                 | `ui/components/`, `ui/hooks/`                                                                                                                                                                                               |                                                                                                      |
| Layout shell                     | `ui/layouts/<shell>.tsx`                                                                                                                                                                                                    | the chrome a page wraps itself in (`core/ui/layouts/admin.tsx`); see `layout-shells`                 |
| Translations                     | `resources/lang/<locale>/<file>.json`                                                                                                                                                                                       | the file name is the key prefix: `errors.json` → `errors.*`                                          |
| Spec                             | `tests/unit/<layer>/`, `tests/functional/<area>/`                                                                                                                                                                           | `<name>.spec.ts`                                                                                     |
| Also                             | `models/`, `mixins/`, `services/`, `steps/` (dispatched durable steps), `exceptions/`, `enums/`, `transformers/`, `middleware/`, `mails/`, `notifications/`, `audit_resolvers/`, `database/{factories,migrations,seeders}/` |                                                                                                      |

Only `core` has `utils/` (the one utils of the app), `authz/` and `hooks/`.

## Invariants the tools rely on

- **Dependencies between modules:** `core` imports no module; `auth` (identity: `User`, credentials, roles) imports only `core`. Any other import between modules must be listed in `DEPENDENCIES` in `apps/web/eslint.config.js`, otherwise the lint fails. The composition root (`core/middleware/inertia_middleware.ts`, `core/policies/main.ts`, `core/ui/app/**`) may import every module.
- **Names and places feed generated files.** Nothing errors when they are wrong; the entry is just missing. After adding one, run `pnpm ace codegen`:
  - `*_controller.ts` and `*_transformer.ts` are indexed into `#generated/controllers` and the shared props.
  - Pages under `ui/pages/` are typed as `<mod>/<path>`.
  - Workflows under `<mod>/workflows/` are registered with the engine.
  - The English translation files type the keys of `t()`.
- **Transformer variants** are `for<Screen>` (`forList`, `forEdit`, `forSharedProps`) over `toObject()`, used as `Transformer.transform(x).useVariant('forEdit')`.
- **Side effects never run in an action:** the action emits an event, a listener schedules a workflow, the workflow does the effect.
- **Every mutation route is gated by a policy**, before validation.

## UI layers

- `@workspace/ui/*` (`packages/ui`): headless shadcn/Radix primitives. They know nothing of the app. They never hold a translation key (texts are props with English defaults). A shape they lack becomes a variant there (`Button shape="pill"`, `Badge size="count"`), not a `className` override.
- `#core/ui/*`: Inertia-aware wrappers. Inside pages, import from here first: `Form`/`Field`/`FieldError` (errors by field name), `DataTable` (labels from `t`), `useTranslation` (typed keys), `useFlashToasts`.
- Dates and numbers go through `#core/ui/format/*`; internal URLs come from `urlFor` or `<Link route>`.
- **Design board:** before building or changing a screen, read the rules in `apps/storybook/stories/` (`foundations/foundations.mdx`, `forms/rules.mdx`, `content/list_page.stories.tsx`). A screen is assembled from those patterns; a missing piece is added to the board first, then used.
- **The rules that drift most:** one primary button per area (page, modal, section); every list has an empty state with the next action; shape and color come from variants, never `className`; every state is designed (empty, error, no permission, long text), not only the happy path.
- **Verify a screen** with a story in `apps/storybook/stories/screens/`, one per state; a page that searches or saves answers its visits with `inertiaRoute`. `pnpm storybook` serves it on `:6006`; `pnpm test:stories` runs every story in Chromium (CI does too), and an interaction worth keeping becomes the story's `play`.

## Skills

Load the matching skill before working. Each one has repo refs and doc links. Install them with `npx skills add ./packages/skills --agent claude-code`.

| Task                                                 | Skill                |
| ---------------------------------------------------- | -------------------- |
| New module                                           | `module-scaffolding` |
| Full CRUD screen                                     | `crud`               |
| Routes, matchers, naming                             | `routes`             |
| Lists, filters, dashboards                           | `queries`            |
| Actions, events, listeners, workflows                | `actions-events`     |
| Specs, fakes, factories                              | `testing`            |
| Pages, `<Form>`, shared props, modals                | `inertia`            |
| Screens, design rules, empty states                  | `design-board`       |
| Help articles, the "?" of a screen                   | `help`               |
| Translations                                         | `i18n`               |
| Which layout shell                                   | `layout-shells`      |
| Capabilities, policies, `useCan`                     | `authorization`      |
| Audit trail, Activity page                           | `auditing`           |
| Emails                                               | `mail`               |
| In-app notifications, SSE                            | `notifications`      |
| File uploads                                         | `attachment`         |
| Schema changes (edit `create_*` + `migration:fresh`) | `migrations`         |
| Commits                                              | `git-commit`         |

## Gotchas

- `pnpm dev` may already be running on `:3333`, on the developer's database. For a throwaway server, use another `PORT` and your own `DB_*`.
- `.claude/settings.json` denies reading `.env` and asks before `git push`. A headless run (`claude -p`) cannot answer an ask, so an unattended pipeline that pushes must override that rule.
- `app/core/database/schema.ts` and `.adonisjs/` are generated but committed: regenerate them, never edit them by hand.
- `Model.query().update()` / `.delete()` skip the audit trail; write through the model when the change must be audited.
- The console of the durable workflows (`/workflows`, `config/durable_dashboard.ts`) belongs to the library, not an Inertia page: the admin menu opens it as an external link, and the config's `authorize` gates it by `workflows.view`, not a policy.
- `lefthook` runs Prettier + ESLint on staged files at commit and the typecheck at push.
- Adding a shadcn component: `pnpm dlx shadcn@latest add <name> --cwd packages/ui`. Then point its `import { cn } from "cn"` back to `@workspace/ui/lib/utils`. `select` is maintained by hand because it portals into the open modal, so don't overwrite it.
- Deploy is `deploy.ts` (Catapult + PM2, `compose.prod.yaml`). A release migrates the database, then checks `/health/live`. `deploy:rollback` does not undo migrations.
