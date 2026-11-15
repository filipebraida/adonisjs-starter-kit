---
name: help
description: 'In-app help in an AdonisJS + Inertia app: Markdown articles versioned next to the module whose screens they explain, read in a Help center (global) or in a drawer opened by a screen''s "?" (local), filtered by the reader''s capabilities, in every locale. Markdown draws Mermaid diagrams, GitHub alerts and the article''s own images. Use when writing or changing a help article, adding a help space, putting a "?" on a screen, or debugging an article that does not show. Trigger on: "help article", "ajuda", "?", "HelpLink", "help space", "documentation for users".'
license: MIT
allowed-tools: Read, Edit, Write, Bash, Grep, Glob
---

# Help

The help is the system's documentation for the people who use it. The `help` module (`app/help/`) finds every space by convention, `app/<module>/help/<space>/index.json`; no module registers anything. A space is an `index.json` plus one Markdown file per article and locale, and optional images. The reader's capabilities filter everything: the navigation, previous/next, a direct visit and the images. An article the reader may not read answers exactly as one that does not exist.

## Rules

- **Content lives next to the screens it explains:** `app/<module>/help/<space>/` with `index.json`, `en/<file>.md`, `pt/<file>.md`, `images/<name>.png`. Slugs are English, `/^[a-z0-9]+(?:-[a-z0-9]+)*$/`.
- **`index.json`** declares the space (`slug`, `title`/`summary` per locale, `order`), its categories (`slug`, `title`, `order`) and its articles (`slug`, `title`, `summary`, `category`, `order`, `file`, optional `capability`, `updatedAt` as `YYYY-MM-DD`). It is validated on load; a bad index fails the specs.
- **Every article exists in every locale.** A spec fails otherwise. Write from what the screen does today, second person, short sentences, the screen's own labels in bold.
- **`capability`** hides an article from whoever lacks it; it must be one of `config/capabilities.ts` `vocabulary` (a spec checks).
- **Markdown:** `##` sections become "On this page" and anchors (GitHub's ids, accents kept); ` ```mermaid ` draws a diagram; `> [!NOTE]`, `[!TIP]`, `[!IMPORTANT]`, `[!WARNING]`, `[!CAUTION]` draw alerts; `![alt](images/x.png)` loads from the space (png, jpg, webp only). No raw HTML.
- **A screen's "?"** is a point in `app/help/enums/help_anchors.ts`: `'<module>.<point>': { space, article, section? }`, `section` being the `##` id in each locale. The page renders `<HelpLink anchor="<module>.<point>" />` in the `help` slot of `Heading` or `SettingsSection`; it renders nothing to someone who may not read the article.
- **`auth` never shows a "?"**: it imports only `core`. Any other module adds `'help'` to its `DEPENDENCIES` in `eslint.config.js`.

## Repo refs

- Module: `app/help/` (catalog `services/help_catalog.ts`, access `queries/resolve_help_access.ts`, routes `routes.ts`, pages `ui/pages/help/`, drawer `ui/components/help/help_panel.tsx`).
- Content: `app/users/help/account/`, `app/users/help/administration/` (Mermaid, alerts, an image).
- Markdown: `app/core/ui/components/markdown.tsx`, section ids `app/core/utils/markdown_sections.ts`.
- On the design board: `apps/storybook/stories/screens/help.stories.tsx` (real articles), settings and users stories (the drawer).

## Workflow

1. Write or edit the Markdown in every locale; add the article to `index.json` (bump `updatedAt`).
2. A screen point: add the anchor to `HELP_ANCHORS`, then `<HelpLink anchor="…" />` in the screen's `Heading`/`SettingsSection`.
3. Run the help specs: `node ace test unit --files="app/help/tests/unit"` (content in both locales, images, capabilities, anchors), then `pnpm test`.
4. Look at it: `pnpm storybook`, Screens / Help, in both themes and both languages.

## Anti-patterns

- ❌ An article in one locale only — the content spec fails; write both.
- ❌ A capability string that no role can be given — the article is invisible to everyone.
- ❌ Renaming a `##` heading an anchor points at without updating its `section` — the anchors spec fails.
- ❌ An image from outside the space (`https://…`) — it renders as a link, never loaded.
- ❌ Explaining the code to the reader — the help is for people using the screens; the docs for developers live elsewhere.

## Related skills

[[i18n]] · [[authorization]] · [[layout-shells]] · [[inertia]]
