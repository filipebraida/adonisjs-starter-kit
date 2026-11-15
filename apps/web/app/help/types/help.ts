import type { HelpLocale } from '#help/enums/help_locale'

/** A text of the help index, in each language. */
export type HelpText = Record<HelpLocale, string>

export interface HelpArticle {
  slug: string
  title: HelpText
  summary: HelpText
  category: string
  order: number
  /** The Markdown's file name, the same in `pt/` and `en/`. */
  file: string
  /** Whoever lacks it does not see the article at all: not in the navigation, 404 on its page. */
  capability?: string
  updatedAt: string
}

export interface HelpCategory {
  slug: string
  title: HelpText
  order: number
}

/** A space of the help (`/help/<slug>`): its index and the folder its files live in. */
export interface HelpSpace {
  slug: string
  title: HelpText
  summary: HelpText
  order: number
  dir: string
  categories: HelpCategory[]
  articles: HelpArticle[]
}

export type HelpCategoryWithArticles = HelpCategory & { articles: HelpArticle[] }

/** The capabilities the indexes cite that the reader holds. */
export type HelpAccess = ReadonlySet<string>
