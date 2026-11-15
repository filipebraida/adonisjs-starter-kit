import { CheckboxFilter } from '@workspace/ui/components/checkbox-filter'
import { FilterBar } from '@workspace/ui/components/filter-bar'
import { SearchInput } from '@workspace/ui/components/search-input'

import { useSearchBox } from '#core/ui/hooks/use_search_box'
import { useTranslation } from '#core/ui/hooks/use_translation'
import { Role } from '#users/ui/components/users_types'

export type UsersFilters = { q: string; roles: string[] }

/** The search and the role filter. Their values come from the URL; a change asks for a new one. */
export default function UsersTableFilters({
  q,
  selectedRoles,
  roles,
  onChange,
}: {
  q: string | null
  selectedRoles: string[]
  roles: Role[]
  onChange: (filters: UsersFilters) => void
}) {
  const { t } = useTranslation()
  const { search, onChange: onSearch } = useSearchBox(q, (value) =>
    onChange({ q: value, roles: selectedRoles })
  )

  return (
    <FilterBar
      filtered={!!q || selectedRoles.length > 0}
      onClear={() => onChange({ q: '', roles: [] })}
      clearLabel={t('core.table.filters.clear')}
    >
      <SearchInput
        value={search}
        onValueChange={onSearch}
        placeholder={t('users.index.table.filters.search_placeholder')}
        aria-label={t('users.index.table.filters.search_placeholder')}
        clearLabel={t('core.search.clear')}
      />
      <CheckboxFilter
        title={t('users.index.table.filters.role')}
        value={selectedRoles}
        onChange={(next) => onChange({ q: q ?? '', roles: next })}
        options={roles}
        clearLabel={t('users.index.table.filters.clear_filters')}
        emptyMessage={t('users.index.table.filters.no_results')}
      />
    </FilterBar>
  )
}
