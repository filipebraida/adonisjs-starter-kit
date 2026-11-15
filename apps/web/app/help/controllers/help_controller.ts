import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'

import { helpLocaleOf } from '#help/enums/help_locale'
import HelpPolicy from '#help/policies/help_policy'
import ResolveHelpAccess from '#help/queries/resolve_help_access'
import HelpCatalog from '#help/services/help_catalog'
import HelpSpaceTransformer from '#help/transformers/help_space_transformer'

/** The help's entry: the spaces the person may read; with only one, it opens it. */
@inject()
export default class HelpController {
  constructor(
    private catalog: HelpCatalog,
    private access: ResolveHelpAccess
  ) {}

  async index({ auth, bouncer, i18n, inertia, response }: HttpContext) {
    await bouncer.with(HelpPolicy).authorize('view')
    const all = await this.catalog.spaces()
    const access = await this.access.handle(auth.getUserOrFail(), all)
    const spaces = all.filter((space) => HelpCatalog.opening(space, access))

    if (spaces.length === 1) {
      return response.redirect().toRoute('help.space', { space: spaces[0].slug })
    }

    const locale = helpLocaleOf(i18n.locale)
    return inertia.render('help/help/index', {
      spaces: HelpSpaceTransformer.transform(spaces.map((space) => ({ space, access, locale }))),
    })
  }
}
