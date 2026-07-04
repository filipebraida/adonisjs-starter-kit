---
name: git-commit
description: 'Execute a git commit that follows this repo''s AGENTS.md conventions — semantic prefix, optional module/package scope, imperative subject in English under 70 chars, body explaining WHY. Use when the user asks to commit changes, create a git commit, or types "/commit".'
license: MIT
allowed-tools: Bash
---

# Git Commit

Create semantic git commits that match the conventions in this repo's `AGENTS.md` and the existing history. Analyze the actual diff to pick the right type, an optional scope, and a subject that reads well next to `git log --oneline`.

## Commit format

```
<type>(<optional-scope>): <imperative subject>

[optional body — WHY, not WHAT]

[optional footer(s)]
```

- **Subject**: imperative mood, English, ≤ 70 characters. No trailing period.
- **Scope**: the single module or package most affected. Omit when the change is cross-cutting.
- **Body**: explain motivation (constraint, incident, decision). The diff already shows _what_.
- **Footers**: `Closes #123`, `BREAKING CHANGE: …`, etc.

Examples pulled from this repo's history:

```
feat(users): persist locale as user preference
refactor(ui): replace runtime layout chooser with coexisting shells
fix(ui): reset password fields on submit across auth + users forms
db: fold locale column into users create migration
chore: add root pnpm ace shortcut
test: cover surface — marketing, dashboard, detect_user_locale
ci: coverage summary in job summary, drop useless artifact upload
```

## Commit types

| Type       | When                                                         |
| ---------- | ------------------------------------------------------------ |
| `feat`     | New user-visible capability                                  |
| `fix`      | Bug fix (behavior was wrong, now correct)                    |
| `refactor` | Internal change, same behavior                               |
| `test`     | Add/adjust tests                                             |
| `db`       | Schema / migration change                                    |
| `ci`       | Pipeline, actions, coverage, release plumbing                |
| `chore`    | Housekeeping (deps, config, tooling) that isn't `ci` or `db` |
| `docs`     | Docs-only change                                             |
| `style`    | Formatting only (no logic)                                   |

## Scopes

Only use a scope when the change clearly centers on one of these:

**Domain modules** (`apps/web/app/<mod>/`):

- `auth`
- `users`
- `marketing`
- `analytics`
- `common`
- `core`

**Monorepo packages** (`packages/<pkg>/`):

- `ui`
- `eslint-config`
- `typescript-config`
- `skills`

**Cross-cutting** (usually no scope):

- infra (docker, deploy)
- config
- tooling (prettier, turbo, tsconfig at root)

If the change spans several modules with no clear center, omit the scope.

## Breaking changes

```
# Exclamation mark after type/scope
feat!: drop legacy /v1 endpoints

# Or a BREAKING CHANGE footer
feat(auth): rework session guard

BREAKING CHANGE: web guard now returns null when the session is missing
instead of throwing E_UNAUTHORIZED_ACCESS.
```

## Workflow

### 1. Read what's changing

```bash
git status
git diff --staged   # if anything is staged
git diff            # working tree, unstaged
git log --oneline -10   # match the tone of recent messages
```

### 2. Stage the right files

- Stage by explicit path (`git add path/to/file`) rather than `git add -A` or `git add .`.
- Never stage secrets (`.env`, credentials, tokens).
- Never stage unrelated in-flight work — split into separate commits if needed.

### 3. Check code health (when applicable)

Per `AGENTS.md`, before proposing a commit that touches TS/TSX under `apps/web/` or `packages/`:

```bash
pnpm typecheck
pnpm lint
pnpm test        # when the change is testable
```

Skip for docs-only, config-only, asset-only, or pure renames.

### 4. Draft the message

- **Type**: which semantic type best describes the change?
- **Scope**: is one module/package clearly the focus? If not, omit.
- **Subject**: one imperative-mood line in English, ≤ 70 chars.
- **Body**: only if the diff doesn't already speak for itself — explain the WHY (motivation, constraint, past incident, decision that isn't obvious).

### 5. Commit

Single line:

```bash
git commit -m "<type>(<scope>): <subject>"
```

Multi-line body (use HEREDOC to preserve formatting):

```bash
git commit -m "$(cat <<'EOF'
<type>(<scope>): <subject>

<body — why this change, not what>

<footers>
EOF
)"
```

## Best practices

- One logical change per commit.
- Imperative mood: `add`, `fix`, `replace` — not `added`, `fixed`, `replaces`.
- Subject in English, lowercase, ≤ 70 chars, no trailing period.
- Body wraps around 72 chars.
- Reference issues in the footer (`Closes #123`, `Refs #456`) — not the subject.
- **Do not** add `Co-Authored-By` or coauthor trailers unless explicitly requested — this project omits them.
- Avoid emojis unless the user asks for them.

## Git safety protocol (from AGENTS.md)

- Never edit git config.
- Never run destructive commands (`--force`, `reset --hard`, `clean -f`, `branch -D`) without an explicit request.
- Never skip hooks (`--no-verify`) unless the user asks.
- Never force-push to `main`/`master`.
- Prefer new commits over `--amend`. If a hook fails, fix the underlying issue and create a NEW commit — the previous commit didn't happen, so amending would edit an unrelated older commit.
- Never commit or push unprompted.
