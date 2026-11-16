---
name: design-board
description: 'The design board (Storybook, apps/storybook) is the contract between a design and the code: a prototype (Claude Design, an HTML export, a screenshot) is translated into stories built from the starter''s own pieces, one per state, reviewed there, and only then implemented. Use when bringing a prototype into the app, building or changing a screen, adding a component the board lacks, or writing a story''s play. Trigger on: "prototype", "protótipo", "Claude Design", "bring to the board", "prancha", "storybook", "story", "new screen", "design".'
license: MIT
allowed-tools: Read, Edit, Write, Bash, Grep, Glob
---

# Design board

`apps/storybook` renders the app's real pages and pieces, each state a story, with fake data and a fake server (MSW). It is where a screen is designed and approved, before any backend exists. A story is typed by its page's props (`OwnProps<P>`), so once the page exists the board cannot drift from it, and `pnpm test:stories` runs every story in Chromium (CI too).

A prototype is never copied into the app. It is a statement of what the screen does and roughly how it looks; the board says how it is built.

## The flow

```
prototype ──► stories on the board ──► the person approves ──► page + backend ──► CI keeps them together
```

### 1. Read the prototype

- **A claude.ai artifact link:** read it with the Artifact tool (`action: "read"`), never by fetching the URL.
- **An exported HTML file:** read the file; note its structure and texts, ignore its CSS and markup.
- **A screenshot:** read the image.

Write down, before touching code: what the screen is for, who sees it (which capability), its parts (header, filters, list, form, side panel…), every action and which one is primary, and every state the prototype shows or implies.

### 2. Read the rules, then map each part to a piece

Read `stories/foundations/foundations.mdx`, `stories/forms/rules.mdx` and `stories/content/list_page.stories.tsx`. Then map each part of the prototype to what exists, in this order:

1. A page of the app with the same shape (copy it: the users list, settings, roles, the help index).
2. `#core/ui/*` wrappers: `Main` (`full` / `column` / `reading`), `Heading`, `SettingsSection`, `DataTable`, `Form`/`Field`, `HelpLink`.
3. `@workspace/ui/*` primitives with their variants (`Button`, `Card`, `Empty`, `Segmented`, `Sheet`, `Dialog`, `Badge`…).

What has no match is a **missing piece**: add it to `packages/ui` (or `#core/ui`) with a story under `stories/forms` or `stories/content` first, then use it. A different shape of an existing piece is a variant there, never a `className` on the page.

### 3. Build the stories

- One file in `stories/screens/<screen>.stories.tsx`; the page rendered with `inertiaPage(Page, { component, url, as, props })`, as `users_index.stories.tsx` does.
- **One story per state**: with data, empty (first use, with the next action), no match, no permission (`as: "user"`), long text (a 60-character name, many rows), errors on a form, and any state the prototype shows.
- Every visit the screen makes on itself (search, sort, a page, saving) is answered with `inertiaRoute(path, Page, respond, method?)` in the story's `beforeEach`. A link to another screen is not answered: the board shows "Not on the board".
- An interaction the person cares about becomes the story's `play` (`userEvent`, `expect`): it is the acceptance test of the screen.
- Texts through i18n keys in `en` and `pt` from the start.

### 4. Report and stop

Before implementing anything, tell the person, in their language:

- the stories to open (`pnpm storybook`, Screens / …), to check in both themes and both languages;
- the pieces added to the board;
- **every departure from the prototype and why** (two primary buttons became one; a colour that carried no state; a custom card that is now `Card`), and anything the rules could not settle.

The person approves on the board. Changing a story costs nothing; changing a built backend does.

### 5. Implement

Only after approval. The story's props are the page's contract: the controller and its transformer variant produce exactly them (see [[crud]], [[queries]], [[inertia]]). The typecheck fails while page and story disagree; keep the story compiling, never loosen its types. Then `pnpm typecheck && pnpm lint`, `pnpm test:stories`, `pnpm test`.

## Repo refs

- Board config: `apps/storybook/.storybook/{main.ts,preview.tsx}`; tests: `apps/storybook/vitest.config.ts`.
- Helpers: `apps/storybook/src/inertia_page.tsx` (`inertiaPage`, `inertiaRoute`, `SIGNED_IN`, `OwnProps`), `src/help_server.ts`.
- Rules: `stories/foundations/foundations.mdx`, `stories/forms/rules.mdx`, `stories/content/list_page.stories.tsx`.
- Screens: `stories/screens/users_index.stories.tsx` (fake server + a `play`), `settings.stories.tsx` (a `post` answered), `help.stories.tsx`.

## Anti-patterns

- ❌ Pasting the prototype's HTML or Tailwind classes into a page — rebuild it from the pieces.
- ❌ Implementing the backend before the stories are approved.
- ❌ Only the happy-path story — every state is designed.
- ❌ A new look through `className` on the page — it becomes a variant or a piece on the board.
- ❌ Answering links to other screens in a story — the board shows screens, it does not navigate between them.
- ❌ Silently "fixing" the prototype — every departure goes in the report.

## Related skills

[[crud]] · [[inertia]] · [[queries]] · [[layout-shells]] · [[i18n]] · [[help]]
