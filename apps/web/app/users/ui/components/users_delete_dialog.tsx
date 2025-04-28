import { useState } from 'react'
import { useForm } from '@inertiajs/react'

import { AlertTriangleIcon } from 'lucide-react'
import { toast } from '@workspace/ui/hooks/use-toast'
import { Alert, AlertDescription, AlertTitle } from '@workspace/ui/components/alert'
import { Input } from '@workspace/ui/components/input'

import { ConfirmDialog } from '#common/ui/components/confirm_dialog'

import type UserDto from '#users/dtos/user'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: UserDto
}

export function UsersDeleteDialog({ open, onOpenChange, currentRow }: Props) {
  const [value, setValue] = useState('')
  const { delete: destroy } = useForm()

  const handleDelete = () => {
    if (value.trim() !== currentRow.email) return

    destroy(`/users/${currentRow?.id}`, {
      preserveScroll: true,
      onSuccess: () => {
        onOpenChange(false)
        toast('The following user has been deleted:', {
          description: (
            <div className="mt-2 max-w-[320px] overflow-x-auto rounded-md bg-slate-950 p-4">
              <pre className="text-white whitespace-pre-wrap break-words">
                <code>{JSON.stringify(currentRow, null, 2)}</code>
              </pre>
            </div>
          ),
        })
      },
    })
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      handleConfirm={handleDelete}
      disabled={value.trim() !== currentRow.email}
      title={
        <span className="text-destructive flex items-center gap-2">
          <AlertTriangleIcon className="mr-1 inline-block stroke-destructive" size={18} />
          <span>Delete User</span>
        </span>
      }
      desc={
        <div className="space-y-4">
          <p className="mb-2">
            Are you sure you want to delete <span className="font-bold">{currentRow.email}</span>
            ?
            <br />
            This action will permanently remove the user with the role of{' '}
            <span className="font-bold">{currentRow.role}</span> from the system. This cannot be
            undone.
          </p>

          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Enter email to confirm deletion."
          />

          <Alert variant="destructive">
            <AlertTitle>Warning!</AlertTitle>
            <AlertDescription>
              Please be carefull, this operation can not be rolled back.
            </AlertDescription>
          </Alert>
        </div>
      }
      confirmText="Delete"
      destructive
    />
  )
}
