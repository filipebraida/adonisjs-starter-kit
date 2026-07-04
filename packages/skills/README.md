# AI Skills

A collection of skills for AI coding assistants (Claude Code, OpenCode, Cursor, etc.) tuned to the conventions of this starter kit.

## Available Skills

- `git-commit` — semantic commits following this repo's `AGENTS.md` conventions (see [`git-commit/SKILL.md`](./git-commit/SKILL.md)).
- `module-scaffolding` — how to add a new `app/<mod>/` module end-to-end (alias, preload, migration paths).
- `crud` — build a resource CRUD stack (route → controller → validator → policy → action → transformer → Inertia page).
- `actions-events` — action pattern (`.handle(input)`) and event-based side effects.
- `testing` — Japa functional + unit patterns (transactions, fakes, sinon, factories).

## Structure

This package follows the [Vercel Skills](https://github.com/vercel-labs/skills) repository format.

Each skill lives in its own directory inside `packages/skills/`:

```text
packages/skills/
  README.md
  package.json
  my-skill/
    SKILL.md
    references/   # optional supporting docs the SKILL.md links to
    workflows/    # optional step-by-step recipes
```

Every skill must contain a `SKILL.md` file with YAML frontmatter:

```md
---
name: my-skill
description: What this skill does and when to use it.
license: MIT
allowed-tools: Read, Edit, Bash # optional, restrict tools the skill may call
---

# My skill

...
```

## Installation

Install skills using the [`skills`](https://github.com/vercel-labs/skills) CLI:

```bash
# Install the CLI
npx skills

# List available skills from this monorepo package
npx skills add ./packages/skills --list

# Install all skills globally (all agents)
npx skills add ./packages/skills --global --all

# Install a specific skill
npx skills add ./packages/skills --skill git-commit

# Install to a specific agent
npx skills add ./packages/skills --agent claude-code
```

## Installation Options

| Flag           | Description                                                        |
| -------------- | ------------------------------------------------------------------ |
| `-g, --global` | Install to user directory (`~/[agent]/skills/`) instead of project |
| `-a, --agent`  | Target specific agent (e.g., `claude-code`, `cursor`)              |
| `-s, --skill`  | Install specific skill by name (use `*` for all)                   |
| `-l, --list`   | List available skills without installing                           |
| `-y, --yes`    | Skip confirmation prompts                                          |
| `--all`        | Install all skills to all agents                                   |

## Installation Scope

- **Project** (default): installs to `./[agent]/skills/` — commit these to share with collaborators.
- **Global** (`-g`): installs to `~/[agent]/skills/` — available across all your projects.

## Authoring a new skill

1. Create a folder under `packages/skills/<name>/`.
2. Write `SKILL.md` with YAML frontmatter (`name`, `description`, optionally `allowed-tools`).
3. Keep the SKILL.md as the entry-point index. Put deeper material under `references/` and link to it from the SKILL.
4. Add the skill to the list at the top of this README.
