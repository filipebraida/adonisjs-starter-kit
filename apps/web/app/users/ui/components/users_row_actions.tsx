import { useState } from 'react'
import { EditIcon, EllipsisIcon, History, TrashIcon, UserRoundSearch } from 'lucide-react'
import { Link } from '@inertiajs/react'
import { ModalLink } from 'adonis-inertia-modal/react'

import { Button } from '@workspace/ui/components/button'
import { DataTableRowActionsProps } from '@workspace/ui/components/data-table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu'

import { urlFor } from '~/app/client'
import { useTranslation } from '#core/ui/hooks/use_translation'

import { UsersDeleteDialog } from '#users/ui/components/users_delete_dialog'
import { UsersImpersonateDialog } from '#users/ui/components/users_impersonate_dialog'
import usePageProps from '#core/ui/hooks/use_page_props'
import type { UsersPagePermissions } from '#users/ui/components/users_types'

import type { Data } from '@generated/data'

export function DataTableRowActions({
  row,
}: DataTableRowActionsProps<Data.Users.User.Variants['forList']>) {
  const { t } = useTranslation()

  // Decided by the policies in the controller, for the page and for this row.
  const { can, rowCan } = usePageProps<UsersPagePermissions>()
  const rowAbilities = rowCan[row.original.id]
  const [openDelete, setOpenDelete] = useState(false)
  const [openImpersonate, setOpenImpersonate] = useState(false)

  const hasActions =
    can.viewActivity || rowAbilities?.impersonate || rowAbilities?.update || rowAbilities?.delete
  if (!hasActions) return null

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <EllipsisIcon className="h-4 w-4" />
            <span className="sr-only">{t('users.index.table.row_actions.open_menu')}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          {rowAbilities?.impersonate && (
            <DropdownMenuItem onClick={() => setOpenImpersonate(true)}>
              {t('users.index.table.row_actions.impersonate')}
              <DropdownMenuShortcut>
                <UserRoundSearch size={16} />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          )}
          {can.viewActivity && (
            <DropdownMenuItem asChild>
              <Link
                href={urlFor('users.activity', {}, { qs: { actorId: row.original.id } })}
                className="flex w-full items-center justify-between"
              >
                {t('users.index.table.row_actions.activity')}
                <DropdownMenuShortcut>
                  <History size={16} />
                </DropdownMenuShortcut>
              </Link>
            </DropdownMenuItem>
          )}
          {rowAbilities?.update && (
            <DropdownMenuItem asChild>
              <ModalLink
                href={urlFor('users.edit', { id: row.original.id })}
                className="flex w-full items-center justify-between"
              >
                {t('users.index.table.row_actions.edit')}
                <DropdownMenuShortcut>
                  <EditIcon size={16} />
                </DropdownMenuShortcut>
              </ModalLink>
            </DropdownMenuItem>
          )}
          {rowAbilities?.delete && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setOpenDelete(true)} variant="destructive">
                {t('users.index.table.row_actions.delete')}
                <DropdownMenuShortcut>
                  <TrashIcon size={16} />
                </DropdownMenuShortcut>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <UsersDeleteDialog open={openDelete} onOpenChange={setOpenDelete} currentRow={row.original} />
      <UsersImpersonateDialog
        open={openImpersonate}
        onOpenChange={setOpenImpersonate}
        currentRow={row.original}
      />
    </>
  )
}
