import { router } from '@inertiajs/react'
import type { SimplePaginatorDtoContract } from '@adocasts.com/dto/types'

import { DataTable, ColumnDef } from '@workspace/ui/components/data-table'
import { useDataTable } from '@workspace/ui/hooks/use-data-table'

import UsersTableFilters from '#users/ui/components/users_table_filters'
import { DataTableRowActions } from '#users/ui/components/users_row_actions'
import { userRoles } from '#users/ui/components/users_types'
import { useTranslation } from '#common/ui/hooks/use_translation'

import type Role from '#users/dtos/role'
import type UserDto from '#users/dtos/user'
import React from 'react'

interface DataTableProps {
  users: SimplePaginatorDtoContract<UserDto>
  roles: Role[]
  q: string | undefined
  selectedRoles: number[]
}

export default function UsersTable({ users, roles, q, selectedRoles }: DataTableProps) {
  const { t } = useTranslation()

  const [querySearch, setQuerySearch] = React.useState(q || '')
  const [roleIds, setRoleIds] = React.useState<string[]>(
    selectedRoles ? selectedRoles.map(String) : []
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
          roleIds: roleIds.length > 0 ? roleIds : undefined,
        },
        {
          preserveState: true,
          preserveScroll: true,
          replace: true,
        }
      )
    },
  })

  const columns: ColumnDef<UserDto>[] = [
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
      accessorKey: 'roleId',
      accessorFn: (user) => String(user.roleId),
      header: t('users.index.table.columns.role'),
      cell: ({ row }) => {
        const { roleId } = row.original
        const role = roles.find((role) => role.id === roleId)

        if (!role) {
          return null
        }

        const userRole = userRoles.find(({ id }) => id === roleId)

        return (
          <div className="flex gap-x-2 items-center">
            {userRole && userRole.icon && (
              <userRole.icon size={16} className="text-muted-foreground" />
            )}
            <span className="capitalize text-sm">{role.name}</span>
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
        roleIds={roleIds}
        setRoleIds={setRoleIds}
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
