import React from 'react'

import { DataTable as BaseDataTable, type RowData } from '@workspace/ui/components/data-table'

import { useTranslation } from '#core/ui/hooks/use_translation'

/** The shared DataTable with its texts in the user's language. */
export function DataTable<TData extends RowData>(
  props: Omit<React.ComponentProps<typeof BaseDataTable<TData>>, 'labels'>
) {
  const { t } = useTranslation()

  return (
    <BaseDataTable
      {...props}
      labels={{
        noResults: t('core.table.no_results'),
        rowsPerPage: t('core.table.pagination.rows_per_page'),
        pageOf: (current, total) => t('core.table.pagination.page_of', { current, total }),
        goFirstPage: t('core.table.pagination.go_first_page'),
        goPreviousPage: t('core.table.pagination.go_previous_page'),
        goNextPage: t('core.table.pagination.go_next_page'),
        goLastPage: t('core.table.pagination.go_last_page'),
      }}
    />
  )
}
