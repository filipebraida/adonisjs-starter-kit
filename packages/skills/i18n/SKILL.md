---
name: i18n
description: 'i18n patterns for this repo — three locales (en/fr/pt), keys namespaced by module, `useTranslation()` on the frontend and `ctx.i18n.t(...)` on the backend, locale persisted per user with a cookie fallback. Every new key needs entries in all three JSON files. Use when adding UI strings, wiring a new module''s translations, or debugging locale detection. Trigger on: "add translation", "i18n", "locale", "translate", "add key".'
license: MIT
allowed-tools: Read, Edit, Write, Bash, Grep, Glob
---

# i18n

Three locales — `en`, `fr`, `pt` — configured in `config/i18n.ts`. Translation JSON lives per module at `app/<mod>/resources/lang/<locale>/<mod>.json`. Keys are namespaced by module (`common.layout.navMain.dashboard`), so a `common` module's file has no `common.` prefix inside — the loader adds it. Backend uses `ctx.i18n.t('key')`; frontend uses `useTranslation()`. Locale detection runs in a middleware that prefers `X-User-Language` header → `user-locale` cookie → `Accept-Language`. Authenticated users have `User.locale` as the authoritative source — the switch endpoint persists to DB and syncs the cookie; login flows sync the cookie from `user.locale`.

## Conventions

- **Locales**: `en`, `fr`, `pt`. Default is `en`. Adding a fourth means updating `config/i18n.ts` supportedLocales, adding a new folder under every module's `resources/lang/`, and confirming keys exist in that locale.
- **Adding a key requires updates in all three locales**. There is no auto-generate. Missing keys fall back to `en` at runtime.
- **Key naming**: `<mod>.<section>.<key>`. E.g., `users.action.create.title`. The `<mod>` prefix comes from the file location — inside `app/common/resources/lang/en/common.json` you write:
  ```json
  { "layout": { "navMain": { "dashboard": "Dashboard" } } }
  ```
  and read on the frontend as `t('common.layout.navMain.dashboard')`.
- **Frontend**: `import { useTranslation } from '#common/ui/hooks/use_translation'` — returns `{ t, changeLanguage, language }`. `t(key, params?)` supports ICU interpolation.
- **Backend**: `ctx.i18n.t('key', params?)`. The i18n instance is bound to the HttpContext by `DetectUserLocaleMiddleware`. Use in controllers, actions (if `i18n` was in the input), and mail classes.
- **ICU interpolation**: `{name}` in the string, `t('key', { name: 'Alice' })` at the call site. Also supports plurals, selectors, dates.
- **Validation messages**: VineJS uses the request's i18n instance via `RequestValidator.messagesProvider` (set once in `DetectUserLocaleMiddleware`). Localize by adding keys under `validator.<field>.<rule>` in `<mod>/resources/lang/<locale>/validator.json` (see AdonisJS docs).
- **User preference**: `User.locale` is a nullable column. When authenticated:
  - `/switch/:locale` writes cookie AND persists to `user.locale`.
  - Every login flow (`sign_in`, `sign_up`, social) syncs `user-locale` cookie from `user.locale` if set.
  - Pre-login (auth pages, marketing) uses cookie / `Accept-Language` — no DB.
- **Locale switcher UI**: `<LanguageSwitcher />` is already in every logged-in shell — see [[layout-shells]].

## Repo refs

- Backend config: `apps/web/config/i18n.ts` — supportedLocales, default, loaders (one `loaders.fs` per module).
- Frontend config (Vite-glob-loaded resources): `apps/web/app/core/ui/config/i18n.config.ts` (`buildResources`).
- Detect middleware: `apps/web/app/core/middleware/detect_user_locale_middleware.ts` — header → cookie → Accept-Language priority.
- Switch endpoint + DB sync: `apps/web/app/common/middlewares/switch_locale_middleware.ts` (persists to `user.locale` when authenticated).
- Cookie helper: `apps/web/app/common/services/user_locale.ts`.
- Login-time cookie sync: `apps/web/app/auth/controllers/sign_in_controller.ts` (`setUserLocaleCookie(response, user.locale)`).
- Frontend hook: `apps/web/app/common/ui/hooks/use_translation.ts`.
- Switcher component: `apps/web/app/common/ui/components/language_switcher.tsx`.
- JSON examples: `apps/web/app/common/resources/lang/{en,fr,pt}/common.json`, `apps/web/app/users/resources/lang/{en,fr,pt}/users.json`.

## Doc refs

- AdonisJS i18n — https://docs.adonisjs.com/guides/digging-deeper/i18n
- ICU message format — https://docs.adonisjs.com/guides/digging-deeper/i18n#icu-message-format
- Translating validator errors — https://docs.adonisjs.com/guides/digging-deeper/i18n#translating-validation-messages
- i18next-icu — https://www.i18next.com/misc/creating-own-plugins

## Workflow

### Add a translation key

1. Pick the module. If it's a shared UI string, prefer `common`.
2. Open all three JSON files: `app/<mod>/resources/lang/{en,fr,pt}/<mod>.json`.
3. Add the same key path in every file with the localized value.
4. On the frontend, call `t('<mod>.<path>')` from `useTranslation()`.
5. On the backend, call `ctx.i18n.t('<mod>.<path>')`.

### Add a new module's translations

1. Create `app/<mod>/resources/lang/{en,fr,pt}/<mod>.json` (three files, matching keys).
2. Add a loader to `config/i18n.ts`:
   ```ts
   loaders.fs({ location: app.makePath('app/<mod>/resources/lang') }),
   ```
3. Frontend picks the files up automatically via the Vite glob in `core/ui/config/i18n.config.ts`.

### Interpolation

```json
{ "welcome": "Welcome, {name}!" }
```
```ts
t('common.welcome', { name: user.fullName })
```

Plural / select:
```json
{ "items": "{count, plural, =0 {No items} one {# item} other {# items}}" }
```

### Localize a validator message

Add to `app/<mod>/resources/lang/<locale>/validator.json`:
```json
{ "required": "This field is required" }
```

VineJS looks these up automatically because the messagesProvider is bound in `DetectUserLocaleMiddleware`.

### Set a user's default locale programmatically

Use it during invite / sign-up when you know the target's language:
```ts
await User.create({ email, locale: 'pt' })
```

Next login flow will write the cookie for them.

## Anti-patterns

- ❌ Missing keys in one of the three locales — runtime falls back to `en` silently and users see English mixed in.
- ❌ Hardcoding strings in components (`<span>Save</span>` instead of `t('common.save')`).
- ❌ Reading `req.cookies['user-locale']` directly instead of `ctx.i18n.locale`.
- ❌ Persisting locale to the cookie without also updating `user.locale` on authenticated users — the switch middleware handles both; don't reimplement.
- ❌ Deep key paths (`common.a.b.c.d.e.f.g`) — collapse the JSON tree, keep depth ≤ 3.

## Related skills

[[inertia]] · [[layout-shells]] · [[mail]] · [[crud]] · [[module-scaffolding]]
