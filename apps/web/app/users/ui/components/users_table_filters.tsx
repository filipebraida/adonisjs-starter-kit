import * as React from 'react'
import { router } from '@inertiajs/react'
import { useDebounceCallback } from 'usehooks-ts'

import { X } from 'lucide-react'
import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'

import { useTranslation } from '#common/ui/hooks/use_translation'
import { userRoles } from '#users/ui/components/users_types'
import UsersRoleFilter from '#users/ui/components/users_role_filter'

import type Role from '#users/dtos/role'

type Option = {
  label: string
  value: string
  icon?: React.ComponentType<{ className?: string }>
}

export default function UsersTableFilters({
  roles,
  q,
  selectedRoles,
}: {
  roles: Role[]
  q: string | undefined
  selectedRoles: number[]
}) {
  const { t } = useTranslation()

  const [querySearch, setQuerySearch] = React.useState(q || '')
  const [roleIds, setRoleIds] = React.useState<string[]>(
    selectedRoles ? selectedRoles.map(String) : []
  )

  const handleSubmit = React.useCallback((querySearch: string, roleIds: string[]) => {
    const data = {
      q: querySearch.length > 0 ? querySearch : undefined,
      roleIds: roleIds.length > 0 ? roleIds : undefined,
    }

    router.get('/users', data, {
      preserveScroll: true,
      preserveState: true,
      replace: true,
      only: ['users'],
    })
  }, [])

  const debouncedSearch = useDebounceCallback(handleSubmit, 300)
  React.useEffect(() => () => debouncedSearch.cancel(), [debouncedSearch])

  const isFiltered = (querySearch?.trim()?.length ?? 0) > 0 || (selectedRoles?.length ?? 0) > 0

  const clearAll = () => {
    setQuerySearch('')
    setRoleIds([])
    handleSubmit('', [])
  }

  const handleSearch = (value: string) => {
    setQuerySearch(value)
    debouncedSearch(value, roleIds)
  }

  const options: Option[] = React.useMemo(
    () =>
      roles.map((role) => ({
        value: String(role.id),
        label: role.name,
        icon: userRoles.find(({ id }) => id === role.id)?.icon,
      })),
    [roles]
  )

  const handleRolesChange = (next: string[]) => {
    setRoleIds(next)
    handleSubmit(querySearch, next)
  }

  return (
    <div className="flex items-center justify-start">
      <div className="flex items-center gap-2 flex-wrap">
        <Input
          placeholder={t('users.index.table.filters.search_placeholder')}
          value={querySearch}
          onChange={(e) => handleSearch(e.target.value)}
          className="h-8 w-[150px] lg:w-[250px]"
        />

        <UsersRoleFilter
          title={t('users.index.table.filters.role')}
          value={roleIds}
          onChange={handleRolesChange}
          options={options}
          t={t}
        />
      </div>

      {isFiltered && (
        <Button variant="ghost" onClick={clearAll} className="h-8 px-2 lg:px-3">
          {t('users.index.table.row_actions.clear')}
          <X />
        </Button>
      )}
    </div>
  )
}
