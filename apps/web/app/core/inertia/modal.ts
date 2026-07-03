import type { HttpContext } from '@adonisjs/core/http'
import type { Backdrop, ModalProps, ModalResponse } from 'adonis-inertia-modal'

/**
 * Wrapper for `ctx.inertia.modal(...)`.
 *
 * The `.modal()` method is added to the Inertia instance at runtime by
 * `adonis-inertia-modal`'s provider, and its TypeScript augment lives in
 * that provider's `.d.ts`. In this project's `app/core/ui/tsconfig.json`,
 * the compiler pulls controllers in transitively (via `pages.d.ts`) but
 * the cross-package `interface Inertia<Pages>` augment does not merge
 * against the class declared in `@adonisjs/inertia` — so calling
 * `inertia.modal(...)` directly fails typecheck there.
 *
 * This helper contains a single cast so controllers stay clean. If the
 * upstream library changes its `configure` step to emit a project-side
 * stub (the pattern `@adonisjs/bouncer` uses), delete this file and
 * inline `inertia.modal(...)` at call sites.
 */
export function modal(
  inertia: HttpContext['inertia'],
  component: string,
  props: ModalProps,
  backdrop: Backdrop
): ModalResponse {
  const proxy = inertia as unknown as {
    modal(component: string, props: ModalProps, backdrop: Backdrop): ModalResponse
  }
  return proxy.modal(component, props, backdrop)
}
