---
name: i18n
description: 'i18n patterns for an AdonisJS + Inertia app. Keys namespaced by module, `useTranslation()` on the frontend and `ctx.i18n.t(...)` on the backend, locale persisted per user with a cookie fallback. Every new key needs an entry in every supported locale JSON. Use when adding UI strings, wiring a new module''s translations, or debugging locale detection. Trigger on: "add translation", "i18n", "locale", "translate", "add key".'
license: MIT
allowed-tools: Read, Edit, Write, Bash, Grep, Glob
---

# i18n

Locales are declared in `config/i18n.ts` (`supportedLocales`, `defaultLocale`, `loaders`). Translation JSON lives per module at `app/<mod>/resources/lang/<locale>/<mod>.json`. Keys are namespaced by module (`common.layout.navMain.dashboard`), so the file at `app/common/resources/lang/en/common.json` doesn't repeat `common.` inside — the loader adds it. Backend uses `ctx.i18n.t('key')`; frontend uses `useTranslation()`. Locale detection runs as an HTTP middleware that prefers an `X-User-Language` header → a `user-locale` cookie → the browser's `Accept-Language`. Authenticated users have `User.locale` as the authoritative source: the switch endpoint writes both cookie and DB; every login flow syncs the cookie from `user.locale` if set.

## Rules

- **Adding a key requires an entry in every supported locale**. There is no auto-generate. Missing keys fall back to the default locale at runtime — the mixed-language UI is the symptom.
- **Key naming**: `<mod>.<section>.<key>`. The `<mod>` prefix comes from the file location; inside `<mod>.json` you don't repeat it. E.g. inside `common.json`:
  ```json
  { "layout": { "navMain": { "dashboard": "Dashboard" } } }
  ```
  and consumed as `t('common.layout.navMain.dashboard')`.
- **Frontend**: `useTranslation()` returns `{ t, changeLanguage, language }`. `t(key, params?)` supports ICU interpolation.
- **Backend**: `ctx.i18n.t('key', params?)`. The i18n instance is bound to `HttpContext` by the locale-detection middleware. Use in controllers, actions (if `i18n` was in the input), and mail classes.
- **ICU interpolation**: `{name}` in the string, `t('key', { name: 'Alice' })` at the call site. Also supports plurals and selectors.
- **Validation messages**: VineJS uses the request's i18n instance through the messages provider bound in the locale-detection middleware. Localize by adding keys under `<field>.<rule>` in `<mod>/resources/lang/<locale>/validator.json`.
- **User preference**: `User.locale` is a nullable column. When authenticated, the switch endpoint updates both the cookie and `user.locale`. Login flows sync `user-locale` cookie from `user.locale` if set. Pre-login (marketing/auth pages) uses cookie / `Accept-Language`, never DB.
- **Locale switcher UI**: `<LanguageSwitcher />` lives in every logged-in shell — see [[layout-shells]].
- **Adding a locale** means updating `supportedLocales` in `config/i18n.ts`, adding a folder under every module's `resources/lang/`, and confirming every key exists in the new locale.

## Repo refs

- Locale config + per-module loaders: `config/i18n.ts`. Keys: `app/users/resources/lang/{en,fr,pt}/users.json`.
- Frontend hook: `app/common/ui/hooks/use_translation.ts`. Detection middleware: `app/core/middleware/detect_user_locale_middleware.ts`.

## Doc refs

- AdonisJS i18n — https://docs.adonisjs.com/guides/digging-deeper/i18n
- ICU message format — https://docs.adonisjs.com/guides/digging-deeper/i18n#icu-message-format
- Translating validator errors — https://docs.adonisjs.com/guides/digging-deeper/i18n#translating-validation-messages

## Workflow

### Add a translation key

1. Pick the module. If the string is shared UI (nav, buttons, layout), put it in `common`.
2. Open the JSON file for every supported locale: `app/<mod>/resources/lang/<locale>/<mod>.json`.
3. Add the same key path in every file with the localized value.
4. Frontend: `t('<mod>.<path>')` via `useTranslation()`.
5. Backend: `ctx.i18n.t('<mod>.<path>')`.
6. Verify parity: grep the key across `app/<mod>/resources/lang/*/` — it must appear in all three locales. Present in only one → it falls back silently and ships a mixed-language UI.

### Add a new module's translations

1. Create `app/<mod>/resources/lang/<locale>/<mod>.json` for every supported locale.
2. Add an `fs` loader entry in `config/i18n.ts`:
   ```ts
   loaders.fs({ location: app.makePath('app/<mod>/resources/lang') }),
   ```
3. The frontend glob picks the files up automatically.

### Interpolation

```json
{ "welcome": "Welcome, {name}!" }
```

```ts
t('common.welcome', { name: user.fullName })
```

Plural / selector:

```json
{ "items": "{count, plural, =0 {No items} one {# item} other {# items}}" }
```

### Localize a validator message

Add to `app/<mod>/resources/lang/<locale>/validator.json`:

```json
{ "required": "This field is required" }
```

VineJS looks these up automatically because the messages provider is bound in the locale-detection middleware.

### Set a user's default locale programmatically

Use during invite / sign-up when the target's language is known:

```ts
await User.create({ email, locale: 'pt' })
```

The next login flow writes the cookie for them.

## Anti-patterns

- ❌ Adding a key in one locale but not the others — runtime falls back silently to the default and users see mixed languages.
- ❌ Hardcoding strings in components (`<span>Save</span>` instead of `t('common.save')`).
- ❌ Reading `req.cookies['user-locale']` directly instead of `ctx.i18n.locale` — bypasses the detection priority (header → cookie → Accept-Language).
- ❌ Persisting locale to the cookie without also updating `user.locale` when the user is authenticated — the switch endpoint handles both; don't reimplement.
- ❌ Deep key paths (`common.a.b.c.d.e.f`) — collapse the JSON tree, keep depth ≤ 3.
- ❌ Repeating the module prefix inside the JSON file (`common.json` with a `common` root) — the loader adds it.

## Related skills

[[inertia]] · [[layout-shells]] · [[mail]] · [[crud]] · [[module-scaffolding]]
