import { useState } from 'react'
import { useForm } from '@inertiajs/react'

import { AlertTriangleIcon } from 'lucide-react'
import { toast } from '@workspace/ui/hooks/use-toast'
import { Alert, AlertDescription, AlertTitle } from '@workspace/ui/components/alert'
import { Input } from '@workspace/ui/components/input'

import { ConfirmDialog } from '#common/ui/components/confirm_dialog'
import type TokenDto from '#users/dtos/token'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: TokenDto
}

export function TokensDeleteDialog({ open, onOpenChange, currentRow }: Props) {
  const [value, setValue] = useState('')
  const { delete: destroy } = useForm()

  const handleDelete = () => {
    if (value.trim() !== currentRow.name) return

    destroy(`/settings/tokens/${currentRow?.id}`, {
      preserveScroll: true,
      onSuccess: () => {
        onOpenChange(false)
        toast({
          title: 'The following token has been deleted:',
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
      handleConfirm={handleDelete}
      disabled={value.trim() !== currentRow.name}
      title={
        <span className="text-destructive flex items-center gap-2">
          <AlertTriangleIcon className="mr-1 inline-block stroke-destructive" size={18} />
          <span>Delete Token</span>
        </span>
      }
      desc={
        <div className="space-y-4">
          <p className="mb-2">
            Are you sure you want to delete <span className="font-bold">{currentRow.name}</span>
            ?
            <br />
            This action will permanently remove the token from the system. This cannot be undone.
          </p>

          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Enter the token name to confirm."
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
