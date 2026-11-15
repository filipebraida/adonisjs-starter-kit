import { readFile } from 'node:fs/promises'

import { urlFor } from '@adonisjs/core/services/url_builder'

import { markdownSections, type MarkdownSection } from '#core/utils/markdown_sections'
import HelpArticleNotFoundException from '#help/exceptions/help_article_not_found_exception'
import HelpCatalog from '#help/services/help_catalog'
import type { HelpLocale } from '#help/enums/help_locale'
import type { HelpAccess, HelpArticle, HelpSpace } from '#help/types/help'

type HelpLink = { slug: string; title: string } | null

/** An article ready to read, in the reader's language. */
export type HelpArticleRead = {
  space: { slug: string; title: string }
  article: { slug: string; title: string; summary: string; updatedAt: string }
  markdown: string
  /** Its `##` sections, with the ids the page's headings get. */
  sections: MarkdownSection[]
  previous: HelpLink
  next: HelpLink
  /** Where its `images/<file>` load from. */
  imagesUrl: string
}

export interface ReadHelpArticleInput {
  space: HelpSpace
  /** Without one, the space's opening article. */
  slug?: string
  access: HelpAccess
  locale: HelpLocale
}

/**
 * An article of a space, in the reader's language, with its sections and its
 * neighbours in the reader's navigation. One the reader may not read is not
 * found, as one that does not exist.
 *
 * @throws HelpArticleNotFoundException
 */
export default class ReadHelpArticle {
  async handle({ space, slug, access, locale }: ReadHelpArticleInput): Promise<HelpArticleRead> {
    const article = slug
      ? HelpCatalog.readable(space, slug, access)
      : HelpCatalog.opening(space, access)
    if (!article) throw new HelpArticleNotFoundException()

    const markdown = await readFile(HelpCatalog.fileOf(space, article, locale), 'utf8')
    const { previous, next } = HelpCatalog.neighbours(space, article.slug, access)
    const link = (other: HelpArticle | null): HelpLink =>
      other ? { slug: other.slug, title: other.title[locale] } : null
    // The route of one picture, less its name: the Markdown's `images/<file>` completes it.
    const imagesUrl = urlFor('help.image', { space: space.slug, file: 'x.png' }).replace(
      /\/x\.png$/,
      ''
    )

    return {
      space: { slug: space.slug, title: space.title[locale] },
      article: {
        slug: article.slug,
        title: article.title[locale],
        summary: article.summary[locale],
        updatedAt: article.updatedAt,
      },
      markdown,
      sections: markdownSections(markdown),
      previous: link(previous),
      next: link(next),
      imagesUrl,
    }
  }
}
