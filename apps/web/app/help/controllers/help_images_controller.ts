import { existsSync } from 'node:fs'

import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'

import HelpPolicy from '#help/policies/help_policy'
import ResolveHelpAccess from '#help/queries/resolve_help_access'
import HelpCatalog from '#help/services/help_catalog'

/**
 * A picture of a help space, to whoever may read at least one of its articles. Only a plain
 * picture name of the space's `images/` folder is served (`HelpCatalog.imageOf`).
 */
@inject()
export default class HelpImagesController {
  constructor(
    private catalog: HelpCatalog,
    private access: ResolveHelpAccess
  ) {}

  async handle({ auth, bouncer, params, response }: HttpContext) {
    await bouncer.with(HelpPolicy).authorize('view')
    const spaces = await this.catalog.spaces()
    const space = spaces.find((candidate) => candidate.slug === params.space)
    const file = space ? HelpCatalog.imageOf(space, params.file) : null
    // A picture an `<img>` asked for: a bare 404, never an error flashed for the
    // next page. The refusals that need no permission check come first.
    if (!space || !file || !existsSync(file)) return response.notFound('')
    const access = await this.access.handle(auth.getUserOrFail(), spaces)
    if (!HelpCatalog.opening(space, access)) return response.notFound('')

    response.header('x-content-type-options', 'nosniff')
    response.header('cache-control', 'private, max-age=3600')
    return response.download(file)
  }
}
