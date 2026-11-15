import { inject } from '@adonisjs/core'

import type User from '#auth/models/user'
import ResolveHelpAccess from '#help/queries/resolve_help_access'
import HelpCatalog from '#help/services/help_catalog'

/**
 * Every help article the person may read, as `<space>/<article>`: what tells
 * a screen whether its "?" has something to open.
 */
@inject()
export default class ListReadableHelpArticles {
  constructor(
    private catalog: HelpCatalog,
    private access: ResolveHelpAccess
  ) {}

  async handle(user: User): Promise<string[]> {
    const [spaces, access] = await Promise.all([this.catalog.spaces(), this.access.handle(user)])
    return spaces.flatMap((space) =>
      space.articles
        .filter((article) => HelpCatalog.canRead(article, access))
        .map((article) => `${space.slug}/${article.slug}`)
    )
  }
}
