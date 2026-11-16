import { Head, Link } from '@inertiajs/react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import type { InertiaProps } from '#core/ui/app/types'
import AuthenticatedLayout from '#core/ui/components/authenticated_layout'
import Heading from '#core/ui/components/heading'
import { Main } from '#core/ui/components/main'
import { Markdown } from '#core/ui/components/markdown'
import { formatDate } from '#core/ui/format/date'
import { useScrollToHash } from '#core/ui/hooks/use_scroll_to_hash'
import { useTranslation } from '#core/ui/hooks/use_translation'
import { urlFor } from '~/app/client'
import type { HelpArticleRead } from '#help/queries/read_help_article'
import { HelpNav, type HelpNavCategory } from '#help/ui/components/help/help_nav'
import { useHelpImageUrl } from '#help/ui/hooks/use_help_image_url'

type PageProps = InertiaProps<HelpArticleRead & { navigation: HelpNavCategory[] }>

const CAPTION = 'text-muted-foreground text-xs font-semibold tracking-wide uppercase'
const SIDE = 'xl:sticky xl:top-6 self-start pt-1'

/**
 * A help article laid out as documentation pages are: its space's articles on the left, the text
 * in a reading column, "On this page" on the right; both sides plain text, no boxes. Below the
 * `xl` breakpoint, the text with the space's articles after it.
 */
export default function HelpShowPage({
  space,
  article,
  markdown,
  sections,
  previous,
  next,
  navigation,
}: PageProps) {
  const { t, language } = useTranslation()

  const imageUrl = useHelpImageUrl(space.slug)

  useScrollToHash(article.slug)

  return (
    <AuthenticatedLayout
      breadcrumbs={[
        { label: t('help.title'), href: urlFor('help.index') },
        { label: space.title, href: urlFor('help.space', { space: space.slug }) },
        { label: article.title },
      ]}
    >
      <Head title={`${article.title} · ${t('help.title')}`} />
      <Main size="reading" className="grid items-start gap-10 xl:grid-cols-help">
        {/* One list for every width: after the text on a phone, at its left from `xl`. */}
        <aside
          aria-label={t('help.show.space')}
          className={`${SIDE} border-border xl:order-none xl:border-t-0 xl:pt-1 order-last border-t pt-4`}
        >
          <HelpNav space={space.slug} categories={navigation} current={article.slug} />
        </aside>

        <article className="flex min-w-0 flex-col gap-4.5">
          <div>
            <Heading title={article.title} description={article.summary} />
            <p className="text-muted-foreground text-xs">
              {t('help.show.updatedAt', {
                date: formatDate(`${article.updatedAt}T00:00:00Z`, language, {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  timeZone: 'UTC',
                }),
              })}
            </p>
          </div>
          <Markdown variant="document" imageUrl={imageUrl} className="text-base">
            {markdown}
          </Markdown>
          <nav className="border-border flex justify-between gap-4 border-t pt-4">
            {previous ? (
              <Link
                href={urlFor('help.show', { space: space.slug, article: previous.slug })}
                className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-sm"
              >
                <ChevronLeft aria-hidden className="size-4" />
                <span className="sr-only">{t('help.show.previous')}: </span>
                {previous.title}
              </Link>
            ) : (
              <span />
            )}
            {next && (
              <Link
                href={urlFor('help.show', { space: space.slug, article: next.slug })}
                className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-sm"
              >
                <span className="sr-only">{t('help.show.next')}: </span>
                {next.title}
                <ChevronRight aria-hidden className="size-4" />
              </Link>
            )}
          </nav>
        </article>

        {sections.length > 0 && (
          <aside aria-label={t('help.show.onThisPage')} className={`${SIDE} xl:block hidden`}>
            <p className={CAPTION}>{t('help.show.onThisPage')}</p>
            <ul className="mt-2 flex flex-col gap-1 border-l border-border">
              {sections.map((section) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    className="text-muted-foreground hover:text-foreground text-sm -ml-px block border-l border-transparent py-0.5 pl-3 hover:border-foreground"
                  >
                    {section.title}
                  </a>
                </li>
              ))}
            </ul>
          </aside>
        )}
      </Main>
    </AuthenticatedLayout>
  )
}
