import { ExternalLink } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

import { Button } from '@workspace/ui/components/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@workspace/ui/components/sheet'
import { Skeleton } from '@workspace/ui/components/skeleton'

import { Markdown } from '#core/ui/components/markdown'
import { urlFor } from '~/app/client'
import { useTranslation } from '#core/ui/hooks/use_translation'
import type { HelpArticleRead } from '#help/queries/read_help_article'
import { useHelpImageUrl } from '#help/ui/hooks/use_help_image_url'

// An article does not change while the page is open; the language is part of the key because
// switching it does not reload the page.
const articles = new Map<string, Promise<HelpArticleRead>>()

function load(space: string, article: string, language: string): Promise<HelpArticleRead> {
  const key = `${language}:${space}/${article}`
  let pending = articles.get(key)
  if (!pending) {
    pending = fetch(urlFor('help.content', { space, article }), {
      headers: { Accept: 'application/json' },
      credentials: 'same-origin',
    }).then((response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      return response.json() as Promise<HelpArticleRead>
    })
    pending.catch(() => articles.delete(key))
    articles.set(key, pending)
  }
  return pending
}

type Loaded = { key: string; read?: HelpArticleRead; failed?: boolean }

/**
 * A help article in a drawer, already at the section asked for, without leaving the screen;
 * its footer opens the article's page.
 */
export function HelpPanel({
  open,
  onOpenChange,
  space,
  article,
  section,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  space: string
  article: string
  section: string | null
}) {
  const { t, language } = useTranslation()
  const [loaded, setLoaded] = useState<Loaded | null>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
  const imageUrl = useHelpImageUrl(space)
  const key = `${language}:${space}/${article}`

  useEffect(() => {
    if (!open) return
    let current = true
    load(space, article, language).then(
      (read) => current && setLoaded({ key, read }),
      () => current && setLoaded({ key, failed: true })
    )
    return () => {
      current = false
    }
  }, [open, space, article, language, key])

  const shown = loaded?.key === key ? loaded : null

  const scrollTo = useCallback((id: string) => {
    bodyRef.current?.querySelector(`#${CSS.escape(id)}`)?.scrollIntoView({ block: 'start' })
  }, [])

  useEffect(() => {
    if (shown?.read && section) scrollTo(section)
  }, [shown, section, scrollTo])

  const page = urlFor('help.show', { space, article })

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent size="wide" closeLabel={t('help.close')}>
        <SheetHeader>
          {/* Clear of the close button, which sits in the header's corner. */}
          <div className="pr-8">
            <SheetTitle>{shown?.read?.article.title ?? t('help.title')}</SheetTitle>
            <SheetDescription>{shown?.read?.article.summary}</SheetDescription>
          </div>
        </SheetHeader>
        <div ref={bodyRef} className="min-h-0 flex-1 overflow-y-auto px-4">
          {shown?.read && (
            <Markdown variant="document" imageUrl={imageUrl}>
              {shown.read.markdown}
            </Markdown>
          )}
          {shown?.failed && <p className="text-muted-foreground text-sm">{t('help.loadFailed')}</p>}
          {!shown && (
            <div className="flex flex-col gap-3">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          )}
        </div>
        <SheetFooter>
          <Button variant="outline" asChild>
            <a href={section ? `${page}#${section}` : page} target="_blank" rel="noreferrer">
              {t('help.openPage')}
              <ExternalLink aria-hidden />
            </a>
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
