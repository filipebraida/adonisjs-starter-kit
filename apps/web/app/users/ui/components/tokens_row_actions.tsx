import { TrashIcon, EllipsisIcon } from 'lucide-react'

import { Button } from '@workspace/ui/components/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu'
import { DataTableRowActionsProps } from '@workspace/ui/components/data-table/data-table'

import { useTokens } from '#users/ui/context/tokens_context'

import type TokenDto from '#users/dtos/token'

export function DataTableRowActions({ row }: DataTableRowActionsProps<TokenDto>) {
  const { setOpen, setCurrentRow } = useTokens()

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex h-8 w-8 p-0 data-[state=open]:bg-muted">
            <EllipsisIcon className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px]">
          <DropdownMenuItem
            onClick={() => {
              setCurrentRow(row.original)
              setOpen('delete')
            }}
            className="!text-red-500"
          >
            Delete
            <DropdownMenuShortcut>
              <TrashIcon size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}
