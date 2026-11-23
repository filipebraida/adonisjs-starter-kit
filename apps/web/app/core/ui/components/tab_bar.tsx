import { Link, usePage } from '@inertiajs/react'
import { Ellipsis } from 'lucide-react'

import { Badge } from '@workspace/ui/components/badge'

import type { ShellArea, TabItem } from '#core/ui/app/navigation_types'
import useAllows from '#core/ui/hooks/use_allows'
import { activeNavUrl } from '#core/ui/hooks/use_is_active'
import { useTranslation } from '#core/ui/hooks/use_translation'

const MORE = '/more'

/**
 * The phone's navigation: the everyday destinations at the foot of the screen,
 * within reach of the thumb, and "More" for the rest. It replaces the top menu
 * and the sidebar on a narrow screen.
 */
export function TabBar({ items, area }: { items: TabItem[]; area: ShellArea }) {
  const { t } = useTranslation()
  const allows = useAllows()
  const { url } = usePage()
  const visible = items.filter((item) => allows(item.can))
  const onMore = url.split(/[?#]/)[0] === MORE
  const active = onMore ? MORE : activeNavUrl(visible, url)
  const tabs: TabItem[] = [
    ...visible,
    { title: t('core.layout.more.title'), url: `${MORE}?area=${area}`, icon: Ellipsis },
  ]

  return (
    <nav
      aria-label={t('core.layout.tabs')}
      className="fixed inset-x-0 bottom-0 z-40 flex border-t bg-card pb-safe"
    >
      {tabs.map(({ title, url: href, icon: Icon, count }) => {
        const current = href.split('?')[0] === active
        return (
          <Link
            key={href}
            href={href}
            aria-current={current ? 'page' : undefined}
            className="group flex min-w-0 flex-1 flex-col items-center gap-1 py-2 outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="relative flex h-7 w-12 items-center justify-center rounded-full text-muted-foreground group-aria-[current=page]:bg-accent group-aria-[current=page]:text-foreground">
              <Icon className="size-5" aria-hidden />
              {!!count && (
                <span className="absolute -top-1.5 right-0">
                  <Badge size="count">{count}</Badge>
                </span>
              )}
            </span>
            <span className="max-w-full truncate px-1 text-xs text-muted-foreground group-aria-[current=page]:font-semibold group-aria-[current=page]:text-foreground">
              {title}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
