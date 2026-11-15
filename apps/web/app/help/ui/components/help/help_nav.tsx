import { Link } from '@inertiajs/react'

import { urlFor } from '~/app/client'

/** The main menu's item look: the article shown is white with a hairline. */
const ARTICLE_LINK =
  'text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-ring aria-[current=page]:bg-muted aria-[current=page]:text-foreground text-sm flex h-8 items-center rounded-sm border border-transparent px-2.5 font-medium focus-visible:outline-2 aria-[current=page]:font-semibold'

/** A category title is a caption, not an item: the help page's caption look, with room before each one after the first. */
const CATEGORY_CAPTION =
  'text-muted-foreground cursor-default px-2.5 pb-0.5 text-xs font-semibold tracking-wide uppercase select-none'

export type HelpNavCategory = {
  slug: string
  title: string
  articles: { slug: string; title: string }[]
}

/** A help space's categories and the articles the reader may read, the current one marked. */
export function HelpNav({
  space,
  categories,
  current,
}: {
  space: string
  categories: HelpNavCategory[]
  current: string
}) {
  return (
    <nav className="flex flex-col gap-6">
      {categories.map((category) => (
        <div key={category.slug} className="flex flex-col gap-1">
          <p className={CATEGORY_CAPTION}>{category.title}</p>
          <ul className="flex flex-col gap-0.5">
            {category.articles.map((article) => (
              <li key={article.slug}>
                <Link
                  href={urlFor('help.show', { space, article: article.slug })}
                  aria-current={article.slug === current ? 'page' : undefined}
                  className={ARTICLE_LINK}
                >
                  {article.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  )
}
