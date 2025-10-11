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

interface DataTableProps {
  users: SimplePaginatorDtoContract<UserDto>
  roles: Role[]
}

export default function UsersTable({ users, roles }: DataTableProps) {
  const { t } = useTranslation()

  const remoteTableOptions = useDataTable({
    meta: users.meta,
    baseUrl: '/users',
    currentSearch: window.location.search,
    visit: ({ url, params }) => {
      return router.get(url ?? '/users', params, {
        preserveState: true,
        preserveScroll: true,
        replace: true,
      })
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
      <UsersTableFilters roles={roles} />
      <DataTable
        columns={columns}
        data={users.data}
        t={t}
        remoteTableOptions={remoteTableOptions}
      />
    </div>
  )
}
