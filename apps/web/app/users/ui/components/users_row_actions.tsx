import { EditIcon, TrashIcon, EllipsisIcon, UserRoundSearch } from 'lucide-react'

import { Button } from '@workspace/ui/components/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu'
import { DataTableRowActionsProps } from '@workspace/ui/components/data-table/data-table'

import { useUsers } from '#users/ui/context/users_context'

import type UserDto from '#users/dtos/user'
import useUser from '#auth/ui/hooks/use_user'

export function DataTableRowActions({ row }: DataTableRowActionsProps<UserDto>) {
  const { setOpen, setCurrentRow } = useUsers()
  const user = useUser()

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
          {user.id !== row.original.id && (
            <DropdownMenuItem
              onClick={() => {
                setCurrentRow(row.original)
                setOpen('impersonate')
              }}
            >
              Login as
              <DropdownMenuShortcut>
                <UserRoundSearch size={16} />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            onClick={() => {
              setCurrentRow(row.original)
              setOpen('edit')
            }}
          >
            Edit
            <DropdownMenuShortcut>
              <EditIcon size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
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
