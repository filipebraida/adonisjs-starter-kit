import { BaseTransformer } from '@adonisjs/core/transformers'

import type { HelpLocale } from '#help/enums/help_locale'
import HelpCatalog from '#help/services/help_catalog'
import type { HelpAccess, HelpSpace } from '#help/types/help'

/** A space of the help index with the articles the reader may read, in the catalog's order. */
export default class HelpSpaceTransformer extends BaseTransformer<{
  space: HelpSpace
  access: HelpAccess
  locale: HelpLocale
}> {
  toObject() {
    const { space, access, locale } = this.resource

    return {
      slug: space.slug,
      title: space.title[locale],
      summary: space.summary[locale],
      articles: HelpCatalog.navigation(space, access)
        .flatMap((category) => category.articles)
        .map((article) => ({ slug: article.slug, title: article.title[locale] })),
    }
  }
}
