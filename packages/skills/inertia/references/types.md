# Generated types and transformers

These files are **generated** by the assembler hooks in `adonisrc.ts` and **committed** (CI runs `pnpm ace codegen` and fails if `.adonisjs/` would change). Never edit them by hand; regenerate with `pnpm ace codegen` or by running the dev server.

| File                              | Contents                                                                   | Generator                                                |
| --------------------------------- | -------------------------------------------------------------------------- | -------------------------------------------------------- |
| `.adonisjs/client/data.d.ts`      | Types extracted from transformers (`Data.*` namespace), `Data.SharedProps` | `indexEntities` (transformers, `withSharedProps`)        |
| `.adonisjs/client/registry/`      | Route registry behind `urlFor`, `<Link route>`, `<Form route>`             | `generateRegistry()` (`@tuyau/core/hooks`)               |
| `.adonisjs/server/controllers.ts` | `controllers.<mod>.<Name>` used by every `routes.ts`                       | `indexEntities` (controllers)                            |
| `.adonisjs/server/pages.d.ts`     | `InertiaPages` — page props extracted from the TSX                         | `indexAppUiPages` (`app/core/hooks/index_pages_hook.ts`) |

Naming is wiring: only `*_transformer.ts` and `*_controller.ts` files are indexed; another suffix is silently absent.

## `Data.*` — transformer namespace

`app/<mod>/transformers/<entity>_transformer.ts` generates `Data.<Mod>.<Entity>` (module folder and file name without `_transformer`, in PascalCase), plus `Data.<Mod>.<Entity>.Variants['for<Screen>']` for each variant. `app/users/transformers/user_transformer.ts` → `Data.Users.User`, `Data.Users.User.Variants['forList']`.

```tsx
import type { Data } from '@generated/data'

type Props = { users: Data.Users.User.Variants['forList'][] }
```

## Creating a transformer

A `BaseTransformer<Model>` subclass, default export, with `toObject()` as the base and one `for<Screen>` variant per screen (the lint checks the variant names):

```ts
// app/<mod>/transformers/<entity>_transformer.ts
import { BaseTransformer } from '@adonisjs/core/transformers'

import type Entity from '#<mod>/models/entity'

export default class EntityTransformer extends BaseTransformer<Entity> {
  toObject() {
    return { id: this.resource.id, name: this.resource.name }
  }

  forList() {
    return { ...this.toObject(), createdAt: this.resource.createdAt.toISO()! }
  }
}
```

Consumers: `EntityTransformer.transform(entity).useVariant('forEdit')`, `EntityTransformer.paginate(rows, meta).useVariant('forList')`. A transformer never queries — the controller or the query loads relations first.

## After creating or changing a transformer

If `Data.<Mod>.<Entity>` doesn't show up or is stale:

1. Run `pnpm ace codegen` (or restart the dev server) — `pnpm typecheck` reads `.adonisjs/` as it is and does not regenerate it.
2. Confirm the file is `app/<mod>/transformers/<entity>_transformer.ts` with a default export.
3. Commit the regenerated `.adonisjs/` files with the change.

## Page typing (`pages.d.ts`)

`indexAppUiPages` scans every file under `app/*/ui/pages/` and types each page's props from its default export:

```ts
declare module '@adonisjs/inertia/types' {
  export interface InertiaPages {
    'users/index': ExtractProps<(typeof import('../../app/users/ui/pages/index.tsx'))['default']>
  }
}
```

**Effect**: `inertia.render('users/index', props)` is type-checked — a wrong or missing prop is a compile error. That's why each page has a single `export default function Page(props: PageProps)`.

## `InertiaProps<T>`

`app/core/ui/app/types.ts`:

```ts
export type InertiaProps<T extends JSONDataTypes = {}> = PropsWithChildren<Data.SharedProps & T>
```

- `Data.SharedProps` comes from the middleware's `share()` (`InferSharedProps<InertiaMiddleware>`).
- The same file types `usePage().props` and `usePage().flash` for `@inertiajs/core`.

## Gotchas

- **Never** pass a Lucid model to `inertia.render` — its type is not in `Data.*` and internal fields leak.
- "`Data.X.Y` does not exist" is almost always a stale `.adonisjs/` or a transformer without a default export.
- A CI failure on `.adonisjs/` drift means a codegen run was not committed.

## Supporting docs

- Inertia TypeScript: https://inertiajs.com/docs/v3/advanced/typescript
- Code: `app/core/hooks/index_pages_hook.ts`, `app/core/ui/app/types.ts`.
