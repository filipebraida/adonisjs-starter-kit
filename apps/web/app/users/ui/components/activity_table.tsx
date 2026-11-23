import * as React from 'react'
import { router } from '@inertiajs/react'
import { useDebounceCallback } from 'usehooks-ts'
import { X } from 'lucide-react'

import { Button } from '@workspace/ui/components/button'
import { ColumnDef } from '@workspace/ui/components/data-table'
import { FilterPanel, FiltersButton } from '@workspace/ui/components/filter-panel'
import { Input } from '@workspace/ui/components/input'
import { TableToolbar, TableToolbarSearch } from '@workspace/ui/components/table-toolbar'
import { useDataTable } from '@workspace/ui/hooks/use-data-table'

import { urlFor } from '~/app/client'
import { DataTable } from '#core/ui/components/data_table'
import { useTranslation } from '#core/ui/hooks/use_translation'
import { formatDateTime } from '#core/ui/format/date'

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
  actor: { id: number; name: string } | null
  event: AuditEvent | null
}

export default function ActivityTable({ audits, events, q, actor, event }: ActivityTableProps) {
  const { t, language } = useTranslation()

  const [querySearch, setQuerySearch] = React.useState(q ?? '')
  const [selectedEvent, setSelectedEvent] = React.useState<AuditEvent | ''>(event ?? '')
  const [filtersOpen, setFiltersOpen] = React.useState(!!event)

  const visit = React.useCallback(
    (params: {
      q: string
      event: AuditEvent | ''
      actorId?: number
      page?: number
      perPage: number
    }) => {
      router.get(
        urlFor('users.activity'),
        {
          q: params.q.length > 0 ? params.q : undefined,
          event: params.event || undefined,
          actorId: params.actorId,
          page: params.page,
          perPage: params.perPage,
        },
        {
          preserveScroll: true,
          preserveState: true,
          replace: true,
          only: ['audits', 'q', 'event', 'actor'],
        }
      )
    },
    []
  )

  const debouncedVisit = useDebounceCallback(visit, 300)
  React.useEffect(() => () => debouncedVisit.cancel(), [debouncedVisit])

  const perPage = audits.metadata.perPage

  const remoteTableOptions = useDataTable({
    data: audits,
    visit: ({ page, perPage }) =>
      visit({ q: querySearch, event: selectedEvent, actorId: actor?.id, page, perPage }),
  })

  const eventOptions = events.map((value) => ({
    value,
    label: t(`users.activity.events.${value}`),
  }))

  const isFiltered = querySearch.trim().length > 0 || selectedEvent !== '' || actor !== null

  const clearAll = () => {
    setQuerySearch('')
    setSelectedEvent('')
    router.get(urlFor('users.activity'), { perPage }, { preserveScroll: true, replace: true })
  }

  const actorName = (row: AuditRow) =>
    row.actor
      ? (row.actor.fullName ?? row.actor.email ?? `#${row.actor.id}`)
      : t('users.activity.table.system')

  const columns: ColumnDef<AuditRow>[] = [
    {
      id: 'createdAt',
      header: t('users.activity.table.columns.when'),
      meta: { columnClasses: 'hidden @xl:table-cell' },
      cell: ({ row }) => (
        <span className="whitespace-nowrap text-sm">
          {formatDateTime(row.original.createdAt, language)}
        </span>
      ),
    },
    {
      id: 'actor',
      header: t('users.activity.table.columns.actor'),
      meta: { columnClasses: 'hidden @xl:table-cell' },
      cell: ({ row }) => {
        const { impersonatedBy } = row.original
        return (
          <div className="min-w-0">
            <div className="truncate font-medium">{actorName(row.original)}</div>
            {impersonatedBy !== null && (
              <div className="text-xs text-muted-foreground">
                {t('users.activity.table.impersonated_by', {
                  name: impersonatedBy.name ?? `#${impersonatedBy.id}`,
                })}
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
            {/* Who and when have their own columns from sm up; below, they ride here. */}
            <div className="mt-0.5 truncate text-xs text-muted-foreground @xl:hidden">
              {actorName(row.original)} · {formatDateTime(row.original.createdAt, language)}
            </div>
          </div>
        )
      },
    },
    {
      id: 'target',
      header: t('users.activity.table.columns.target'),
      meta: { columnClasses: 'hidden @2xl:table-cell' },
      cell: ({ row }) => (
        <span className="text-sm">
          {row.original.auditableType} #{row.original.auditableId}
        </span>
      ),
    },
    {
      id: 'origin',
      header: t('users.activity.table.columns.origin'),
      meta: { columnClasses: 'hidden @4xl:table-cell' },
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

  const chooseEvent = (next: AuditEvent | '') => {
    setSelectedEvent(next)
    visit({ q: querySearch, event: next, actorId: actor?.id, perPage })
  }

  return (
    <DataTable
      columns={columns}
      data={audits.data}
      remoteTableOptions={remoteTableOptions}
      toolbar={
        <TableToolbar>
          <TableToolbarSearch>
            <Input
              placeholder={t('users.activity.table.filters.search_placeholder')}
              aria-label={t('users.activity.table.filters.search_placeholder')}
              value={querySearch}
              onChange={(e) => {
                setQuerySearch(e.target.value)
                debouncedVisit({
                  q: e.target.value,
                  event: selectedEvent,
                  actorId: actor?.id,
                  perPage,
                })
              }}
            />
          </TableToolbarSearch>
          {actor && (
            <Button
              variant="secondary"
              onClick={() => visit({ q: querySearch, event: selectedEvent, perPage })}
              aria-label={t('users.activity.table.filters.remove_actor', { name: actor.name })}
            >
              {t('users.activity.table.filters.actor', { name: actor.name })}
              <X />
            </Button>
          )}
          <FiltersButton
            count={selectedEvent ? 1 : 0}
            open={filtersOpen}
            onClick={() => setFiltersOpen(!filtersOpen)}
          >
            {t('core.table.filters.button')}
          </FiltersButton>
          {isFiltered && (
            <Button variant="ghost" onClick={clearAll}>
              {t('users.activity.table.filters.clear_filters')}
              <X />
            </Button>
          )}
        </TableToolbar>
      }
      panel={
        filtersOpen && (
          <EventFilterPanel
            events={eventOptions}
            selected={selectedEvent}
            total={audits.metadata.total}
            onChoose={chooseEvent}
            onClose={() => setFiltersOpen(false)}
          />
        )
      }
    />
  )
}

/** The event filter, open inside the table's card: one event at a time. */
function EventFilterPanel({
  events,
  selected,
  total,
  onChoose,
  onClose,
}: {
  events: { value: AuditEvent; label: string }[]
  selected: AuditEvent | ''
  total: number
  onChoose: (event: AuditEvent | '') => void
  onClose: () => void
}) {
  const { t } = useTranslation()

  return (
    <FilterPanel
      groups={[
        {
          id: 'event',
          label: t('users.activity.table.filters.event'),
          options: events,
          select: 'single',
        },
      ]}
      value={{ event: selected ? [selected] : [] }}
      onValueChange={(next) => onChoose((next.event?.[0] as AuditEvent) ?? '')}
      summary={t('core.table.filters.summary', { total })}
      onClear={() => onChoose('')}
      onClose={onClose}
      clearLabel={t('core.table.filters.clear')}
      closeLabel={t('core.table.filters.done')}
    />
  )
}
