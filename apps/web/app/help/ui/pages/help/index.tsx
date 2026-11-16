import { Head, Link } from '@inertiajs/react'
import { BookOpen, ChevronRight } from 'lucide-react'

import { Button } from '@workspace/ui/components/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card'
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
import { Main } from '#core/ui/components/main'
import { useTranslation } from '#core/ui/hooks/use_translation'
import { urlFor } from '~/app/client'

type PageProps = InertiaProps<{ spaces: Data.Help.HelpSpace[] }>

export default function HelpIndexPage({ spaces }: PageProps) {
  const { t } = useTranslation()

  return (
    <AuthenticatedLayout breadcrumbs={[{ label: t('help.title') }]}>
      <Head title={t('help.title')} />
      <Main className="flex flex-col gap-6">
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
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {spaces.map((space) => (
            <Card key={space.slug}>
              <CardHeader>
                <CardTitle>
                  <h2>{space.title}</h2>
                </CardTitle>
                <CardDescription>{space.summary}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="flex flex-col gap-0.5">
                  {space.articles.map((article) => (
                    <li key={article.slug}>
                      <Button asChild variant="ghost" className="w-full justify-between">
                        <Link
                          href={urlFor('help.show', { space: space.slug, article: article.slug })}
                        >
                          {article.title}
                          <ChevronRight data-icon="inline-end" className="text-muted-foreground" />
                        </Link>
                      </Button>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </Main>
    </AuthenticatedLayout>
  )
}
