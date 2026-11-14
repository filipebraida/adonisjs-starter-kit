import { useState } from 'react'
import { EditIcon, EllipsisIcon, History, TrashIcon, UserRoundSearch } from 'lucide-react'
import { Link } from '@inertiajs/react'
import { useCan } from '@adonis-agora/authz-react'
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
import useUser from '#core/ui/hooks/use_user'
import { useTranslation } from '#core/ui/hooks/use_translation'

import { UsersDeleteDialog } from '#users/ui/components/users_delete_dialog'
import { UsersImpersonateDialog } from '#users/ui/components/users_impersonate_dialog'
import { CAPABILITIES_USERS } from '#users/enums/capability'

import type { Data } from '@generated/data'

export function DataTableRowActions({
  row,
}: DataTableRowActionsProps<Data.Users.User.Variants['forList']>) {
  const user = useUser()
  const { t } = useTranslation()

  const canAudit = useCan(CAPABILITIES_USERS.usersAudit)
  const [openDelete, setOpenDelete] = useState(false)
  const [openImpersonate, setOpenImpersonate] = useState(false)

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
          {user.id !== row.original.id && (
            <DropdownMenuItem onClick={() => setOpenImpersonate(true)}>
              {t('users.index.table.row_actions.impersonate')}
              <DropdownMenuShortcut>
                <UserRoundSearch size={16} />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          )}
          {canAudit && (
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
          {user.id !== row.original.id && (
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
