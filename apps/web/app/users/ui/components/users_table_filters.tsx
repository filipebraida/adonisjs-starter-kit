import { FilterPanel, FiltersButton } from '@workspace/ui/components/filter-panel'
import { SearchInput } from '@workspace/ui/components/search-input'
import { TableToolbar, TableToolbarSearch } from '@workspace/ui/components/table-toolbar'

import { useSearchBox } from '#core/ui/hooks/use_search_box'
import { useTranslation } from '#core/ui/hooks/use_translation'
import { Role } from '#users/ui/components/users_types'

export type UsersFilters = { q: string; roles: string[] }

/** The search and the button that opens the filters. Their values come from the URL; a change asks for a new one. */
export default function UsersTableToolbar({
  q,
  selectedRoles,
  open,
  onOpenChange,
  onChange,
}: {
  q: string | null
  selectedRoles: string[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onChange: (filters: UsersFilters) => void
}) {
  const { t } = useTranslation()
  const { search, onChange: onSearch } = useSearchBox(q, (value) =>
    onChange({ q: value, roles: selectedRoles })
  )

  return (
    <TableToolbar>
      <TableToolbarSearch>
        <SearchInput
          value={search}
          onValueChange={onSearch}
          placeholder={t('users.index.table.filters.search_placeholder')}
          aria-label={t('users.index.table.filters.search_placeholder')}
          clearLabel={t('core.search.clear')}
        />
      </TableToolbarSearch>
      <FiltersButton count={selectedRoles.length} open={open} onClick={() => onOpenChange(!open)}>
        {t('core.table.filters.button')}
      </FiltersButton>
    </TableToolbar>
  )
}

/** The role filter, open inside the table's card. */
export function UsersTableFilterPanel({
  q,
  selectedRoles,
  roles,
  total,
  onChange,
  onClose,
}: {
  q: string | null
  selectedRoles: string[]
  roles: Role[]
  total: number
  onChange: (filters: UsersFilters) => void
  onClose: () => void
}) {
  const { t } = useTranslation()

  return (
    <FilterPanel
      groups={[{ id: 'roles', label: t('users.index.table.filters.role'), options: roles }]}
      value={{ roles: selectedRoles }}
      onValueChange={(next) => onChange({ q: q ?? '', roles: next.roles ?? [] })}
      summary={t('core.table.filters.summary', { total })}
      onClear={() => onChange({ q: q ?? '', roles: [] })}
      onClose={onClose}
      clearLabel={t('core.table.filters.clear')}
      closeLabel={t('core.table.filters.done')}
    />
  )
}
