import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'

import { helpLocaleOf } from '#help/enums/help_locale'
import HelpArticleNotFoundException from '#help/exceptions/help_article_not_found_exception'
import HelpPolicy from '#help/policies/help_policy'
import ReadHelpArticle from '#help/queries/read_help_article'
import ResolveHelpAccess from '#help/queries/resolve_help_access'
import HelpCatalog from '#help/services/help_catalog'

/** A help article with its space's navigation; without one, the space's opening article. */
@inject()
export default class HelpArticlesController {
  constructor(
    private catalog: HelpCatalog,
    private access: ResolveHelpAccess
  ) {}

  async show({ auth, bouncer, i18n, inertia, params }: HttpContext) {
    await bouncer.with(HelpPolicy).authorize('view')
    const space = await this.catalog.space(params.space)
    if (!space) throw new HelpArticleNotFoundException()

    const locale = helpLocaleOf(i18n.locale)
    const access = await this.access.handle(auth.getUserOrFail())
    const read = await new ReadHelpArticle().handle({
      space,
      slug: params.article,
      access,
      locale,
    })

    return inertia.render('help/help/show', {
      ...read,
      navigation: HelpCatalog.navigation(space, access).map((category) => ({
        slug: category.slug,
        title: category.title[locale],
        articles: category.articles.map((article) => ({
          slug: article.slug,
          title: article.title[locale],
        })),
      })),
    })
  }
}
