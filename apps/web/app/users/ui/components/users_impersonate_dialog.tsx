import { useForm } from '@inertiajs/react'

import { UserIcon } from 'lucide-react'
import { toast } from '@workspace/ui/hooks/use-toast'
import { Alert, AlertDescription, AlertTitle } from '@workspace/ui/components/alert'

import { ConfirmDialog } from '#common/ui/components/confirm_dialog'
import UserDto from '#users/dtos/user'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: UserDto
}

export function UsersImpersonateDialog({ open, onOpenChange, currentRow }: Props) {
  const { post } = useForm()

  const handleImpersonate = () => {
    post(`/users/impersonate/${currentRow?.id}`, {
      preserveScroll: true,
      onSuccess: () => {
        onOpenChange(false)
        toast({
          title: 'You are now impersonating the following user:',
          description: (
            <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
              <code className="text-white">{JSON.stringify(currentRow, null, 2)}</code>
            </pre>
          ),
        })
      },
    })
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      handleConfirm={handleImpersonate}
      title={
        <span className="flex items-center gap-2">
          <UserIcon className="mr-1 inline-block" size={18} />
          <span>Impersonate User</span>
        </span>
      }
      desc={
        <div className="space-y-4">
          <p className="mb-2">
            Are you sure you want to impersonate{' '}
            <span className="font-bold">{currentRow.email}</span>?
            <br />
            This action will allow you to act as this user (Role:{' '}
            <span className="font-bold">{currentRow.roleId}</span>) in the system.
          </p>

          <Alert>
            <AlertTitle>Note</AlertTitle>
            <AlertDescription>
              You can revert to your original account at any time by logging out.
            </AlertDescription>
          </Alert>
        </div>
      }
      confirmText="Impersonate"
    />
  )
}
