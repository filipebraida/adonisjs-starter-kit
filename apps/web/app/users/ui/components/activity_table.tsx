import * as React from 'react'
import { router } from '@inertiajs/react'
import { useDebounceCallback } from 'usehooks-ts'
import { X } from 'lucide-react'

import { Button } from '@workspace/ui/components/button'
import { ColumnDef, DataTable } from '@workspace/ui/components/data-table'
import { Input } from '@workspace/ui/components/input'
import { RadioFilter } from '@workspace/ui/components/radio-filter'
import { useDataTable } from '@workspace/ui/hooks/use-data-table'

import { useTranslation } from '#core/ui/hooks/use_translation'

import type { AuditEvent } from '#auth/enums/audit_event'

import type { Data } from '@generated/data'

type AuditRow = Data.Users.Audit.Variants['forActivity']

interface ActivityTableProps {
  audits: {
    data: AuditRow[]
    metadata: {
      total: number
      perPage: number
      currentPage: number
      lastPage: number
      firstPage: number
    }
  }
  events: AuditEvent[]
  q?: string
  actorId: number | null
  event: AuditEvent | null
}

export default function ActivityTable({ audits, events, q, actorId, event }: ActivityTableProps) {
  const { t } = useTranslation()

  const [querySearch, setQuerySearch] = React.useState(q ?? '')
  const [selectedEvent, setSelectedEvent] = React.useState<AuditEvent | ''>(event ?? '')

  const visit = React.useCallback(
    (params: { q: string; event: AuditEvent | ''; page?: number; perPage: number }) => {
      router.get(
        '/users/activity',
        {
          q: params.q.length > 0 ? params.q : undefined,
          event: params.event || undefined,
          actorId: actorId ?? undefined,
          page: params.page,
          perPage: params.perPage,
        },
        { preserveScroll: true, preserveState: true, replace: true, only: ['audits', 'q', 'event'] }
      )
    },
    [actorId]
  )

  const debouncedVisit = useDebounceCallback(visit, 300)
  React.useEffect(() => () => debouncedVisit.cancel(), [debouncedVisit])

  const perPage = audits.metadata.perPage

  const remoteTableOptions = useDataTable({
    data: audits,
    visit: ({ page, perPage }) => visit({ q: querySearch, event: selectedEvent, page, perPage }),
  })

  const eventOptions = events.map((value) => ({
    value,
    label: t(`users.activity.events.${value}`),
  }))

  const isFiltered = querySearch.trim().length > 0 || selectedEvent !== '' || actorId !== null

  const clearAll = () => {
    setQuerySearch('')
    setSelectedEvent('')
    router.get('/users/activity', { perPage }, { preserveScroll: true, replace: true })
  }

  const columns: ColumnDef<AuditRow>[] = [
    {
      id: 'createdAt',
      header: t('users.activity.table.columns.when'),
      cell: ({ row }) => (
        <span className="whitespace-nowrap text-sm">
          {new Date(row.original.createdAt).toLocaleString()}
        </span>
      ),
    },
    {
      id: 'actor',
      header: t('users.activity.table.columns.actor'),
      cell: ({ row }) => {
        const { actor, impersonatedBy } = row.original
        return (
          <div className="min-w-0">
            <div className="truncate font-medium">
              {actor
                ? (actor.fullName ?? actor.email ?? `#${actor.id}`)
                : t('users.activity.table.system')}
            </div>
            {impersonatedBy !== null && (
              <div className="text-xs text-muted-foreground">
                {t('users.activity.table.impersonated_by', { id: impersonatedBy })}
              </div>
            )}
          </div>
        )
      },
    },
    {
      id: 'event',
      header: t('users.activity.table.columns.event'),
      cell: ({ row }) => {
        const { event, changes } = row.original
        return (
          <div className="min-w-0">
            <div className="text-sm">{t(`users.activity.events.${event}`)}</div>
            <div className="truncate text-xs text-muted-foreground">
              {changes.length > 0
                ? changes.map((change) => change.field).join(', ')
                : t('users.activity.table.no_changes')}
            </div>
          </div>
        )
      },
    },
    {
      id: 'target',
      header: t('users.activity.table.columns.target'),
      meta: { columnClasses: 'hidden md:table-cell' },
      cell: ({ row }) => (
        <span className="text-sm">
          {row.original.auditableType} #{row.original.auditableId}
        </span>
      ),
    },
    {
      id: 'origin',
      header: t('users.activity.table.columns.origin'),
      meta: { columnClasses: 'hidden lg:table-cell' },
      cell: ({ row }) => (
        <div className="min-w-0 text-xs text-muted-foreground">
          <div>{row.original.ipAddress}</div>
          <div className="truncate" title={row.original.userAgent ?? undefined}>
            {row.original.url}
          </div>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-start">
        <div className="flex flex-wrap items-center gap-2">
          <Input
            placeholder={t('users.activity.table.filters.search_placeholder')}
            value={querySearch}
            onChange={(e) => {
              setQuerySearch(e.target.value)
              debouncedVisit({ q: e.target.value, event: selectedEvent, perPage })
            }}
            className="h-8 w-[150px] lg:w-[250px]"
          />
          <RadioFilter
            title={t('users.activity.table.filters.event')}
            options={eventOptions}
            value={selectedEvent}
            onChange={(next) => {
              setSelectedEvent(next)
              visit({ q: querySearch, event: next, perPage })
            }}
            emptyMessage={t('users.activity.table.no_results')}
          />
        </div>

        {isFiltered && (
          <Button variant="ghost" onClick={clearAll} className="h-8 px-2 lg:px-3">
            {t('users.activity.table.filters.clear_filters')}
            <X />
          </Button>
        )}
      </div>

      <DataTable
        columns={columns}
        data={audits.data}
        t={t}
        remoteTableOptions={remoteTableOptions}
      />
    </div>
  )
}
