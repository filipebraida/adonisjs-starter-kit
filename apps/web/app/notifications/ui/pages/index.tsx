import { Head, router } from '@inertiajs/react'
import { BellOff, CheckCheck } from 'lucide-react'

import { Button } from '@workspace/ui/components/button'
import { Card } from '@workspace/ui/components/card'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@workspace/ui/components/empty'
import { FilterTabs } from '@workspace/ui/components/filter-tabs'

import { urlFor } from '~/app/client'
import type { InertiaProps } from '#core/ui/app/types'
import AuthenticatedLayout from '#core/ui/components/authenticated_layout'
import Heading from '#core/ui/components/heading'
import { Main } from '#core/ui/components/main'
import { formatDate, formatDateTime } from '#core/ui/format/date'
import { type TFunction, useTranslation } from '#core/ui/hooks/use_translation'

import type { Data } from '@generated/data'

type NotificationRow = Data.Notifications.Notification.Variants['forPage']

type Slice = 'all' | 'unread'

type PageProps = InertiaProps<{
  notifications: NotificationRow[]
  unread: number
  filter: 'unread' | null
}>

const TIME = { hour: '2-digit', minute: '2-digit' } as const
const DAY_MS = 86_400_000

/** A notification's day as its group says it: "Today", "Yesterday", or the date. */
function dayLabel(t: TFunction, locale: string, when: string): string {
  const midnight = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const days = Math.round(
    (midnight(new Date()).getTime() - midnight(new Date(when)).getTime()) / DAY_MS
  )
  if (days <= 0) return t('core.notifications.page.today')
  if (days === 1) return t('core.notifications.page.yesterday')

  return formatDate(when, locale, { day: 'numeric', month: 'long', year: 'numeric' })
}

/** The notifications grouped by day, in the order they came: the list is already newest first. */
function byDay(
  t: TFunction,
  locale: string,
  notifications: NotificationRow[]
): { day: string; items: NotificationRow[] }[] {
  const groups: { day: string; items: NotificationRow[] }[] = []
  for (const notification of notifications) {
    const day = dayLabel(t, locale, notification.createdAt)
    const group = groups.at(-1)
    if (group?.day === day) group.items.push(notification)
    else groups.push({ day, items: [notification] })
  }

  return groups
}

/** The signed-in user's whole inbox: the bell shows only the latest ones. */
export default function NotificationsPage({ notifications, unread, filter, csrf }: PageProps) {
  const { t, language } = useTranslation()
  const title = t('core.notifications.title')

  const reload = () => router.reload({ only: ['notifications', 'unread', 'unseenNotifications'] })

  // The inbox actions answer in JSON, as the bell calls them: the page reloads its data afterwards.
  const post = (url: string) =>
    fetch(url, {
      method: 'POST',
      headers: { 'X-CSRF-TOKEN': csrf ?? '', 'Accept': 'application/json' },
      credentials: 'same-origin',
    })

  async function markAllRead() {
    await post(urlFor('notifications.markAllRead'))
    reload()
  }

  async function open(notification: NotificationRow) {
    if (notification.status !== 'read') {
      await post(urlFor('notifications.markRead', { id: notification.id }))
    }
    if (notification.link) router.visit(notification.link)
    else reload()
  }

  const empty = filter ? 'unread' : 'all'

  return (
    <AuthenticatedLayout breadcrumbs={[{ label: title }]}>
      <Head title={title} />
      <Main className="space-y-6">
        <Heading title={title} description={t('core.notifications.page.description')}>
          <Button variant="outline" size="sm" disabled={unread === 0} onClick={markAllRead}>
            <CheckCheck data-icon="inline-start" />
            {t('core.notifications.markAllRead')}
          </Button>
        </Heading>

        <FilterTabs<Slice>
          label={t('core.notifications.page.tabs')}
          value={filter ?? 'all'}
          onValueChange={(next) =>
            router.get(
              urlFor('notifications.index'),
              { filter: next === 'all' ? undefined : next },
              { preserveScroll: true, preserveState: true, replace: true }
            )
          }
          options={[
            { value: 'all', label: t('core.notifications.page.all') },
            { value: 'unread', label: t('core.notifications.page.unread'), count: unread },
          ]}
        />

        {notifications.length === 0 ? (
          <Card>
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <BellOff />
                </EmptyMedia>
                <EmptyTitle>{t(`core.notifications.page.empty.${empty}.title`)}</EmptyTitle>
                <EmptyDescription>
                  {t(`core.notifications.page.empty.${empty}.description`)}
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          </Card>
        ) : (
          byDay(t, language, notifications).map(({ day, items }) => (
            <section key={day} className="space-y-2">
              <h2 className="text-sm font-medium text-muted-foreground">{day}</h2>
              <Card size="flush">
                <ul className="list-none divide-y p-0">
                  {items.map((notification) => {
                    const isUnread = notification.status !== 'read'
                    return (
                      <li key={notification.id}>
                        <button
                          type="button"
                          onClick={() => open(notification)}
                          className="flex w-full items-start gap-3 px-5 py-4 text-left hover:bg-muted/50"
                        >
                          <span
                            className={
                              isUnread
                                ? 'mt-1.5 size-2 shrink-0 rounded-full bg-primary'
                                : 'mt-1.5 size-2 shrink-0'
                            }
                            aria-hidden
                          />
                          <span className="min-w-0 flex-1">
                            <span className="block text-sm font-medium break-words">
                              {notification.title ?? notification.type}
                              {isUnread && (
                                <span className="sr-only">
                                  {' '}
                                  {t('core.notifications.page.unreadMark')}
                                </span>
                              )}
                            </span>
                            {notification.body && (
                              <span className="block text-xs break-words text-muted-foreground">
                                {notification.body}
                              </span>
                            )}
                          </span>
                          <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                            {formatDateTime(notification.createdAt, language, TIME)}
                          </span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </Card>
            </section>
          ))
        )}
      </Main>
    </AuthenticatedLayout>
  )
}
