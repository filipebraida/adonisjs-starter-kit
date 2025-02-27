import { useUsers } from '#users/ui/context/users_context'
import { UsersActionDialog } from '#users/ui/components/users_action_dialog'
import { UsersDeleteDialog } from '#users/ui/components/users_delete_dialog'
import { UsersInviteDialog } from '#users/ui/components/users_invite_dialog'
import { UsersImpersonateDialog } from '#users/ui/components/users_impersonate_dialog'

import RoleDto from '#users/dtos/role'

export function UsersDialogs({ roles }: { roles: RoleDto[] }) {
  const { open, setOpen, currentRow, setCurrentRow } = useUsers()
  return (
    <>
      <UsersActionDialog
        key="user-add"
        roles={roles}
        open={open === 'add'}
        onOpenChange={() => setOpen('add')}
      />

      <UsersInviteDialog
        key="user-invite"
        roles={roles}
        open={open === 'invite'}
        onOpenChange={() => setOpen('invite')}
      />

      {currentRow && (
        <>
          <UsersImpersonateDialog
            key={`user-impersonate-${currentRow.id}`}
            open={open === 'impersonate'}
            onOpenChange={() => {
              setOpen('impersonate')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />

          <UsersActionDialog
            key={`user-edit-${currentRow.id}`}
            roles={roles}
            open={open === 'edit'}
            onOpenChange={() => {
              setOpen('edit')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />

          <UsersDeleteDialog
            key={`user-delete-${currentRow.id}`}
            open={open === 'delete'}
            onOpenChange={() => {
              setOpen('delete')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />
        </>
      )}
    </>
  )
}
