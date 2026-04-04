import { useUsers } from '#users/ui/context/users_context'
import { UsersActionDialog } from '#users/ui/components/users_action_dialog'
import { UsersDeleteDialog } from '#users/ui/components/users_delete_dialog'
import { UsersInviteDialog } from '#users/ui/components/users_invite_dialog'
import { UsersImpersonateDialog } from '#users/ui/components/users_impersonate_dialog'
import { Role } from '#users/ui/components/users_types'

export function UsersDialogs({ roles }: { roles: Role[] }) {
  const { open, setOpen, currentRow, setCurrentRow } = useUsers()
  return (
    <>
      <UsersActionDialog
        key="user-add"
        roles={roles}
        open={open === 'add'}
        onOpenChange={(state) => setOpen(state ? 'add' : null)}
      />

      <UsersInviteDialog
        key="user-invite"
        roles={roles}
        open={open === 'invite'}
        onOpenChange={(state) => setOpen(state ? 'invite' : null)}
      />

      {currentRow && (
        <>
          <UsersImpersonateDialog
            key={`user-impersonate-${currentRow.id}`}
            open={open === 'impersonate'}
            onOpenChange={(state) => {
              setOpen(state ? 'impersonate' : null)
              if (!state) {
                setTimeout(() => {
                  setCurrentRow(null)
                }, 500)
              }
            }}
            currentRow={currentRow}
          />

          <UsersActionDialog
            key={`user-edit-${currentRow.id}`}
            roles={roles}
            open={open === 'edit'}
            onOpenChange={(state) => {
              setOpen(state ? 'edit' : null)
              if (!state) {
                setTimeout(() => {
                  setCurrentRow(null)
                }, 500)
              }
            }}
            currentRow={currentRow}
          />

          <UsersDeleteDialog
            key={`user-delete-${currentRow.id}`}
            open={open === 'delete'}
            onOpenChange={(state) => {
              setOpen(state ? 'delete' : null)
              if (!state) {
                setTimeout(() => {
                  setCurrentRow(null)
                }, 500)
              }
            }}
            currentRow={currentRow}
          />
        </>
      )}
    </>
  )
}
