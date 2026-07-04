import { router, usePage } from '@inertiajs/react'
import { Bell, CheckCheck, Loader2 } from 'lucide-react'
import { DateTime } from 'luxon'
import { useCallback, useState } from 'react'

import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import { Popover, PopoverContent, PopoverTrigger } from '@workspace/ui/components/popover'

import { useNotificationsChannel } from '#common/ui/hooks/use_notifications_channel'
import { useTranslation } from '#common/ui/hooks/use_translation'
import { urlFor } from '#core/ui/app/client'

interface NotificationContent {
  title?: string
  body?: string
  link?: string
  [key: string]: unknown
}

interface NotificationItem {
  id: number
  type: string
  content: NotificationContent
  status: string
  tags: string[] | null
  readAt: string | null
  seenAt: string | null
  createdAt: string
}

interface ListResponse {
  items: NotificationItem[]
  unseen: number
}

function postHeaders(csrf: string | undefined) {
  return { 'X-CSRF-TOKEN': csrf ?? '', 'Accept': 'application/json' }
}

function formatRelative(iso: string, locale: string): string {
  return DateTime.fromISO(iso).setLocale(locale).toRelative() ?? ''
}

export function NotificationBell() {
  const { t } = useTranslation()
  const { csrf, unseenNotifications, user, locale } = usePage().props as {
    csrf?: string
    unseenNotifications?: number
    user?: { id?: number }
    locale?: string
  }

  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<NotificationItem[]>([])
  const [loading, setLoading] = useState(false)
  const [localUnseen, setLocalUnseen] = useState<number | null>(null)

  const unseen = localUnseen ?? unseenNotifications ?? 0

  const fetchList = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(urlFor('notifications.index'), {
        headers: { Accept: 'application/json' },
        credentials: 'same-origin',
      })
      if (!res.ok) return
      const data: ListResponse = await res.json()
      setItems(data.items)
    } finally {
      setLoading(false)
    }
  }, [])

  const onIncoming = useCallback(() => {
    setLocalUnseen(null)
    router.reload({ only: ['unseenNotifications'], async: true })
    if (open) void fetchList()
  }, [open, fetchList])

  useNotificationsChannel(user?.id, onIncoming)

  const markAllSeen = useCallback(async () => {
    await fetch(urlFor('notifications.markAllSeen'), {
      method: 'POST',
      headers: postHeaders(csrf),
      credentials: 'same-origin',
    })
    setLocalUnseen(0)
    router.reload({ only: ['unseenNotifications'], async: true })
  }, [csrf])

  const markAllRead = useCallback(async () => {
    await fetch(urlFor('notifications.markAllRead'), {
      method: 'POST',
      headers: postHeaders(csrf),
      credentials: 'same-origin',
    })
    setItems((prev) =>
      prev.map((item) => ({ ...item, status: 'read', readAt: new Date().toISOString() }))
    )
    setLocalUnseen(0)
    router.reload({ only: ['unseenNotifications'], async: true })
  }, [csrf])

  const hasUnread = items.some((item) => item.status !== 'read')

  function onOpenChange(next: boolean) {
    setOpen(next)
    if (!next) return
    void fetchList()
    if (unseen > 0) void markAllSeen()
  }

  async function onClickItem(item: NotificationItem) {
    if (item.status !== 'read') {
      void fetch(urlFor('notifications.markRead', { id: item.id }), {
        method: 'POST',
        headers: postHeaders(csrf),
        credentials: 'same-origin',
      })
      setItems((prev) =>
        prev.map((n) =>
          n.id === item.id ? { ...n, status: 'read', readAt: new Date().toISOString() } : n
        )
      )
    }

    const link = item.content.link
    if (link) {
      setOpen(false)
      router.visit(link)
    }
  }

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label={t('common.notifications.ariaLabel')}
        >
          <Bell className="size-5" />
          {unseen > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-4 min-w-4 px-1 text-[10px] tabular-nums"
            >
              {unseen > 9 ? '9+' : unseen}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" collisionPadding={16} className="w-96 p-0">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <span className="text-sm font-semibold">{t('common.notifications.title')}</span>
          {hasUnread && (
            <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs" onClick={markAllRead}>
              <CheckCheck className="size-3.5" /> {t('common.notifications.markAllRead')}
            </Button>
          )}
        </div>

        <div className="max-h-96 overflow-y-auto overscroll-contain">
          {loading && items.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            </div>
          ) : items.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              {t('common.notifications.empty')}
            </div>
          ) : (
            <ul className="divide-y">
              {items.map((item) => {
                const unread = item.status !== 'read'
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => onClickItem(item)}
                      className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-accent/50"
                    >
                      <span
                        className={
                          'mt-1.5 size-2 shrink-0 rounded-full ' +
                          (unread ? 'bg-primary' : 'bg-transparent')
                        }
                        aria-hidden
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium leading-snug break-words">
                          {item.content.title ?? item.type}
                        </p>
                        {item.content.body && (
                          <p className="mt-0.5 text-xs leading-snug break-words text-muted-foreground">
                            {item.content.body}
                          </p>
                        )}
                        <p className="mt-1 text-[11px] text-muted-foreground/70">
                          {formatRelative(item.createdAt, locale ?? 'en')}
                        </p>
                      </div>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
