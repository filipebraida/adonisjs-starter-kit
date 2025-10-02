import TokenDto from '#users/dtos/token'

import { DataTable, DataTableToolbar, ColumnDef } from '@workspace/ui/components/data-table'

import { DataTableRowActions } from './tokens_row_actions'

import { useTranslation } from '#common/ui/hooks/use_translation'

interface DataTableProps {
  tokens: TokenDto[]
}

export default function TokensTable({ tokens }: DataTableProps) {
  const { t } = useTranslation()

  const columns: ColumnDef<TokenDto>[] = [
    {
      header: 'Name',
      accessorKey: 'name',
      cell: ({ row }) => {
        return row.original.name ? (
          row.original.name
        ) : (
          <span className="text-muted-foreground">
            <i>Not provided</i>
          </span>
        )
      },
    },
    {
      header: 'Created At',
      accessorKey: 'createdAt',
    },
    {
      header: 'Last Used At',
      accessorKey: 'lastUsedAt',
    },
    {
      id: 'actions',
      cell: DataTableRowActions,
    },
  ]

  return (
    <DataTable
      columns={columns}
      data={tokens}
      t={t}
      Toolbar={(props) => <DataTableToolbar {...props} t={t} />}
    />
  )
}
