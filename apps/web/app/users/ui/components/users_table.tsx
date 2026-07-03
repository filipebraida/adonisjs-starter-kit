import { router } from '@inertiajs/react'
import React from 'react'

import { ColumnDef, DataTable } from '@workspace/ui/components/data-table'
import { useDataTable } from '@workspace/ui/hooks/use-data-table'

import { useTranslation } from '#common/ui/hooks/use_translation'
import { DataTableRowActions } from '#users/ui/components/users_row_actions'
import UsersTableFilters from '#users/ui/components/users_table_filters'
import { Role } from '#users/ui/components/users_types'

import { mainRole, ROLES, type Role as RoleSlug } from '#users/enums/role'

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
}

export default function UsersTable({ users, roles, q, selectedRoles }: DataTableProps) {
  const { t } = useTranslation()

  const [querySearch, setQuerySearch] = React.useState(q || '')
  const [selectedRoleSlugs, setSelectedRoleSlugs] = React.useState<string[]>(selectedRoles ?? [])

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
        },
        {
          preserveState: true,
          preserveScroll: true,
          replace: true,
        }
      )
    },
  })

  const columns: ColumnDef<Data.Users.User>[] = [
    {
      header: t('users.index.table.columns.full_name'),
      accessorKey: 'fullName',
      cell: ({ row }) =>
        row.original.fullName ? (
          row.original.fullName
        ) : (
          <span className="text-muted-foreground">
            <i>{t('users.index.table.not_provided')}</i>
          </span>
        ),
    },
    {
      header: t('users.index.table.columns.email'),
      accessorKey: 'email',
    },
    {
      id: 'role',
      accessorFn: (user) => mainRole(user.roles) ?? ROLES.USER,
      header: t('users.index.table.columns.role'),
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
      id: 'actions',
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
