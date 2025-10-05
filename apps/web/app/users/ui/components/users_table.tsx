import {
  DataTable,
  DataTableToolbar,
  ColumnDef,
  DataTableFacetedFilter,
} from '@workspace/ui/components/data-table'
import { Input } from '@workspace/ui/components/input'

import User from '#users/dtos/user'
import Role from '#users/dtos/role'

import { DataTableRowActions } from '#users/ui/components/users_row_actions'
import { userRoles } from '#users/ui/components/users_types'
import { useTranslation } from '#common/ui/hooks/use_translation'
import { router } from '@inertiajs/react'
import { useDataTable } from '@workspace/ui/hooks/use-data-table'

import type UserDto from '#users/dtos/user'
import type { SimplePaginatorDtoContract } from '@adocasts.com/dto/types'

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
    visit: ({ params }) => {
      return router.reload({
        data: params,
        replace: true,
        only: ['users'],
      })
    },
  })

  const columns: ColumnDef<User>[] = [
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
    <DataTable
      columns={columns}
      data={users.data}
      t={t}
      remoteTableOptions={remoteTableOptions}
      Toolbar={(props) => (
        <DataTableToolbar
          t={t}
          {...props}
          additionalFilters={
            <>
              <Input
                placeholder={t('users.index.table.filters.search_placeholder')}
                value={(props.table.getColumn('fullName')?.getFilterValue() as string) ?? ''}
                onChange={(event) =>
                  props.table.getColumn('fullName')?.setFilterValue(event.target.value)
                }
                className="h-8 w-[150px] lg:w-[250px]"
              />
              <DataTableFacetedFilter
                t={t}
                column={props.table.getColumn('roleId')}
                title={t('users.index.table.filters.role')}
                options={roles.map((role) => ({
                  value: String(role.id),
                  label: role.name,
                  icon: userRoles.find(({ id }) => id === role.id)?.icon,
                }))}
              />
            </>
          }
        />
      )}
    />
  )
}
