import { router } from '@inertiajs/react'
import React from 'react'

import { ColumnDef, type OnChangeFn, type SortingState } from '@workspace/ui/components/data-table'
import { useDataTable } from '@workspace/ui/hooks/use-data-table'
import { Button } from '@workspace/ui/components/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@workspace/ui/components/empty'
import { SearchX } from 'lucide-react'

import { urlFor } from '~/app/client'
import { DataTable } from '#core/ui/components/data_table'
import { useTranslation } from '#core/ui/hooks/use_translation'
import { formatDate } from '#core/ui/format/date'
import { DataTableRowActions } from '#users/ui/components/users_row_actions'
import UsersTableToolbar, {
  UsersTableFilterPanel,
  type UsersFilters,
} from '#users/ui/components/users_table_filters'
import { Role } from '#users/ui/components/users_types'

import { displayRole, ROLES } from '#auth/enums/role'
import type { SortDirection, UsersSortBy } from '#users/enums/sort'

import type { Data } from '@generated/data'

interface DataTableProps {
  users: {
    data: Data.Users.User.Variants['forList'][]
    metadata: {
      total: number
      perPage: number
      currentPage: number
      lastPage: number
      firstPage: number
      firstPageUrl?: string
      lastPageUrl?: string
      nextPageUrl?: string | null
      previousPageUrl?: string | null
    }
  }
  roles: Role[]
  q: string | null
  selectedRoles: string[]
  sort: string | null
  order: string | null
}

export default function UsersTable({
  users,
  roles: roleOptions,
  q,
  selectedRoles,
  sort,
  order,
}: DataTableProps) {
  const { t, language } = useTranslation()

  const sorting = React.useMemo<SortingState>(
    () => (sort && order ? [{ id: sort, desc: order === 'desc' }] : []),
    [sort, order]
  )

  const onSortingChange = React.useCallback<OnChangeFn<SortingState>>(
    (updater) => {
      const next = typeof updater === 'function' ? updater(sorting) : updater
      const first = next[0]
      const nextSort = (first?.id ?? undefined) as UsersSortBy | undefined
      const nextOrder: SortDirection | undefined = first ? (first.desc ? 'desc' : 'asc') : undefined

      router.get(
        urlFor('users.index'),
        {
          q: q || undefined,
          roles: selectedRoles.length > 0 ? selectedRoles : undefined,
          perPage: users.metadata.perPage,
          sort: nextSort,
          order: nextOrder,
        },
        {
          preserveState: true,
          preserveScroll: true,
          replace: true,
          only: ['users', 'rowCan', 'sort', 'order'],
        }
      )
    },
    [sorting, q, selectedRoles, users.metadata.perPage]
  )

  const remoteTableOptions = useDataTable({
    data: users,
    visit: ({ page, perPage }) => {
      return router.get(
        urlFor('users.index'),
        {
          page,
          perPage,
          q: q || undefined,
          roles: selectedRoles.length > 0 ? selectedRoles : undefined,
          sort: sort ?? undefined,
          order: order ?? undefined,
        },
        {
          preserveState: true,
          preserveScroll: true,
          replace: true,
        }
      )
    },
    sorting: { state: sorting, onChange: onSortingChange },
  })

  const columns: ColumnDef<Data.Users.User.Variants['forList']>[] = [
    {
      id: 'fullName',
      header: t('users.index.table.columns.full_name'),
      accessorKey: 'fullName',
      enableSorting: true,
      cell: ({ row }) => {
        const user = row.original
        const slug = displayRole(user.roles) ?? ROLES.USER
        const userRole = roleOptions.find(({ value }) => value === slug)
        return (
          <div className="min-w-0">
            <div className="truncate font-medium">
              {user.fullName ? (
                user.fullName
              ) : (
                <span className="text-muted-foreground italic">
                  {t('users.index.table.not_provided')}
                </span>
              )}
            </div>
            <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground @xl:hidden">
              <span className="truncate">{user.email}</span>
              {userRole && (
                <>
                  <span className="text-muted-foreground/60">·</span>
                  <span className="inline-flex items-center gap-1 capitalize">
                    {userRole.icon && <userRole.icon size={12} />}
                    {userRole.label}
                  </span>
                </>
              )}
            </div>
          </div>
        )
      },
    },
    {
      id: 'email',
      header: t('users.index.table.columns.email'),
      accessorKey: 'email',
      enableSorting: true,
      meta: { columnClasses: 'hidden @xl:table-cell' },
    },
    {
      id: 'role',
      accessorFn: (user) => displayRole(user.roles) ?? ROLES.USER,
      header: t('users.index.table.columns.role'),
      enableSorting: false,
      meta: { columnClasses: 'hidden @2xl:table-cell' },
      cell: ({ row }) => {
        const slug = displayRole(row.original.roles) ?? ROLES.USER
        const userRole = roleOptions.find(({ value }) => value === slug)

        if (!userRole) {
          return null
        }

        return (
          <div className="flex gap-x-2 items-center">
            {userRole.icon && <userRole.icon size={16} className="text-muted-foreground" />}
            <span className="capitalize text-sm">{userRole.label}</span>
          </div>
        )
      },
    },
    {
      id: 'createdAt',
      header: t('users.index.table.columns.created_at'),
      accessorKey: 'createdAt',
      enableSorting: true,
      meta: { columnClasses: 'hidden @4xl:table-cell' },
      cell: ({ row }) =>
        row.original.createdAt ? formatDate(row.original.createdAt, language) : null,
    },
    {
      id: 'actions',
      enableSorting: false,
      meta: { columnClasses: 'w-[52px]' },
      cell: DataTableRowActions,
    },
  ]

  // A new search or filter starts again on the first page, keeping the sort.
  const filter = (next: UsersFilters) =>
    router.get(
      urlFor('users.index'),
      {
        q: next.q || undefined,
        roles: next.roles.length > 0 ? next.roles : undefined,
        perPage: users.metadata.perPage,
        sort: sort ?? undefined,
        order: order ?? undefined,
      },
      {
        preserveScroll: true,
        preserveState: true,
        replace: true,
        only: ['users', 'rowCan', 'q', 'selectedRoles'],
      }
    )

  const filtered = !!q || selectedRoles.length > 0
  const [filtersOpen, setFiltersOpen] = React.useState(selectedRoles.length > 0)

  return (
    <div className="space-y-4">
      <DataTable
        columns={columns}
        data={users.data}
        remoteTableOptions={remoteTableOptions}
        toolbar={
          <UsersTableToolbar
            q={q}
            selectedRoles={selectedRoles}
            open={filtersOpen}
            onOpenChange={setFiltersOpen}
            onChange={filter}
          />
        }
        panel={
          filtersOpen && (
            <UsersTableFilterPanel
              q={q}
              selectedRoles={selectedRoles}
              roles={roleOptions}
              total={users.metadata.total}
              onChange={filter}
              onClose={() => setFiltersOpen(false)}
            />
          )
        }
        empty={filtered ? <NoMatch onClear={() => filter({ q: '', roles: [] })} /> : undefined}
      />
    </div>
  )
}

/** A search or filter left the list empty: say so and offer to clear. */
function NoMatch({ onClear }: { onClear: () => void }) {
  const { t } = useTranslation()

  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <SearchX />
        </EmptyMedia>
        <EmptyTitle>{t('users.index.empty.title')}</EmptyTitle>
        <EmptyDescription>{t('users.index.empty.description')}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button variant="outline" onClick={onClear}>
          {t('core.table.filters.clear')}
        </Button>
      </EmptyContent>
    </Empty>
  )
}
