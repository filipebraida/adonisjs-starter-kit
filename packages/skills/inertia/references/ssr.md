# Selective SSR

SSR is enabled in `config/inertia.ts`, but only runs for pages the allowlist in `config/ssr.ts` accepts: `SSR_ROUTES` is a list of page-name prefixes (the module, today `marketing` and `auth`) read by `isSSREnableForPage`.

```ts
// config/inertia.ts
ssr: {
  enabled: true,
  entrypoint: 'app/core/ui/app/ssr.tsx',
  pages: (_, page) => isSSREnableForPage(page),
},
```

**Why selective:** SSR costs CPU and memory; it pays off only where SEO, time-to-content or link previews matter.

- **SSR yes** for public, indexable pages (landing).
- **SSR no** for authenticated pages (dashboards, CRUD, admin).
- The auth screens are in the allowlist for a fast first paint; keep them free of browser-only code.

## Enabling SSR for a new page

1. Add the module prefix to `SSR_ROUTES` in `config/ssr.ts` (or narrow `isSSREnableForPage` to the page name).
2. Run the page in dev and check `view-source:` — the HTML must already be rendered, not just the root `<div>`.
3. Make sure the page does not touch browser APIs at module top level (below).

## Classic SSR gotchas

### 1. `window`, `document`, `localStorage` at module top level

They break in Node:

```tsx
// ❌ breaks in SSR
const theme = localStorage.getItem('theme')

// ✅
useEffect(() => {
  const theme = localStorage.getItem('theme')
}, [])
```

### 2. Different providers between `app.tsx` and `ssr.tsx`

`app/core/ui/app/app.tsx` wraps the tree in i18n, theme, tooltip, Tuyau and the modal stack; `app/core/ui/app/ssr.tsx` only in i18n, Tuyau and the modal stack. A page on the allowlist that needs the theme or a tooltip provider must get it on the SSR side too, or render that piece only on the client. A mismatch shows up as a silent hydration warning.

### 3. Libraries that assume the browser

Any library that reads `window` at import time breaks SSR: import it dynamically inside `useEffect`, or use a server-safe build.

### 4. Hydration mismatch

Server HTML ≠ first client render. Common causes: `Date.now()` / `Math.random()` during render, `localStorage` / `document.cookie` during render, `navigator` without a guard. A time formatted during render can differ too: the server and the browser may sit in different time zones.

### 5. `defer` does not work with SSR

`inertia.defer(...)` needs a client follow-up request, so the data is **not** in the first HTML. Use synchronous data on SSR pages.

### 6. i18n

Both entries instantiate i18next from the `locale` / `fallbackLocale` shared props, so translations are in the initial HTML. A new provider follows the same pattern (read the initial page props in `setup`).

### 7. Tests

A functional spec that requests the full HTML of an SSR page boots Vite, whose watchers keep the test process alive. Use `.withInertia()` (see the `testing` skill).

## Turning SSR off to debug

Return `false` for the suspicious page in `isSSREnableForPage`, or `ssr.enabled: false` in `config/inertia.ts` — local dev only.

## Watch the log

`config/inertia.ts` logs at debug level on each request: `Page "marketing/show" SSR enabled: true` — useful to confirm the allowlist matches.

## SSR entrypoint

`app/core/ui/app/ssr.tsx` renders with `ReactDOMServer.renderToString`. Don't switch to `renderToPipeableStream` without adjusting the AdonisJS side — the integration expects a string.

## Official docs

https://inertiajs.com/docs/v3/advanced/server-side-rendering
