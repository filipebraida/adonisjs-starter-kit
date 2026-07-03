import { router } from '@inertiajs/react'
import React from 'react'

import {
  ColumnDef,
  DataTable,
  type OnChangeFn,
  type SortingState,
} from '@workspace/ui/components/data-table'
import { useDataTable } from '@workspace/ui/hooks/use-data-table'

import { useTranslation } from '#common/ui/hooks/use_translation'
import { DataTableRowActions } from '#users/ui/components/users_row_actions'
import UsersTableFilters from '#users/ui/components/users_table_filters'
import { Role } from '#users/ui/components/users_types'

import { mainRole, ROLES, type Role as RoleSlug } from '#users/enums/role'
import type { SortDirection, UsersSortBy } from '#users/enums/sort'

import type { Data } from '@generated/data'

interface DataTableProps {
  users: {
    data: Data.Users.User[]
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
  q: string | undefined
  selectedRoles: string[]
  sort: string | null
  order: string | null
}

export default function UsersTable({
  users,
  roles,
  q,
  selectedRoles,
  sort,
  order,
}: DataTableProps) {
  const { t } = useTranslation()

  const [querySearch, setQuerySearch] = React.useState(q || '')
  const [selectedRoleSlugs, setSelectedRoleSlugs] = React.useState<string[]>(selectedRoles ?? [])

  const sorting = React.useMemo<SortingState>(
    () => (sort && order ? [{ id: sort, desc: order === 'desc' }] : []),
    [sort, order]
  )

  const onSortingChange = React.useCallback<OnChangeFn<SortingState>>(
    (updater) => {
      const next = typeof updater === 'function' ? updater(sorting) : updater
      const first = next[0]
      const nextSort = (first?.id ?? undefined) as UsersSortBy | undefined
      const nextOrder: SortDirection | undefined = first
        ? first.desc
          ? 'desc'
          : 'asc'
        : undefined

      router.get(
        '/users',
        {
          q: querySearch.length > 0 ? querySearch : undefined,
          roles: selectedRoleSlugs.length > 0 ? selectedRoleSlugs : undefined,
          perPage: users.metadata.perPage,
          sort: nextSort,
          order: nextOrder,
        },
        {
          preserveState: true,
          preserveScroll: true,
          replace: true,
          only: ['users', 'sort', 'order'],
        }
      )
    },
    [sorting, querySearch, selectedRoleSlugs, users.metadata.perPage]
  )

  const remoteTableOptions = useDataTable({
    data: users,
    visit: ({ page, perPage }) => {
      return router.get(
        '/users',
        {
          page,
          perPage,
          q: querySearch.length > 0 ? querySearch : undefined,
          roles: selectedRoleSlugs.length > 0 ? selectedRoleSlugs : undefined,
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

  const columns: ColumnDef<Data.Users.User>[] = [
    {
      id: 'fullName',
      header: t('users.index.table.columns.full_name'),
      accessorKey: 'fullName',
      enableSorting: true,
      cell: ({ row }) => {
        const user = row.original
        const slug: RoleSlug = mainRole(user.roles) ?? ROLES.USER
        const userRole = roles.find(({ value }) => value === slug)
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
            <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground sm:hidden">
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
      meta: { columnClasses: 'hidden sm:table-cell' },
    },
    {
      id: 'role',
      accessorFn: (user) => mainRole(user.roles) ?? ROLES.USER,
      header: t('users.index.table.columns.role'),
      enableSorting: false,
      meta: { columnClasses: 'hidden md:table-cell' },
      cell: ({ row }) => {
        const slug: RoleSlug = mainRole(row.original.roles) ?? ROLES.USER
        const userRole = roles.find(({ value }) => value === slug)

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
      meta: { columnClasses: 'hidden lg:table-cell' },
      cell: ({ row }) =>
        row.original.createdAt ? new Date(row.original.createdAt).toLocaleDateString() : null,
    },
    {
      id: 'actions',
      enableSorting: false,
      meta: { columnClasses: 'w-[52px]' },
      cell: DataTableRowActions,
    },
  ]

  return (
    <div className="space-y-4">
      <UsersTableFilters
        roles={roles}
        querySearch={querySearch}
        setQuerySearch={setQuerySearch}
        selectedRoles={selectedRoleSlugs}
        setSelectedRoles={setSelectedRoleSlugs}
        perPage={users.metadata.perPage}
      />
      <DataTable
        columns={columns}
        data={users.data}
        t={t}
        remoteTableOptions={remoteTableOptions}
      />
    </div>
  )
}
