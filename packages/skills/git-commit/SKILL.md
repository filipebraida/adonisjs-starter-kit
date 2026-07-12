---
name: git-commit
description: 'Execute a git commit that follows semantic conventional-commits — type, optional scope, imperative subject in English under 70 chars, body explaining WHY. User-invoked via /git-commit or "/commit".'
disable-model-invocation: true
license: MIT
allowed-tools: Bash
---

# Git Commit

Create semantic git commits that match the existing history in this repo. Analyze the actual diff to pick the right type, an optional scope, and a subject that reads well next to `git log --oneline`. Body explains the **why** — the diff already shows the what.

## Commit format

```
<type>(<optional-scope>): <imperative subject>

[optional body — WHY, not WHAT]

[optional footer(s)]
```

- **Subject**: imperative mood, English, ≤ 70 characters. No trailing period.
- **Scope**: the single module or package most affected. Omit when the change is cross-cutting.
- **Body**: explain motivation (constraint, incident, decision). The diff already shows what.
- **Footers**: `Closes #123`, `BREAKING CHANGE: …`, etc.

## Commit types

| Type       | When                                                         |
| ---------- | ------------------------------------------------------------ |
| `feat`     | New user-visible capability                                  |
| `fix`      | Bug fix (behavior was wrong, now correct)                    |
| `refactor` | Internal change, same behavior                               |
| `test`     | Add or adjust tests                                          |
| `db`       | Schema / migration change                                    |
| `ci`       | Pipeline, actions, coverage, release plumbing                |
| `chore`    | Housekeeping (deps, config, tooling) that isn't `ci` or `db` |
| `docs`     | Docs-only change                                             |
| `style`    | Formatting only (no logic)                                   |
| `perf`     | Change motivated by a measurable performance win             |

## Scopes

Only use a scope when the change clearly centers on **one** area. Common shapes:

- Domain module: name of the module the diff sits in (`auth`, `users`, `<feature>`).
- Monorepo package: name of the package (`ui`, `eslint-config`, `typescript-config`, `skills`).
- Cross-cutting infrastructure (docker, CI, tooling at the repo root): usually no scope.

If the diff spans several modules or packages without a clear center, omit the scope entirely.

## Breaking changes

Two forms — pick one, not both:

```
# Exclamation mark after type/scope
feat!: drop legacy /v1 endpoints

# Or a BREAKING CHANGE footer at the bottom of the body
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

- Stage by explicit path (`git add path/to/file`), not `git add -A` or `git add .`.
- Never stage secrets (`.env`, credentials, tokens, keys).
- Never stage unrelated in-flight work — split into separate commits if needed.

### 3. Check code health (when applicable)

Before proposing a commit that touches TS/TSX under an app or a package:

```bash
pnpm typecheck
pnpm lint
pnpm test        # when the change is testable
```

Skip for docs-only, config-only, asset-only, or pure renames.

### 4. Draft the message

- **Type**: which semantic type best describes the change?
- **Scope**: is one module or package clearly the focus? If not, omit.
- **Subject**: one imperative-mood line in English, ≤ 70 chars, no trailing period.
- **Body**: only if the diff doesn't already speak for itself — explain the WHY (motivation, constraint, past incident, decision that isn't obvious). Wrap at ~72 chars.

### 5. Commit

Single line:

```bash
git commit -m "<type>(<scope>): <subject>"
```

Multi-line body — use HEREDOC to preserve formatting:

```bash
git commit -m "$(cat <<'EOF'
<type>(<scope>): <subject>

<body — why this change, not what>

<footers>
EOF
)"
```

## Repo conventions

- **Do not** add `Co-Authored-By` or coauthor trailers unless the user explicitly requests them.
- Avoid emojis unless the user asks for them.

## Git safety protocol

- Never edit git config.
- Never run destructive commands (`--force`, `reset --hard`, `clean -f`, `branch -D`) without an explicit request.
- Never skip hooks (`--no-verify`) unless the user asks.
- Never force-push to `main` / `master`.
- Prefer new commits over `--amend`. If a pre-commit hook fails, fix the underlying issue and create a **new** commit — the previous commit didn't happen, so amending would edit an unrelated older commit.
- Never commit or push unprompted.

## Anti-patterns

- ❌ `chore: various changes` — vague; split by intent.
- ❌ `fix: fix bug` — subject repeats the type. Say what was wrong.
- ❌ Past tense (`added button`) — use imperative (`add button`).
- ❌ Subject describing the file (`update index.ts`) — describe the behavior change.
- ❌ Body restating the diff line-by-line — the body explains the reason, not the code.
- ❌ Multiple unrelated changes in one commit — impossible to revert cleanly later.
- ❌ Bare `git add -A` when unrelated files are dirty — stage by path.
