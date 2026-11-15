import { Head, Link } from '@inertiajs/react'
import { BookOpen, ChevronRight } from 'lucide-react'

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@workspace/ui/components/empty'

import type { Data } from '@generated/data'

import type { InertiaProps } from '#core/ui/app/types'
import AuthenticatedLayout from '#core/ui/components/authenticated_layout'
import Heading from '#core/ui/components/heading'
import { useTranslation } from '#core/ui/hooks/use_translation'
import { urlFor } from '~/app/client'

type PageProps = InertiaProps<{ spaces: Data.Help.HelpSpace[] }>

export default function HelpIndexPage({ spaces }: PageProps) {
  const { t } = useTranslation()

  return (
    <AuthenticatedLayout breadcrumbs={[{ label: t('help.title') }]}>
      <Head title={t('help.title')} />
      <div className="mx-auto flex w-full max-w-[840px] flex-col gap-6 px-4 pt-8 pb-24 sm:px-6 lg:px-10">
        <Heading title={t('help.title')} description={t('help.index.description')} />
        {spaces.length === 0 && (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <BookOpen />
              </EmptyMedia>
              <EmptyTitle>{t('help.index.empty.title')}</EmptyTitle>
              <EmptyDescription>{t('help.index.empty.description')}</EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {spaces.map((space) => (
            <li key={space.slug} className="border-border flex flex-col rounded-lg border">
              <div className="flex flex-col gap-1 px-4 py-3">
                <h2 className="font-semibold">{space.title}</h2>
                <p className="text-muted-foreground text-sm">{space.summary}</p>
              </div>
              <ul className="border-border flex flex-col border-t p-1.5">
                {space.articles.map((article) => (
                  <li key={article.slug}>
                    <Link
                      href={urlFor('help.show', { space: space.slug, article: article.slug })}
                      className="hover:bg-muted focus-visible:bg-muted focus-visible:ring-ring flex items-center justify-between gap-2 rounded-md px-2.5 py-2 text-sm outline-none focus-visible:ring-2"
                    >
                      <span>{article.title}</span>
                      <ChevronRight className="text-muted-foreground size-4 shrink-0" />
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    </AuthenticatedLayout>
  )
}
