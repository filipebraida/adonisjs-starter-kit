import * as React from 'react'
import { router } from '@inertiajs/react'
import { useDebounceCallback } from 'usehooks-ts'

import { X } from 'lucide-react'
import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import { CheckboxFilter } from '@workspace/ui/components/checkbox-filter'

import { useTranslation } from '#common/ui/hooks/use_translation'
import { Role } from '#users/ui/components/users_types'

export default function UsersTableFilters({
  querySearch,
  setQuerySearch,
  selectedRoles,
  setSelectedRoles,
  roles,
  perPage,
}: {
  querySearch: string
  setQuerySearch: React.Dispatch<React.SetStateAction<string>>
  selectedRoles: string[]
  setSelectedRoles: React.Dispatch<React.SetStateAction<string[]>>
  roles: Role[]
  perPage: number
}) {
  const { t } = useTranslation()

  const handleSubmit = React.useCallback(
    (querySearch: string, selectedRoles: string[], perPage: number) => {
      const data = {
        q: querySearch.length > 0 ? querySearch : undefined,
        roles: selectedRoles.length > 0 ? selectedRoles : undefined,
        perPage: perPage,
      }

      router.get('/users', data, {
        preserveScroll: true,
        preserveState: true,
        replace: true,
        only: ['users'],
      })
    },
    []
  )

  const debouncedSearch = useDebounceCallback(handleSubmit, 300)
  React.useEffect(() => () => debouncedSearch.cancel(), [debouncedSearch])

  const isFiltered = (querySearch?.trim()?.length ?? 0) > 0 || (selectedRoles?.length ?? 0) > 0

  const clearAll = () => {
    setQuerySearch('')
    setSelectedRoles([])
    handleSubmit('', [], perPage)
  }

  const handleSearch = (value: string) => {
    setQuerySearch(value)
    debouncedSearch(value, selectedRoles, perPage)
  }

  const handleRolesChange = (next: string[]) => {
    setSelectedRoles(next)
    handleSubmit(querySearch, next, perPage)
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

        <CheckboxFilter
          title={t('users.index.table.filters.role')}
          value={selectedRoles}
          onChange={handleRolesChange}
          options={roles}
          clearLabel={t('users.index.table.filters.clear_filters')}
          emptyMessage={t('users.index.table.filters.no_results')}
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
