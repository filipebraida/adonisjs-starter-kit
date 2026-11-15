import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'

import { helpLocaleOf } from '#help/enums/help_locale'
import HelpArticleNotFoundException from '#help/exceptions/help_article_not_found_exception'
import HelpPolicy from '#help/policies/help_policy'
import ReadHelpArticle from '#help/queries/read_help_article'
import ResolveHelpAccess from '#help/queries/resolve_help_access'
import HelpCatalog from '#help/services/help_catalog'

/** A help article as JSON, for the side panel a screen's "?" opens without leaving the screen. */
@inject()
export default class HelpArticleContentController {
  constructor(
    private catalog: HelpCatalog,
    private access: ResolveHelpAccess
  ) {}

  async handle({ auth, bouncer, i18n, params, response }: HttpContext) {
    await bouncer.with(HelpPolicy).authorize('view')
    const spaces = await this.catalog.spaces()
    const space = spaces.find((candidate) => candidate.slug === params.space)
    if (!space) throw new HelpArticleNotFoundException()

    const access = await this.access.handle(auth.getUserOrFail(), spaces)
    const read = await new ReadHelpArticle().handle({
      space,
      slug: params.article,
      access,
      locale: helpLocaleOf(i18n.locale),
    })
    return response.json(read)
  }
}
